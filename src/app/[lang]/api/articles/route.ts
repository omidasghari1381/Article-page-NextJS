import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDataSource } from "@/server/db/typeorm.datasource";
import {
  ArticleService,
  type CreateArticleInput,
} from "@/server/modules/articles/services/article.service";

export const runtime = "nodejs";

/** ---------------- Schemas ---------------- */

const UuidStr = z.string().uuid();

// فقط URL مجازه (اختیاری)
const Thumbnail = z
  .string()
  .trim()
  .url({ message: "thumbnail باید URL معتبر باشد" })
  .optional()
  .nullable();

const CreateArticleNewSchema = z.object({
  title: z.string().min(2).max(200),
  subject: z.string().trim().optional().nullable(),
  mainText: z.string().min(1),

  secondaryText: z.string().optional().nullable(),
  introduction: z.string().optional().nullable(),
  quotes: z.string().optional().nullable(),

  /** روابط */
  categoryId: UuidStr, // اجباری و تکی
  tagIds: z.array(UuidStr).optional(), // اختیاری

  /** فقط URL (نه UUID) */
  thumbnail: Thumbnail,

  /** سایر */
  readingPeriod: z.coerce.number().int().min(0),
  summery: z.array(z.string().min(1)).optional().nullable(),
  slug: z.string().trim().max(220).optional().nullable(),
});

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  categoryId: UuidStr.optional(),
  tagId: UuidStr.optional(),
  q: z.string().trim().optional(),
});

/** ---------------- Helpers ---------------- */

function isHttpUrl(v: unknown): v is string {
  return typeof v === "string" && /^https?:\/\//i.test(v.trim());
}

/** ورودی‌های قدیمی → مدل جدید؛ فقط URL برای thumbnail نگه می‌داریم */
function normalizeLegacyCreatePayload(raw: any): CreateArticleInput {
  // categoryId: اگر قبلاً categoryIds آرایه بود، اولین عضو
  const catId =
    typeof raw?.categoryId === "string"
      ? raw.categoryId
      : Array.isArray(raw?.categoryIds) && typeof raw.categoryIds[0] === "string"
      ? raw.categoryIds[0]
      : undefined;

  // فقط URL معتبر را قبول کن؛ هر چیز دیگر (از جمله thumbnailId) نادیده
  const thumbnailUrl = isHttpUrl(raw?.thumbnail) ? raw.thumbnail.trim() : null;

  return {
    title: String(raw?.title ?? "").trim(),
    subject: typeof raw?.subject === "string" ? raw.subject : null,
    mainText: String(raw?.mainText ?? ""),

    // secondaryText / secondryText
    secondaryText:
      typeof raw?.secondaryText === "string"
        ? raw.secondaryText
        : typeof raw?.secondryText === "string"
        ? raw.secondryText
        : null,

    // introduction / Introduction
    introduction:
      typeof raw?.introduction === "string"
        ? raw.introduction
        : typeof raw?.Introduction === "string"
        ? raw.Introduction
        : null,

    quotes: typeof raw?.quotes === "string" ? raw.quotes : null,

    categoryId: catId as any, // تأیید نهایی با Zod
    tagIds: Array.isArray(raw?.tagIds) ? raw.tagIds : undefined,

    // فقط URL یا null
    thumbnail: thumbnailUrl,

    readingPeriod:
      typeof raw?.readingPeriod === "number"
        ? raw.readingPeriod
        : Number(raw?.readingPeriod ?? 0) || 0,

    // summery / summery
    summery: Array.isArray(raw?.summery)
      ? raw.summery
      : Array.isArray(raw?.summery)
      ? raw.summery
      : null,

    slug:
      typeof raw?.slug === "string" && raw.slug.trim().length
        ? raw.slug.trim()
        : null,
  };
}

/** ---------------- Handlers ---------------- */

export async function POST(req: NextRequest) {
  try {
    const ds = await getDataSource();
    const service = new ArticleService(ds);

    const raw = await req.json();

    // 1) نرمالایز (فقط URL برای thumbnail)
    const normalized = normalizeLegacyCreatePayload(raw);

    // 2) اعتبارسنجی
    const parsed = CreateArticleNewSchema.safeParse(normalized);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ValidationError", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 3) authorId از سشن (یا بدنه به عنوان fallback)
    const session = await getServerSession(authOptions);
    const authorId =
      (session?.user as any)?.id ||
      (typeof raw?.authorId === "string" ? raw.authorId : "");
    if (!authorId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "شناسه نویسنده پیدا نشد. ابتدا وارد حساب شوید.",
        },
        { status: 401 }
      );
    }

    const saved = await service.create(parsed.data, authorId);
    return NextResponse.json({ success: true, id: saved.id }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/articles error:", err);
    return NextResponse.json(
      { error: "ServerError", message: "مشکل داخلی سرور" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const ds = await getDataSource();
    const service = new ArticleService(ds);

    const sp = new URL(req.url).searchParams;

    const parsed = ListQuerySchema.safeParse({
      page: sp.get("page") ?? undefined,
      perPage: sp.get("perPage") ?? undefined,
      categoryId: sp.get("categoryId") ?? undefined,
      tagId: sp.get("tagId") ?? undefined,
      q: sp.get("q") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ValidationError", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const list = await service.list(parsed.data);
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("GET /api/articles error:", err);
    return NextResponse.json(
      { error: "ServerError", message: "مشکل داخلی سرور" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ds = await getDataSource();
    const svc = new ArticleService(ds);

    const body = await req.json();
    const id = (body as { id?: string })?.id;
    if (!id) {
      return NextResponse.json(
        { error: "ValidationError", message: "شناسه (id) الزامی است." },
        { status: 400 }
      );
    }

    const ok = await svc.delete(id);
    if (!ok) {
      return NextResponse.json(
        { error: "NotFound", message: "مقاله پیدا نشد." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("DELETE /api/articles error:", err);
    return NextResponse.json(
        { error: "ServerError", message: "مشکل داخلی سرور" },
        { status: 500 }
    );
  }
}

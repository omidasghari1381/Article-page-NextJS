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

/** ---------------- Zod Schemas (هماهنگ با سرویس جدید) ---------------- */

const UuidStr = z.string().uuid();

const CreateArticleNewSchema = z.object({
  title: z.string().min(2).max(200),
  subject: z.string().trim().optional().nullable(),
  mainText: z.string().min(1),

  secondaryText: z.string().optional().nullable(),
  introduction: z.string().optional().nullable(),
  quotes: z.string().optional().nullable(),

  /** روابط (جدید و هماهنگ با سرویس) */
  categoryId: UuidStr, // ✅ اجباری و تکی
  tagIds: z.array(UuidStr).optional(), // اختیاری (چندتایی)

  /** Thumbnail فقط URL */
  thumbnail: z.string().url().optional().nullable(),

  /** سایر */
  readingPeriod: z.coerce.number().int().min(0),
  summary: z.array(z.string().min(1)).optional().nullable(),
  slug: z.string().trim().max(220).optional().nullable(),
});

/** لیست: فیلترها */
const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  categoryId: UuidStr.optional(),
  tagId: UuidStr.optional(),
  q: z.string().trim().optional(),
});

/** ---------------- Helpers ---------------- */

/** تبدیل ورودی‌های قدیمی -> مدل جدید سرویس */
function normalizeLegacyCreatePayload(raw: any): CreateArticleInput {
  // تعیین categoryId:
  // - اگر raw.categoryId بود (UUID) همونو بردار
  // - اگر raw.categoryIds آرایه بود، اولین عضو رو بردار
  // - در غیر این صورت undefined می‌مونه و Zod ارور می‌ده
  const legacyCatId =
    typeof raw?.categoryId === "string"
      ? raw.categoryId
      : Array.isArray(raw?.categoryIds) &&
        typeof raw.categoryIds[0] === "string"
      ? raw.categoryIds[0]
      : undefined;

  // تعیین thumbnail (فقط URL):
  // - اگر raw.thumbnail رشته بوده، همونو بذار
  // - اگر raw.thumbnailId قبلاً استفاده می‌شد، دیگه نذاریم (سرویس URL می‌خواد)
  const thumbUrl =
    typeof raw?.thumbnail === "string" && raw.thumbnail.trim().length
      ? raw.thumbnail.trim()
      : null;

  return {
    title: String(raw?.title ?? "").trim(),
    subject: typeof raw?.subject === "string" ? raw.subject : null,
    mainText: String(raw?.mainText ?? ""),

    // پشتیبانی از secondaryText / secondryText
    secondaryText:
      typeof raw?.secondaryText === "string"
        ? raw.secondaryText
        : typeof raw?.secondryText === "string"
        ? raw.secondryText
        : null,

    // پشتیبانی از introduction / Introduction
    introduction:
      typeof raw?.introduction === "string"
        ? raw.introduction
        : typeof raw?.Introduction === "string"
        ? raw.Introduction
        : null,

    quotes: typeof raw?.quotes === "string" ? raw.quotes : null,

    /** روابط (جدید) */
    categoryId: legacyCatId as any, // می‌ذاریم Zod تایید نهایی کنه
    tagIds: Array.isArray(raw?.tagIds) ? raw.tagIds : undefined,

    /** Thumbnail: URL یا null */
    thumbnail: thumbUrl,

    /** سایر */
    readingPeriod:
      typeof raw?.readingPeriod === "number"
        ? raw.readingPeriod
        : Number(raw?.readingPeriod ?? 0) || 0,

    // summary: پشتیبانی از summary و summery
    summary: Array.isArray(raw?.summary)
      ? raw.summary
      : Array.isArray(raw?.summery)
      ? raw.summery
      : null,

    // اختیاری برای SEO/Route
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
    const svc = new ArticleService(ds);

    const raw = await req.json();

    // 1) نرمالایز legacy -> new
    const normalized = normalizeLegacyCreatePayload(raw);

    // 2) اعتبارسنجی طبق مدل جدید (الزام categoryId + thumbnail URL)
    const parsed = CreateArticleNewSchema.safeParse(normalized);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ValidationError", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 3) authorId از سشن یا از بدنه (fallback)
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

    const saved = await svc.create(parsed.data, authorId);
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

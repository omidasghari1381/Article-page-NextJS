import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { ArticleService } from "@/server/modules/articles/services/article.service";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export const runtime = "nodejs";

const UpdateArticleSchema = z.object({
  title: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).nullable().optional(),
  subject: z.string().trim().nullable().optional(),
  mainText: z.string().min(1).optional(),
  secondaryText: z.string().nullable().optional(),
  introduction: z.string().nullable().optional(),
  quotes: z.string().nullable().optional(),
  readingPeriod: z.number().int().nonnegative().optional(),
  summery: z.array(z.string()).optional().nullable(),

  // روابط
  categoryId: z.string().uuid().optional(), // الزامی فقط وقتی میاد
  tagIds: z.array(z.string().uuid()).optional(),

  // فقط URL یا null
  thumbnail: z.string().url().optional().or(z.literal(null)),
});

type Ctx = { params: Promise<{ id: string }> };

const IdSchema = z.object({ id: z.string().uuid("Invalid article id") });

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const raw = await ctx.params;
    const parsed = IdSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "ValidationError" }, { status: 400 });
    }

    const ds = await getDataSource();
    const service = new ArticleService(ds);

    const dto = await service.getByIdAndIncrementView(parsed.data.id);
    if (!dto) return NextResponse.json({ error: "NotFound" }, { status: 404 });
    return NextResponse.json(dto, { status: 200 });
  } catch (e) {
    console.error("GET /api/articles/[id] error:", e);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // احراز هویت
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // گرفتن id از پارامز
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { message: "Article id is required" },
        { status: 400 }
      );
    }

    // بدنه و اعتبارسنجی
    const json = await req.json().catch(() => ({}));
    const parsed = UpdateArticleSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "ValidationError", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // آماده‌سازی سرویس
    const ds = await getDataSource();
    const service = new ArticleService(ds);

    // آپدیت
    const dto = await service.update(id, parsed.data);

    return NextResponse.json(dto, { status: 200 });
  } catch (err: any) {
    const msg = String(err?.message || "UnknownError");

    // نگاشت خطاهای دامین به استاتوس مناسب
    if (msg === "ArticleNotFound") {
      return NextResponse.json({ message: msg }, { status: 404 });
    }
    if (msg === "CategoryRequired" || msg === "SomeTagIdsNotFound") {
      return NextResponse.json({ message: msg }, { status: 400 });
    }
    if (msg === "CategoryNotFound") {
      return NextResponse.json({ message: msg }, { status: 404 });
    }

    // سایر خطاها
    console.error("PATCH /api/articles/[id] error:", err);
    return NextResponse.json(
      { message: "InternalServerError" },
      { status: 500 }
    );
  }
}

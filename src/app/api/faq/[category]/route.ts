// src/app/api/faq/[category]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { FAQ } from "@/server/modules/faq/entities/faq.entity";
import { faqCategory } from "@/server/modules/faq/enums/faqCategory.enum";

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().optional(),
});

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await ctx.params;
    const CatSchema = z.nativeEnum(faqCategory);
    const parsedCat = CatSchema.safeParse(category);
    if (!parsedCat.success) {
      return NextResponse.json(
        { error: "ValidationError", message: "دسته‌بندی نامعتبر است." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const parsedQuery = QuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      perPage: searchParams.get("perPage") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    });
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "ValidationError", details: parsedQuery.error.flatten() },
        { status: 400 }
      );
    }

    const { page, perPage, q } = parsedQuery.data;
    const skip = (page - 1) * perPage;

    const ds = await getDataSource();
    const repo = ds.getRepository(FAQ);

    const qb = repo
      .createQueryBuilder("f")
      .where("f.category = :cat", { cat: parsedCat.data });

    if (q) {
      qb.andWhere("(f.question LIKE :q OR f.answer LIKE :q)", {
        q: `%${q}%`,
      });
    }

    qb.orderBy("f.createdAt", "DESC").skip(skip).take(perPage);

    const [items, total] = await qb.getManyAndCount();

    return NextResponse.json({
      page,
      perPage,
      total,
      items: items.map((it) => ({
        id: it.id,
        question: it.question,
        answer: it.answer,
        category: it.category,
      })),
    });
  } catch (err: any) {
    console.error("GET /api/faq/[category] error:", err);
    return NextResponse.json(
      { error: "ServerError", message: "مشکل داخلی سرور" },
      { status: 500 }
    );
  }
}

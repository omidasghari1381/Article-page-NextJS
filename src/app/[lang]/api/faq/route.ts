// src/server/modules/faq/faq.adapter.ts
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { faqCategory } from "@/server/modules/faq/enums/faqCategory.enum";
import { FAQ } from "@/server/modules/faq/entities/faq.entity";

const CreateFAQSchema = z.object({
  question: z.string().min(2).max(256),
  answer: z.string().min(2).max(1000),
  category: z.nativeEnum(faqCategory),
});

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  category: z.nativeEnum(faqCategory).optional(),
  q: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ds = await getDataSource();
    const body = await req.json();
    const parsed = CreateFAQSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ValidationError", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const authorId = session?.user as any;
    if (!authorId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "شناسه نویسنده پیدا نشد. ابتدا وارد حساب شوید.",
        },
        { status: 401 }
      );
    }
    const FAQRepo = ds.getRepository(FAQ);
    const faq = FAQRepo.create({
      question: parsed.data.question,
      answer: parsed.data.answer,
      category: parsed.data.category,
    });
    const saved = await FAQRepo.save(faq);
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
    const { searchParams } = new URL(req.url);
    const parsed = ListQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      perPage: searchParams.get("perPage") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ValidationError", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { page, perPage, category, q } = parsed.data;
    const skip = (page - 1) * perPage;
    const FAQRepo = ds.getRepository(FAQ);
    const where: any = {};
    if (category) where.category = category;
    const qb = FAQRepo.createQueryBuilder("a")
      .leftJoinAndSelect("a.author", "author")
      .where(where);

    qb.orderBy("a.createdAt", "DESC").skip(skip).take(perPage);

    const [items, total] = await qb.getManyAndCount();

    return NextResponse.json({
      page,
      perPage,
      total,
      items: items.map((it) => ({
        id: it.id,
        question: it.question,
        category: it.category,
        answer: it.answer,
      })),
    });
  } catch (err: any) {
    console.error("GET /api/faq error:", err);
    return NextResponse.json(
      { error: "ServerError", message: "مشکل داخلی سرور" },
      { status: 500 }
    );
  }
}

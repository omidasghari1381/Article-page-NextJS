import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDataSource } from "@/server/db/typeorm.datasource";

import { Article } from "@/server/modules/articles/entities/article.entity";
import { User } from "@/server/modules/users/entities/user.entity";
import { articleCategoryEnum } from "@/server/modules/articles/enums/articleCategory.enum";

const CreateArticleSchema = z.object({
  title: z.string().min(2).max(200),
  authorId: z.string().uuid().optional(),
  subject: z.string().min(1),
  mainText: z.string().min(1),
  secondryText: z.string().min(1),
  thumbnail: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  Introduction: z.string().max(5000).optional(),
  quotes: z.string().max(5000).optional(),
  category: z.nativeEnum(articleCategoryEnum),
  readingPeriod: z.string().min(1).max(256),
  summery: z.array(z.string().min(1)),
});

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  category: z.nativeEnum(articleCategoryEnum).optional(),
  q: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ds = await getDataSource();
    const body = await req.json();
    const parsed = CreateArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ValidationError", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const authorId = (session?.user as any)?.id || parsed.data.authorId;

    if (!authorId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "شناسه نویسنده پیدا نشد. ابتدا وارد حساب شوید.",
        },
        { status: 401 }
      );
    }

    const userRepo = ds.getRepository(User);
    const author = await userRepo.findOne({ where: { id: authorId } });
    if (!author) {
      return NextResponse.json(
        { error: "NotFound", message: "کاربر نویسنده یافت نشد." },
        { status: 404 }
      );
    }

    const articleRepo = ds.getRepository(Article);

    const article = articleRepo.create({
      title: parsed.data.title,
      subject: parsed.data.subject,
      author,
      mainText: parsed.data.mainText,
      summery: parsed.data.summery,
      secondryText: parsed.data.secondryText,
      thumbnail: parsed.data.thumbnail || null,
      Introduction: parsed.data.Introduction || null,
      quotes: parsed.data.quotes || null,
      category: parsed.data.category,
      readingPeriod: parsed.data.readingPeriod,
    });

    const saved = await articleRepo.save(article);

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

    const articleRepo = ds.getRepository(Article);

    const where: any = {};
    if (category) where.category = category;

    const qb = articleRepo
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.author", "author")
      .where(where);

    if (q) {
      qb.andWhere("(a.title LIKE :q )", {
        q: `%${q}%`,
      });
    }

    qb.orderBy("a.createdAt", "DESC").skip(skip).take(perPage);

    const [items, total] = await qb.getManyAndCount();
    return NextResponse.json({
      page,
      perPage,
      total,
      items: items.map((it) => ({
        id: it.id,
        subject: it.subject,
        category: it.category,
        readingPeriod: it.readingPeriod,
        viewCount: it.viewCount,
        summery: it.summery,
        thumbnail: it.thumbnail,
        quotes: it.quotes,
        author: {
          id: (it.author as any)?.id,
          firstName: (it.author as any)?.firstName,
          lastName: (it.author as any)?.lastName,
        },
        createdAt: it.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("GET /api/articles error:", err);
    return NextResponse.json(
      { error: "ServerError", message: "مشکل داخلی سرور" },
      { status: 500 }
    );
  }
}

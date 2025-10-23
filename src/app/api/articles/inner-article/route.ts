import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDataSource } from "@/server/db/typeorm.datasource";
import sanitizeHtml, {
  type Attributes,
  type IOptions,
  type Transformer,
  type Tag,
} from "sanitize-html";
import { User } from "@/server/modules/users/entities/user.entity";
import { articleCategoryEnum } from "@/server/modules/articles/enums/articleCategory.enum";
import { NewArticle } from "@/server/modules/articles/entities/innerArticle";
import type { Repository, DeepPartial } from "typeorm";

/* -------------------- Schemas -------------------- */
// فقط تغییر اینجاست: summery آرایه‌ی استرینگ است.
const CreateArticleSchema = z.object({
  title: z.string().min(2).max(200),
  authorId: z.string().uuid().optional(),
  subject: z.string().min(1),
  mainText: z.string().min(1),
  summery: z.array(z.string().min(1).max(2000)).optional(),
  thumbnail: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  category: z.string(), // اگر enum داشتی می‌تونی اینجا z.nativeEnum بذاری
  readingPeriod: z.string().optional(),
});

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  category: z.nativeEnum(articleCategoryEnum).optional(),
  q: z.string().trim().optional(),
});

/* -------------------- sanitize-html config -------------------- */
const transformA: Transformer = (_tag: string, attribs: Attributes): Tag => {
  const href = attribs.href ?? "";
  const isHttp = /^https?:\/\//i.test(href);
  const isMail = /^mailto:/i.test(href);
  if (!isHttp && !isMail) {
    return { tagName: "span", attribs: {}, text: attribs.title ?? "" };
  }
  return {
    tagName: "a",
    attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" },
  };
};

const transformImg: Transformer = (_tag: string, attribs: Attributes): Tag => {
  const src = attribs.src ?? "";
  if (!/^https?:\/\//i.test(src)) {
    return { tagName: "span", attribs: {}, text: "" };
  }
  return { tagName: "img", attribs: { ...attribs, loading: "lazy" } };
};

const SAN_CONFIG: IOptions = {
  allowedTags: [
    "p","br","strong","em","u","s","blockquote",
    "ul","ol","li","h1","h2","h3","h4","h5","h6",
    "code","pre","hr","a","img","span"
  ],
  allowedAttributes: {
    a: ["href","title","target","rel"],
    img: ["src","alt","title","width","height","loading"],
    span: ["class"],
  },
  allowedSchemes: ["http","https","mailto"],
  allowProtocolRelative: false,
  transformTags: { a: transformA, img: transformImg },
};

/* -------------------- POST (Create) -------------------- */
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

    // --- Sanitization فقط روی mainText و تک‌تک آیتم‌های summery ---
    const cleanMainText = sanitizeHtml(parsed.data.mainText, SAN_CONFIG);

    const cleanSummery = Array.isArray(parsed.data.summery)
      ? parsed.data.summery
          .map((s) => sanitizeHtml(s, { ...SAN_CONFIG, allowedTags: ["p","br","strong","em"] }))
          // اگر آیتمی بعد از sanitize خالی شد، حذفش کنیم:
          .filter((s) => s && s.replace(/<[^>]*>/g, "").trim().length > 0)
      : undefined;

    const articleRepo: Repository<NewArticle> = ds.getRepository(NewArticle);

    const input: DeepPartial<NewArticle> = {
      title: parsed.data.title,
      subject: parsed.data.subject,
      author,
      mainText: cleanMainText,
      summery: cleanSummery, // ← آرایه‌ی پاک‌سازی‌شده (یا undefined)
      thumbnail: parsed.data.thumbnail ?? null,
      category: parsed.data.category,
      readingPeriod: parsed.data.readingPeriod, // بدون تغییر
    };

    const article = articleRepo.create(input);
    const saved = await articleRepo.save(article);

    return NextResponse.json({ success: true, id: saved.id }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/articles/inner-article error:", err);
    return NextResponse.json(
      { error: "ServerError", message: "مشکل داخلی سرور" },
      { status: 500 }
    );
  }
}

/* -------------------- GET (List) -------------------- */
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

    const articleRepo = ds.getRepository(NewArticle);

    const where: any = {};
    if (category) where.category = category;

    const qb = articleRepo
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.author", "author")
      .where(where);

    if (q) {
      qb.andWhere("(a.title LIKE :q )", { q: `%${q}%` });
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
        title: it.title,
        category: it.category,
        readingPeriod: it.readingPeriod,
        mainText: it.mainText,
        viewCount: it.viewCount,
        summery: it.summery,         // ← آرایه همان‌طور که هست برمی‌گردد
        thumbnail: it.thumbnail,
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

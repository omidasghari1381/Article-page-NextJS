import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import SidebarLatest from "@/components/SidebarLatest";
import HeroCard from "@/components/article/HeroCard";
import ArticleBody from "@/components/article/ArticleBody";
import InlineNextCard from "@/components/article/InlineNextCard";
import Thumbnail from "@/components/article/Thumbnail"; // ← default import و نام درست
import RelatedArticles from "@/components/article/RelatedArticles";
import CommentsBlock from "@/components/article/CommentsBlock";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { absolute } from "@/app/utils/base-url";
// import type { Metadata } from "next"; // فعلاً استفاده نمی‌شود

type Author = { id: string; firstName: string; lastName: string };

type ApiCategory = { id: string; name: string; slug: string };
type ApiTag = { id: string; name: string; slug: string };

type ApiArticle = {
  id: string;
  title: string;
  slug: string | null;
  subject: string | null;
  readingPeriod: number;
  viewCount: number;
  thumbnail: string | null;
  introduction: string | null; // ← i کوچک
  quotes: string | null;
  summery: string[] | null; // ← همون نام املایی موجود در API
  mainText: string;
  secondaryText: string | null;
  author: Author;
  categories: ApiCategory[]; // ← آرایه
  tags: ApiTag[];
  createdAt: string;
  createdAtISO?: string;
};

// برای Latest/Related
type LiteArticle = {
  id: string;
  title: string;
  createdAt: string;
  category: string;
  author: Author;
  thumbnail: string | null;
  readingPeriod: string | number;
};

type CommentWithReplies = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: Author;
  like: number;
  dislike: number;
  replies?: {
    id: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    user: Author;
  }[];
};

async function getArticle(id: string): Promise<ApiArticle | null> {
  const res = await fetch(absolute(`/api/articles/${encodeURIComponent(id)}`), {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getLatest(): Promise<LiteArticle[]> {
  const res = await fetch(absolute(`/api/articles?perPage=4`), {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.items ?? [];
}

async function getRelated(firstCategorySlug?: string, excludeId?: string) {
  if (!firstCategorySlug) return null;
  const res = await fetch(
    absolute(`/api/articles?perPage=4&category=${encodeURIComponent(firstCategorySlug)}`),
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const items: LiteArticle[] = Array.isArray(data?.items) ? data.items : [];
  return items.find((x) => x.id !== excludeId) ?? null;
}

async function getComments(
  articleId: string
): Promise<{ items: CommentWithReplies[]; total: number }> {
  const res = await fetch(
    absolute(`/api/articles/${encodeURIComponent(articleId)}/comments?skip=0&take=10&withReplies=1`),
    { cache: "no-store" }
  );
  if (!res.ok) return { items: [], total: 0 };
  const data = await res.json();
  return { items: data?.data ?? [], total: data?.total ?? 0 };
}

// نرمال‌سازی برای کم کردن if-else در JSX
function normalize(article: ApiArticle) {
  const firstCategory: ApiCategory | undefined = Array.isArray(article.categories)
    ? article.categories[0]
    : undefined;

  return {
    id: article.id,
    title: article.title,
    subject: article.subject ?? "",
    introduction: article.introduction ?? "", // ← درست شد
    quotes: article.quotes ?? "",
    mainText: article.mainText,
    secondaryText: article.secondaryText ?? "",
    readingPeriod: article.readingPeriod ?? 0,
    viewCount: article.viewCount ?? 0,
    thumbnail: article.thumbnail ?? null, // رشته URL
    createdAt: article.createdAt,
    author: article.author,
    category: {
      name: firstCategory?.name ?? "",
      slug: firstCategory?.slug ?? "",
      id: firstCategory?.id ?? "",
    },
    categories: article.categories,
    tags: article.tags,
    summery: Array.isArray(article.summery) ? article.summery : [],
  };
}

function JsonLd({ a }: { a: ReturnType<typeof normalize> }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.introduction || "",
    datePublished: a.createdAt,
    dateModified: a.createdAt, // اگر modified نداری فعلاً همونه
    author: a.author
      ? { "@type": "Person", name: `${a.author.firstName} ${a.author.lastName}`.trim() }
      : undefined,
    image: a.thumbnail ? [a.thumbnail] : undefined,
    articleSection: a.category.name,
    keywords: a.tags?.map((t) => t.name),
    mainEntityOfPage: absolute(`/article/${encodeURIComponent(a.id)}`),
  };
  return (
    <script
      type="application/ld+json"
      // @ts-ignore
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params; // Next.js 15
  const apiArticle = await getArticle(id);

  if (!apiArticle) {
    return (
      <main className="px-7 py-10">
        <h1 className="text-xl font-bold">مقاله پیدا نشد</h1>
      </main>
    );
  }

  const a = normalize(apiArticle);

  const [latest, related, commentsRes, session] = await Promise.all([
    getLatest(),
    getRelated(a.category.slug, a.id),
    getComments(a.id),
    getServerSession(authOptions),
  ]);

  const role = (session?.user as any)?.role;
  const isAdmin = role === "admin";

  return (
    <main className="px-7 sm:px-6 lg:px- py-6 mx-auto ">
      <JsonLd a={a} />

      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          // ← الان اسم کتگوری از a.category.name میاد
          { label: a.category.name || "_", href: `/categories/${a.category.slug || ""}` },
          { label: a.title || "..." },
        ]}
      />

      <div className="hidden lg:grid lg:grid-cols-13 gap-2 mt-6">
        <section className="lg:col-span-9 space-y-8">
          <div>
            <HeroCard
              title={a.title}
              subject={a.subject}
              introduction={a.introduction} 
              thumbnail={a.thumbnail}
              readingPeriod={a.readingPeriod}
              viewCount={a.viewCount}
              category={a.category.name} 
              summery={a.summery}
            />

            <ArticleBody
              mainText={a.mainText}
              quotes={a.quotes}
              secondryText={a.secondaryText}
            />

            <div className="flex items-start gap-4 my-6">
              <Thumbnail
                thumbnail={a.thumbnail || undefined}
                category={a.category.name}
              />
              <InlineNextCard
                author={a.author}
                createdAt={a.createdAt}
                subject={a.subject}
                readingPeriod={a.readingPeriod}
              />
            </div>
          </div>
        </section>

        <aside className="lg:col-span-3 space-y-9 ">
          <SidebarLatest posts={latest} />
        </aside>
      </div>

      <CommentsBlock
        initialComments={commentsRes.items}
        articleId={a.id}
        initialTotal={commentsRes.total}
      />

<RelatedArticles post={related} fallbackCategory={a.category.name} />

      {isAdmin ? (
        <div className="mt-10 flex justify-end">
          <Link
            href={`/article/editor/new-article/${encodeURIComponent(a.id)}`}
            className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
          >
            ویرایش این مقاله
          </Link>
        </div>
      ) : null}

      <Divider />
    </main>
  );
}

function Divider() {
  return (
    <div className="w-full h-0.5 bg-gray-200 relative my-20">
      <div className="absolute right-0 top-0 h-0.5 bg-emerald-400 w-1/3"></div>
    </div>
  );
}

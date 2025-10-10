import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import HeroCard from "@/components/article/HeroCard";
import ArticleBody from "@/components/article/ArticleBody";
import InlineNextCard from "@/components/article/InlineNextCard";
import Thumbnail, { SideImage } from "@/components/article/Thumbnail";
import RelatedArticles from "@/components/article/RelatedArticles";
import CommentsBlock from "@/components/article/CommentsBlock";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { absolute } from "@/app/utils/base-url";
import SidebarLatest from "@/components/mainPage/SidebarLatest";
import type { Metadata } from "next"; // ← فقط برای generateMetadata

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
  introduction: string | null;
  quotes: string | null;
  summery: string[] | null;
  mainText: string;
  secondaryText: string | null;
  author: Author;
  categories: ApiCategory[];
  tags: ApiTag[];
  createdAt: string;
  createdAtISO?: string;
};

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

/* ====================== SEO META TYPES & FETCHERS ====================== */
export enum SeoEntityType {
  ARTICLE = "article",
  CATEGORY = "category",
}
export enum RobotsSetting {
  INDEX_FOLLOW = "index,follow",
  NOINDEX_FOLLOW = "noindex,follow",
  INDEX_NOFOLLOW = "index,nofollow",
  NOINDEX_NOFOLLOW = "noindex,nofollow",
}
export enum TwitterCardType {
  summery = "summery",
  summery_LARGE_IMAGE = "summery_large_image",
}

type SeoMetaDTO = {
  id: string;
  entityType: SeoEntityType;
  entityId: string;
  locale: string;
  useAuto: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  robots: RobotsSetting | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterCard: TwitterCardType | null;
  publishedTime: string | null; // از API می‌آید (toISOString)
  modifiedTime: string | null;
  authorName: string | null;
  tags: string[] | null;
};

async function getSeoMeta(
  entityId: string,
  locale?: string // فعلاً استفاده نمی‌کنیم
): Promise<SeoMetaDTO | null> {
  const qs = new URLSearchParams({
    entityType: SeoEntityType.ARTICLE,
    entityId,
    // عمداً locale نمی‌فرستیم تا پیش‌فرض route که "" است استفاده شود
  });

  const res = await fetch(absolute(`/api/seo?${qs.toString()}`), { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) return null;

  const data = await res.json();
  if (data?.error) return null;
  return data ?? null;
}
 
/** مپ کردن RobotsSetting به ساختار Metadata.robots */
function robotsToMetadata(robots?: RobotsSetting | null): Metadata["robots"] {
  if (!robots) return undefined;
  switch (robots) {
    case RobotsSetting.INDEX_FOLLOW:
      return { index: true, follow: true };
    case RobotsSetting.NOINDEX_FOLLOW:
      return { index: false, follow: true };
    case RobotsSetting.INDEX_NOFOLLOW:
      return { index: true, follow: false };
    case RobotsSetting.NOINDEX_NOFOLLOW:
      return { index: false, follow: false };
    default:
      return undefined;
  }
}

/** ادغام متای سفارشی با داده‌های مقاله (fallback روی مقاله وقتی useAuto=true یا فیلدی تهی است). */
function resolveSeoMetadata(
  article: ApiArticle,
  meta: SeoMetaDTO | null
): Metadata {
  // داده‌های پایه از خود مقاله
  const articleUrl = absolute(`/article/${encodeURIComponent(article.id)}`);
  const articleTitle = article.title;
  const articleDesc =
    (article.introduction ?? "").trim() || (article.subject ?? "").trim() || "";
  const articleImg = article.thumbnail || undefined;
  const authorFull =
    `${article.author?.firstName ?? ""} ${
      article.author?.lastName ?? ""
    }`.trim() || undefined;
  const published = article.createdAt || undefined;
  const modified = article.createdAtISO || article.createdAt || undefined;
  const keywords = article.tags?.map((t) => t.name) ?? undefined;

  const useAuto = meta?.useAuto ?? true;

  const title =
    !useAuto && meta?.seoTitle?.trim() ? meta!.seoTitle! : articleTitle;

  const description =
    !useAuto && meta?.seoDescription?.trim()
      ? meta!.seoDescription!
      : articleDesc;

  const canonical =
    !useAuto && meta?.canonicalUrl?.trim() ? meta!.canonicalUrl! : articleUrl;

  const ogTitle = !useAuto && meta?.ogTitle?.trim() ? meta!.ogTitle! : title;

  const ogDescription =
    !useAuto && meta?.ogDescription?.trim()
      ? meta!.ogDescription!
      : description;

  const ogImage =
    !useAuto && meta?.ogImageUrl?.trim() ? meta!.ogImageUrl! : articleImg;

  const twitterCard =
    (!useAuto && meta?.twitterCard) || TwitterCardType.summery_LARGE_IMAGE;

  const robots = robotsToMetadata(meta?.robots);

  // تاریخ‌ها + نویسنده + تگ‌ها
  const publishedTime =
    (!useAuto && meta?.publishedTime) || published || undefined;
  const modifiedTime =
    (!useAuto && meta?.modifiedTime) || modified || undefined;
  const authorName = (!useAuto && meta?.authorName) || authorFull || undefined;
  const tags =
    (!useAuto && meta?.tags?.length ? meta?.tags : keywords) || undefined;

  const md: Metadata = {
    title,
    description,
    alternates: {
      canonical,
    },
    robots,
    openGraph: {
      type: "article",
      url: articleUrl,
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [{ url: ogImage }] : undefined,
      siteName: "MyProp", // در صورت نیاز تنظیم کنید
      locale: meta?.locale || "fa_IR",
      authors: authorName ? [authorName] : undefined,
      publishedTime,
      modifiedTime,
      tags,
    },
    twitter: {
      card:
        twitterCard === TwitterCardType.summery_LARGE_IMAGE
          ? "summary_large_image"
          : "summary",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
      creator: authorName,
    },
    keywords: tags,
  };

  return md;
}
/* ====================== /SEO META ====================== */

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
    absolute(
      `/api/articles?perPage=4&category=${encodeURIComponent(
        firstCategorySlug
      )}`
    ),
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
    absolute(
      `/api/articles/${encodeURIComponent(
        articleId
      )}/comments?skip=0&take=10&withReplies=1`
    ),
    { cache: "no-store" }
  );
  if (!res.ok) return { items: [], total: 0 };
  const data = await res.json();
  return { items: data?.data ?? [], total: data?.total ?? 0 };
}

// نرمال‌سازی برای کم کردن if-else در JSX
function normalize(article: ApiArticle) {
  const firstCategory: ApiCategory | undefined = Array.isArray(
    article.categories
  )
    ? article.categories[0]
    : undefined;

  return {
    id: article.id,
    title: article.title,
    subject: article.subject ?? "",
    introduction: article.introduction ?? "",
    quotes: article.quotes ?? "",
    mainText: article.mainText,
    secondaryText: article.secondaryText ?? "",
    readingPeriod: article.readingPeriod ?? 0,
    viewCount: article.viewCount ?? 0,
    thumbnail: article.thumbnail ?? null,
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
    dateModified: a.createdAt,
    author: a.author
      ? {
          "@type": "Person",
          name: `${a.author.firstName} ${a.author.lastName}`.trim(),
        }
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

/* ====================== generateMetadata: تزریق SEO به <head> ====================== */
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;

  // مقاله برای fallback خودکار
  const article = await getArticle(id);
  if (!article) {
    return {
      title: "مقاله پیدا نشد",
      robots: { index: false, follow: false },
    };
  }

  // لوکال اگر دارید از روتر/کوکی/هدر بخوانید. فعلاً fa-IR
  const locale = "fa-IR";
  const meta = await getSeoMeta(id, locale);

  return resolveSeoMetadata(article, meta);
}
/* ====================== /generateMetadata ====================== */

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
    <main className="px-7 sm:px-6 lg:px-20 py-6 mx-auto ">
      <JsonLd a={a} />

      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          {
            label: a.category.name || "_",
            href: `/categories/${a.category.slug || ""}`,
          },
          { label: a.title || "..." },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-13">
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

            <div className="flex flex-col gap-4 my-6 lg:flex-row lg:items-stretch">
              <SideImage
                thumbnail={a.thumbnail || undefined}
                category={a.category.name}
                mobileAspectClass="aspect-[16/9]"
                desktopSizeClass="lg:aspect-auto lg:h-[163.5px] lg:w-[291.14px]"
                rounded="rounded-xl"
                badgeClass="bottom-2 right-2 sm:bottom-2 sm:right-2"
                categoryTextClass="bottom-3 right-4 sm:bottom-3.5 sm:right-5 text-xs"
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

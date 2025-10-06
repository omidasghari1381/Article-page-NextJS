import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import SidebarLatest from "@/components/SidebarLatest";
import HeroCard from "@/components/article/HeroCard";
import ArticleBody from "@/components/article/ArticleBody";
import InlineNextCard from "@/components/article/InlineNextCard";
import { Thumbnaill } from "@/components/article/Thumbnail";
import RelatedArticles from "@/components/article/RelatedArticles";
import CommentsBlock from "@/components/article/CommentsBlock";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { absolute } from "@/app/utils/base-url";
import type { Metadata } from "next";

type Author = { id: string; firstName: string; lastName: string };

type ArticleDetail = {
  id: string;
  title: string;
  subject: string;
  category: string;
  readingPeriod: string;
  viewCount: number;
  thumbnail: string | null;
  Introduction: string | null;
  quotes: string | null;
  mainText: string;
  secondaryText: string;
  author: Author;
  createdAt: string;
  summery: string[];
};

enum SeoEntityType {
  ARTICLE = "article",
  CATEGORY = "category",
}
enum RobotsSetting {
  INDEX_FOLLOW = "index,follow",
  NOINDEX_FOLLOW = "noindex,follow",
  INDEX_NOFOLLOW = "index,nofollow",
  NOINDEX_NOFOLLOW = "noindex,nofollow",
}
enum TwitterCardType {
  summery = "summery",
  summery_LARGE_IMAGE = "summery_large_image",
}
type SeoMetaDTO = {
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
  publishedTime: string | null;
  modifiedTime: string | null;
  authorName: string | null;
  tags: string[] | null;
};

type LiteArticle = {
  id: string;
  title: string;
  createdAt: string;
  category: string;
  author: Author;
  thumbnail: string | null;
  readingPeriod: string;
};

type LikeArticle = {
  id: string;
  subject: string;
  createdAt: string;
  readingPeriod: string;
  author: Author;
  category: string;
  thumbnail: string | null;
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

async function getArticle(id: string): Promise<ArticleDetail | null> {
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

async function getSeoForArticle(
  articleId: string,
  locale = ""
): Promise<SeoMetaDTO | null> {
  const url = absolute(
    `/api/seo?entityType=${SeoEntityType.ARTICLE}&entityId=${encodeURIComponent(
      articleId
    )}&locale=${encodeURIComponent(locale)}`
  );
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

function parseRobots(
  r?: RobotsSetting | null
): { index?: boolean; follow?: boolean } | undefined {
  if (!r) return undefined;
  switch (r) {
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

function twitterCardFromEnum(
  t?: TwitterCardType | null
): "summery" | "summery_large_image" | undefined {
  if (!t) return undefined;
  return t === TwitterCardType.summery_LARGE_IMAGE
    ? "summery_large_image"
    : "summery";
}

function buildFinalSeo(article: ArticleDetail, seo?: SeoMetaDTO | null) {
  const autoDesc =
    article.subject ||
    article.Introduction ||
    (Array.isArray(article.summery) ? article.summery.join("، ") : "") ||
    "";

  const authorName =
    seo?.authorName ||
    `${article.author?.firstName ?? ""} ${
      article.author?.lastName ?? ""
    }`.trim() ||
    undefined;

  const published = seo?.publishedTime || article.createdAt || undefined;
  const imageAbs = (url?: string | null) => (url ? absolute(url) : undefined);

  const useAuto = seo?.useAuto ?? true;

  const title =
    !useAuto && seo?.seoTitle ? seo.seoTitle : `${article.title} | مای‌پراپ`;

  const description =
    !useAuto && seo?.seoDescription ? seo.seoDescription : autoDesc;

  const ogTitle =
    !useAuto && seo?.ogTitle ? seo.ogTitle : title ?? article.title;

  const ogDescription =
    !useAuto && seo?.ogDescription ? seo.ogDescription : description;

  const ogImage =
    !useAuto && seo?.ogImageUrl
      ? imageAbs(seo.ogImageUrl)
      : imageAbs(article.thumbnail);

  const canonical =
    !useAuto && seo?.canonicalUrl
      ? seo.canonicalUrl
      : absolute(`/article/${encodeURIComponent(article.id)}`);

  const robots =
    !useAuto && seo?.robots
      ? parseRobots(seo.robots)
      : { index: true, follow: true };

  const twitterCard =
    !useAuto && seo?.twitterCard
      ? twitterCardFromEnum(seo.twitterCard)
      : ogImage
      ? "summery_large_image"
      : "summery";

  return {
    title,
    description,
    canonical,
    robots,
    og: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      url: canonical,
    },
    twitter: {
      card: twitterCard,
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    articleLike: {
      authorName,
      publishedTime: published,
      modifiedTime: seo?.modifiedTime || undefined,
      section: article.category,
      readingTime: article.readingPeriod,
      tags: seo?.tags ?? undefined,
    },
  };
}



function JsonLd({
  article,
  final,
}: {
  article: ArticleDetail;
  final: ReturnType<typeof buildFinalSeo>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: final.description ?? "",
    datePublished: final.articleLike.publishedTime,
    dateModified: final.articleLike.modifiedTime,
    author: final.articleLike.authorName
      ? { "@type": "Person", name: final.articleLike.authorName }
      : undefined,
    image: final.og.image ? [final.og.image] : undefined,
    articleSection: article.category,
    keywords: final.articleLike.tags,
    mainEntityOfPage: final.canonical,
  };
  return (
    <script
      type="application/ld+json"
      // @ts-ignore
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

async function getRelated(
  category: string,
  excludeId: string
): Promise<LikeArticle | null> {
  const res = await fetch(
    absolute(
      `/api/articles?perPage=4&category=${encodeURIComponent(category)}`
    ),
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const items: LikeArticle[] = Array.isArray(data?.items) ? data.items : [];
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

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) {
    return (
      <main className="px-7 py-10">
        <h1 className="text-xl font-bold">مقاله پیدا نشد</h1>
      </main>
    );
  }
  const seo = await getSeoForArticle(id, "");
  const finalSeo = buildFinalSeo(article, seo);

  const [latest, related, commentsRes, session] = await Promise.all([
    getLatest(),
    getRelated(article.category, article.id),
    getComments(article.id),
    getServerSession(authOptions),
  ]);

  const role = (session?.user as any)?.role;
  const isAdmin = role === "admin";

  return (
    <main className="px-7 sm:px-6 lg:px- py-6 mx-auto ">
      <JsonLd article={article} final={finalSeo} />

      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/" },
          { label: article.category || "_", href: "/categories" },
          { label: article.title || "..." },
        ]}
      />

      <div className="hidden lg:grid lg:grid-cols-13 gap-2 mt-6">
        <section className="lg:col-span-9 space-y-8">
          <div>
            <HeroCard
              title={article.title}
              subject={article.subject}
              introduction={article.Introduction}
              thumbnail={article.thumbnail}
              readingPeriod={article.readingPeriod}
              viewCount={article.viewCount}
              category={article.category}
              summery={article.summery}
            />

            <ArticleBody
              mainText={article.mainText}
              quotes={article.quotes}
              secondryText={article.secondaryText}
            />

            <div className="flex items-start gap-4 my-6">
              <Thumbnaill
                thumbnail={article.thumbnail}
                category={article.category}
              />
              <InlineNextCard
                author={article.author}
                createdAt={article.createdAt}
                subject={article.subject}
                readingPeriod={article.readingPeriod}
              />
            </div>
          </div>
        </section>

        <aside className="lg:col-span-3 space-y-9 ">
          <SidebarLatest posts={latest} />
        </aside>
      </div>

      {/* بلاک نظرات: جزیره‌ی کلاینتی با داده‌ی اولیه */}
      <CommentsBlock
        initialComments={commentsRes.items}
        articleId={article.id}
        initialTotal={commentsRes.total}
      />

      <RelatedArticles post={related} />

      {isAdmin ? (
        <div className="mt-10 flex justify-end">
          <Link
            href={`/article/editor/new-article/${encodeURIComponent(
              article.id
            )}`}
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

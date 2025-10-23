import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import HeroCard from "@/components/article/HeroCard";
import ArticleBody from "@/components/article/ArticleBody";
import InlineNextCard from "@/components/article/InlineNextCard";
import { SideImage } from "@/components/article/Thumbnail";
import RelatedArticles from "@/components/article/RelatedArticles";
import CommentsBlock from "@/components/article/CommentsBlock";
import SidebarLatest from "@/components/mainPage/SidebarLatest";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { ArticleService } from "@/server/modules/articles/services/article.service";
import {
  RobotsSetting,
  TwitterCardType,
  SeoEntityType,
} from "@/server/modules/metaData/entities/seoMeta.entity";
import { SeoMetaService } from "@/server/modules/metaData/services/seoMeta.service";

import Reveal from "@/components/transitions/Reveal";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { getServerT } from "@/lib/i18n/get-server-t";
import { clampLang, type Lang } from "@/lib/i18n/settings";

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

const langToLocale = (lang: Lang) => (lang === "en" ? "en_US" : "fa_IR");

function resolveSeoMetadata(
  lang: Lang,
  article: any,
  meta: any | null
): Metadata {
  const articleUrl = `/article/${encodeURIComponent(article.id)}`;
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
  const keywords = article.tags?.map((t: any) => t.name) ?? undefined;

  const useAuto = meta?.useAuto ?? true;
  const title =
    !useAuto && meta?.seoTitle?.trim() ? meta.seoTitle! : articleTitle;
  const description =
    !useAuto && meta?.seoDescription?.trim()
      ? meta.seoDescription!
      : articleDesc;
  const canonical =
    !useAuto && meta?.canonicalUrl?.trim() ? meta.canonicalUrl! : articleUrl;
  const ogTitle = !useAuto && meta?.ogTitle?.trim() ? meta.ogTitle! : title;
  const ogDescription =
    !useAuto && meta?.ogDescription?.trim() ? meta.ogDescription! : description;
  const ogImage =
    !useAuto && meta?.ogImageUrl?.trim() ? meta.ogImageUrl! : articleImg;
  const twitterCard =
    (!useAuto && meta?.twitterCard) || TwitterCardType.summery_LARGE_IMAGE;
  const robots = robotsToMetadata(meta?.robots);

  const publishedTime =
    (!useAuto && meta?.publishedTime) || published || undefined;
  const modifiedTime =
    (!useAuto && meta?.modifiedTime) || modified || undefined;
  const authorName = (!useAuto && meta?.authorName) || authorFull || undefined;
  const tags =
    (!useAuto && meta?.tags?.length ? meta?.tags : keywords) || undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      type: "article",
      url: articleUrl,
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [{ url: ogImage }] : undefined,
      siteName: "MyProp",
      locale: meta?.locale || langToLocale(lang),
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
}

function JsonLd({ a }: { a: any }) {
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
    articleSection: a.category?.name,
    keywords: a.tags?.map((t: any) => t.name),
    mainEntityOfPage: `/article/${encodeURIComponent(a.id)}`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang: raw, id } = await params;
  const lang: Lang = clampLang(raw);

  const articleSrv = new ArticleService();
  const seoSrv = new SeoMetaService();

  const article = await articleSrv.getById(id);
  if (!article) {
    const t = await getServerT(lang, "article");
    return {
      title: t("not_found_title"),
      robots: { index: false, follow: false },
    };
  }

  const meta = await seoSrv.getBy(
    SeoEntityType.ARTICLE,
    id,
    lang === "en" ? "en-US" : "fa-IR"
  );
  return resolveSeoMetadata(lang, article, meta);
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: raw, id } = await params;
  const lang: Lang = clampLang(raw);
  const t = await getServerT(lang, "article");

  const articleSrv = new ArticleService();

  const [apiArticle, latestRes, commentsRes, session] = await Promise.all([
    articleSrv.getById(id),
    articleSrv.listArticles({
      page: 1,
      pageSize: 4,
      sort: { by: "createdAt", dir: "DESC" },
      variant: "lite",
    }),
    articleSrv.listComments(id, { skip: 0, take: 10, withReplies: true }),
    getServerSession(authOptions),
  ]);

  if (!apiArticle) {
    return (
      <main className="px-7 py-10">
        <h1 className="text-xl font-bold">{t("not_found_title")}</h1>
      </main>
    );
  }

  const firstCategory = Array.isArray(apiArticle.categories)
    ? apiArticle.categories[0]
    : undefined;

  const relatedRes = firstCategory?.id
    ? await articleSrv.listArticles({
        page: 1,
        pageSize: 4,
        sort: { by: "createdAt", dir: "DESC" },
        filters: { categoryId: firstCategory.id },
        variant: "lite",
      })
    : { items: [] as any[] };

  const related = Array.isArray(relatedRes.items)
    ? (relatedRes.items as any[]).find((x) => x.id !== apiArticle.id) || null
    : null;

  const latest = Array.isArray(latestRes.items) ? latestRes.items : [];

  const role = (session?.user as any)?.role;
  const isAdmin = role === "admin";

  const a = {
    ...apiArticle,
    category: firstCategory
      ? {
          id: firstCategory.id,
          name: firstCategory.name,
          slug: firstCategory.slug,
        }
      : { id: "", name: "", slug: "" },
    summery: Array.isArray(apiArticle.summery) ? apiArticle.summery : [],
  };

  return (
    <main className="px-4 sm:px-6 lg:px-20 py-6 mx-auto text-skin-base">
      <JsonLd a={a} />

      <Reveal as="div" mode="mount">
        <Reveal as="div" mode="mount">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.brand"), href: "/" },
              { label: t("breadcrumb.articles"), href: "/articles" },
              {
                label: a.category.name || "_",
                href: `/categories/${a.category.slug || ""}`,
              },
              { label: a.title || "..." },
            ]}
          />
        </Reveal>
      </Reveal>

      <div className="grid grid-cols-1 mt-6 lg:grid-cols-12">
        <Reveal as="section" className="lg:col-span-9 space-y-8" mode="mount">
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
              lang={lang}
            />

            <ArticleBody
              mainText={a.mainText}
              quotes={a.quotes}
              secondryText={a.secondaryText}
              lang={lang}
            />

            <Reveal
              as="div"
              className="flex flex-col gap-4 my-6 lg:flex-row lg:items-stretch"
              once={false}
            >
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
                lang={lang}
              />
            </Reveal>
          </div>
        </Reveal>

        <Reveal
          as="aside"
          className="lg:col-span-3 space-y-9 lg:mr-6 lg:w-[105%]"
          once={false}
        >
          <SidebarLatest posts={latest as any} lang={lang} />
        </Reveal>
      </div>

      <Reveal as="section">
        <CommentsBlock
          initialComments={(commentsRes?.data as any[]) || []}
          articleId={a.id}
          initialTotal={(commentsRes as any)?.total || 0}
          lang={lang}
        />
      </Reveal>

      <Reveal as="section">
        <RelatedArticles
          post={related as any}
          fallbackCategory={a.category.name}
          lang={lang}
        />
      </Reveal>

      {isAdmin ? (
        <Reveal as="div" className="mt-10 flex justify-end">
          <Link
            href={`/article/editor/new-article/${encodeURIComponent(a.id)}`}
            className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
          >
            {t("edit_button")}
          </Link>
        </Reveal>
      ) : null}

      <Reveal as="div">
        <Divider />
      </Reveal>
    </main>
  );
}

function Divider() {
  return (
    <div className="w-full h-0.5 bg-gray-200 dark:bg-skin-divider relative my-20 transition-colors">
      <div className="absolute right-0 top-0 h-0.5 bg-emerald-400 w-1/3 transition-all"></div>
    </div>
  );
}

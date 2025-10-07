import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { headers } from "next/headers";

import ArticleForm from "@/components/article/ArticleForm";
import SeoSettingsForm from "@/components/seo/ArticleSeoSettingsForm";

export const dynamic = "force-dynamic";

export type CategoryDTO = { id: string; name: string; slug: string };
export type TagDTO = { id: string; name: string; slug: string };
export type MediaDTO = { id: string; name: string; url: string };

export type ArticleDTO = {
  id: string;
  title: string;
  slug: string | null;
  subject: string | null;
  readingPeriod: number;
  viewCount: number;
  thumbnail: string | MediaDTO | null;
  introduction: string | null;
  quotes: string | null;
  summery: string[] | null;
  mainText: string;
  secondaryText: string | null;
  author: { id: string; firstName: string; lastName: string } | null;
  categories: CategoryDTO[];
  tags: TagDTO[];
  createdAt: string;
};

export type ListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

export function getBaseUrl(): string {
  const fromPublic = process.env.NEXT_PUBLIC_BASE_URL;
  if (fromPublic) return fromPublic.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`.replace(/\/+$/, "");
  return "http://localhost:3000";
}
export function absolute(path: string): string {
  return new URL(path, getBaseUrl()).toString();
}
export function mediaAbsolute(pathOrUrl?: string | null) {
  if (!pathOrUrl) return "";
  const v = String(pathOrUrl);
  if (/^https?:\/\//i.test(v)) return v;
  const mediaBase = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "").replace(/\/$/, "");
  const path = v.replace(/^\//, "");
  return mediaBase ? `${mediaBase}/${path}` : `/${path}`;
}

async function fetchJSON<T>(
  url: string,
  init?: RequestInit & { revalidate?: number; tag?: string }
) {
  const h = await headers();
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      cookie: h.get("cookie") || "",
    },
    next:
      init?.revalidate !== undefined || init?.tag
        ? { revalidate: init?.revalidate, tags: init?.tag ? [init.tag] : undefined }
        : undefined,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `Fetch failed: ${url}`));
  return (await res.json()) as T;
}

async function getInitialData(articleId?: string) {
  const [cats, tags] = await Promise.all([
    fetchJSON<ListResponse<CategoryDTO>>(absolute("/api/categories?perPage=100"), {
      revalidate: 600,
      tag: "categories",
    }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 100, pages: 1 })),
    fetchJSON<ListResponse<TagDTO>>(absolute("/api/tags?perPage=50"), {
      revalidate: 600,
      tag: "tags",
    }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 50, pages: 1 })),
  ]);

  let article: ArticleDTO | null = null;
  if (articleId) {
    article = await fetchJSON<ArticleDTO>(absolute(`/api/articles/${articleId}`), {
      revalidate: 0,
    }).catch(() => null);
  }
  return { cats: cats.items ?? [], tags: tags.items ?? [], article };
}

export default async function Page(props: {
  params: Promise<{ id?: string[] }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;

  const articleId = id?.[0];
  const tabParam = sp?.tab;
  const tab = (Array.isArray(tabParam) ? tabParam[0] : tabParam) === "seo" ? "seo" : "article";

  const { cats, tags, article } = await getInitialData(articleId);
  const canSeo = !!article?.id;

  const basePath = `/articles/editor${articleId ? `/${articleId}` : ""}`;
  const articleHref = `${basePath}?tab=article`;
  const seoHref = `${basePath}?tab=seo`;

  return (
    <main
      dir="rtl"
      className={
        // ★ Responsive paddings without changing desktop look
        "pb-24 pt-6 px-4 sm:px-6 lg:px-12 xl:px-20"
      }
    >
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          { label: articleId ? "ویرایش مقاله" : "افزودن مقاله", href: basePath },
        ]}
      />

      {/* Tabs */}
      <div className="mt-5">
        {/* ★ Make tabs horizontally scrollable on small screens */}
        <div className="mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <div className="inline-flex items-center gap-2 whitespace-nowrap">
            <a
              href={articleHref}
              className={`px-4 py-2 rounded-lg border text-sm sm:text-base ${
                tab === "article"
                  ? "bg-black text-white"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              اطلاعات مقاله
            </a>
            {canSeo ? (
              <a
                href={seoHref}
                className={`px-4 py-2 rounded-lg border text-sm sm:text-base ${
                  tab === "seo"
                    ? "bg-black text-white"
                    : "bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                SEO
              </a>
            ) : (
              <span
                className="px-4 py-2 rounded-lg border bg-gray-100 text-gray-400 cursor-not-allowed text-sm sm:text-base"
                title="برای سئو، ابتدا مقاله را ذخیره کنید"
              >
                SEO
              </span>
            )}
          </div>
        </div>

        {tab === "article" ? (
          <Suspense fallback={<div>در حال بارگذاری فرم…</div>}>
            <ArticleForm
              initialArticle={article}
              categories={cats}
              tags={tags}
              initialThumbUrl={mediaAbsolute(
                typeof article?.thumbnail === "string"
                  ? article?.thumbnail
                  : article?.thumbnail?.url
              )}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<div>در حال بارگذاری تب سئو…</div>}>
            <SeoSettingsForm entityType="article" entityId={article?.id ?? null} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
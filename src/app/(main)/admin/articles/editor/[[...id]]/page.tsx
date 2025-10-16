import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumb";
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

export function mediaAbsolute(pathOrUrl?: string | null) {
  if (!pathOrUrl) return "";
  const v = String(pathOrUrl);
  if (/^https?:\/\//i.test(v)) return v;
  const mediaBase = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "").replace(
    /\/$/,
    ""
  );
  const path = v.replace(/^\//, "");
  return mediaBase ? `${mediaBase}/${path}` : `/${path}`;
}

import { ArticleService } from "@/server/modules/articles/services/article.service";
import { CategoryService } from "@/server/modules/categories/services/category.service";
import { TagsService } from "@/server/modules/tags/services/tag.service";

async function getInitialData(articleId?: string) {
  const categorySvc = new CategoryService();
  const tagSvc = new TagsService();
  const articleSvc = new ArticleService();

  const [catEntities, tagList] = await Promise.all([
    categorySvc.listCategories(),
    tagSvc.listTags({ perPage: 50, sortBy: "name", sortDir: "ASC" }),
  ]);

  const cats: CategoryDTO[] = (catEntities ?? []).map((c: any) => ({
    id: String(c.id),
    name: String(c.name),
    slug: String(c.slug),
  }));

  const tags: TagDTO[] = (tagList?.items ?? []).map((t: any) => ({
    id: String(t.id),
    name: String(t.name),
    slug: String(t.slug),
  }));

  let article: ArticleDTO | null = null;
  if (articleId) {
    const a = await articleSvc.getById(articleId);
    article = (a ?? null) as unknown as ArticleDTO;
  }

  return { cats, tags, article };
}

export default async function Page(props: {
  params: Promise<{ id?: string[] }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;

  const articleId = id?.[0];
  const tabParam = sp?.tab;
  const tab =
    (Array.isArray(tabParam) ? tabParam[0] : tabParam) === "seo"
      ? "seo"
      : "article";

  const { cats, tags, article } = await getInitialData(articleId);
  const canSeo = !!article?.id;

  const basePath = `/articles/editor${articleId ? `/${articleId}` : ""}`;
  const articleHref = `${basePath}?tab=article`;
  const seoHref = `${basePath}?tab=seo`;

  return (
    <main className="pb-24 pt-6">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          {
            label: articleId ? "ویرایش مقاله" : "افزودن مقاله",
            href: basePath,
          },
        ]}
      />

      <div className="mt-5">
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
            <SeoSettingsForm
              entityType="article"
              entityId={article?.id ?? null}
            />
          </Suspense>
        )}
      </div>
    </main>
  );
}

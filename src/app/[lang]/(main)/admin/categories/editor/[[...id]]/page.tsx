import "server-only";
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import CategoryEditWithTabs from "@/components/categories/CategoryEditWithTabs";
import { CategoryService } from "@/server/modules/categories/services/category.service";
import { SeoMetaService } from "@/server/modules/metaData/services/seoMeta.service";
import { SeoEntityType } from "@/server/modules/metaData/enums/entity.enum";
import Breadcrumb from "@/components/Breadcrumb";
import { clampLang, type Lang } from "@/lib/i18n/settings";
import { getServerT } from "@/lib/i18n/get-server-t";

type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent?: { id: string } | null;
  depth: number;
};

type SeoMetaPayload = {
  useAuto: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  robots: "index,follow" | "noindex,follow" | "index,nofollow" | "noindex,nofollow" | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterCard: "summery" | "summery_large_image" | null;
  publishedTime: string | null;
  modifiedTime: string | null;
  authorName: string | null;
  tags: string[] | null;
};

const getAllCategories = cache(async (): Promise<CategoryDTO[]> => {
  noStore();
  const svc = new CategoryService();
  const rows = await svc.listCategories();
  return (rows ?? []).map((c: any) => ({
    id: String(c.id),
    name: String(c.name),
    slug: String(c.slug),
    description: c.description ?? null,
    parent: c.parent ? { id: String(c.parent.id) } : null,
    depth: Number(c.depth ?? 0),
  }));
});

const getCategoryById = cache(async (id: string): Promise<CategoryDTO | null> => {
  noStore();
  if (!id) return null;
  const svc = new CategoryService();
  const c = await svc.getCategoryById(id);
  if (!c) return null;
  return {
    id: String(c.id),
    name: String(c.name),
    slug: String(c.slug),
    description: c.description ?? null,
    parent: c.parent ? { id: String(c.parent.id) } : null,
    depth: Number(c.depth ?? 0),
  };
});

const getSeoForCategory = cache(async (id: string, locale: "fa-IR" | "en-US") => {
  noStore();
  if (!id) return { exists: false, data: null as SeoMetaPayload | null };
  const seoSvc = new SeoMetaService();
  const rec = await seoSvc.getBy(SeoEntityType.CATEGORY, id, locale);
  if (!rec) return { exists: false, data: null as SeoMetaPayload | null };
  const data: SeoMetaPayload = {
    useAuto: !!rec.useAuto,
    seoTitle: rec.seoTitle ?? null,
    seoDescription: rec.seoDescription ?? null,
    canonicalUrl: rec.canonicalUrl ?? null,
    robots: rec.robots ?? null,
    ogTitle: rec.ogTitle ?? null,
    ogDescription: rec.ogDescription ?? null,
    ogImageUrl: rec.ogImageUrl ?? null,
    twitterCard: rec.twitterCard ?? null,
    publishedTime: rec.publishedTime ? new Date(rec.publishedTime).toISOString() : null,
    modifiedTime: rec.modifiedTime ? new Date(rec.modifiedTime).toISOString() : null,
    authorName: rec.authorName ?? null,
    tags: Array.isArray(rec.tags) ? rec.tags : null,
  };
  return { exists: true, data };
});

function withLangPath(lang: Lang, path: string) {
  return `/${lang}${path}`;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; id?: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw, id = "" } = await params;
  const lang: Lang = clampLang(raw);
  const t = await getServerT(lang, "admin");
  const sp = await searchParams;
  const initialTab = sp?.tab === "seo" ? "seo" : "category";

  const locale = lang === "en" ? "en-US" : "fa-IR";

  const [allCategories, category, seo] = await Promise.all([
    getAllCategories(),
    id ? getCategoryById(id) : Promise.resolve(null),
    id ? getSeoForCategory(id, locale) : Promise.resolve({ exists: false, data: null }),
  ]);

  const isNew = !id || !category;
  const title = isNew ? t("categories.editor.newTitle") : t("categories.editor.editTitle");

  return (
    <main className="pb-32 pt-4 sm:pt-6 text-skin-base">
      <div className="mx-auto w-full max-w-8xl px-3 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.brand"), href: withLangPath(lang, "/") },
            { label: t("nav.categories"), href: withLangPath(lang, "/admin/categories") },
            { label: title, href: "" }
          ]}
        />

        <div className="mt-4 sm:mt-6">
          <CategoryEditWithTabs
            initialTab={initialTab as "category" | "seo"}
            categoryId={category?.id ?? null}
            allCategories={allCategories}
            initialCategory={category}
            initialSeoExists={seo.exists}
            initialSeo={seo.data}
          />
        </div>
      </div>
    </main>
  );
}
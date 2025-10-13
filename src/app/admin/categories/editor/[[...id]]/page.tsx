import "server-only";
import { absolute } from "@/app/utils/base-url";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import CategoryEditWithTabs from "@/components/categories/CategoryEditWithTabs";

// ----- Types -----
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

// ----- Server fetch helpers -----
const getFetchInit = async () => {
  const hdrs = await headers();
  const ck = await cookies();
  return {
    headers: {
      cookie: ck.toString(),
      "x-forwarded-host": hdrs.get("host") ?? undefined,
    } as Record<string, string>,
    cache: "no-store" as const,
  };
};

const getAllCategories = cache(async (): Promise<CategoryDTO[]> => {
  noStore();
  const res = await fetch(absolute("/api/categories"), await getFetchInit());
  if (!res.ok) return [];
  const data = (await res.json()) as CategoryDTO[];
  return Array.isArray(data) ? data : [];
});

const getCategoryById = cache(async (id: string): Promise<CategoryDTO | null> => {
  noStore();
  if (!id) return null;
  const res = await fetch(absolute(`/api/categories/${id}`), await getFetchInit());
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch category");
  return (await res.json()) as CategoryDTO;
});

const getSeoForCategory = cache(async (id: string, locale = "") => {
  noStore();
  if (!id) return { exists: false, data: null as SeoMetaPayload | null };
  const qs = new URLSearchParams({ entityType: "category", entityId: id, locale }).toString();
  const res = await fetch(absolute(`/api/seo?${qs}`), await getFetchInit());
  if (res.status === 404) return { exists: false, data: null };
  if (!res.ok) throw new Error("Failed to fetch SEO");
  const data = (await res.json()) as SeoMetaPayload;
  return { exists: true, data };
});

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string }>; // Next 15: await params
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id = "" } = await params;
  const sp = await searchParams;
  const initialTab = sp?.tab === "seo" ? "seo" : "category";

  const [allCategories, category, seo] = await Promise.all([
    getAllCategories(),
    id ? getCategoryById(id) : Promise.resolve(null),
    id ? getSeoForCategory(id) : Promise.resolve({ exists: false, data: null }),
  ]);

  return (
    <main className="pb-32 pt-4 sm:pt-6">
      <div className="mx-auto w-full max-w-8xl px-3 sm:px-6 lg:px-8">
        <CategoryEditWithTabs
          initialTab={initialTab as "category" | "seo"}
          categoryId={category?.id ?? null}
          allCategories={allCategories}
          initialCategory={category}
          initialSeoExists={seo.exists}
          initialSeo={seo.data}
        />
      </div>
    </main>
  );
}
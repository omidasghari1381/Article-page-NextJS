"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryForm from "./CategoryForm";
import CategorySeoSettingsForm from "./CategorySeoSettingsForm";

// Types همانی که صفحه دارد
export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent?: { id: string } | null;
  depth: number;
};

export type SeoMetaPayload = {
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

export default function CategoryEditWithTabs({
  initialTab = "category",
  categoryId,
  allCategories,
  initialCategory,
  initialSeoExists,
  initialSeo,
}: {
  initialTab?: "category" | "seo";
  categoryId: string | null;
  allCategories: CategoryDTO[];
  initialCategory: CategoryDTO | null;
  initialSeoExists: boolean;
  initialSeo: SeoMetaPayload | null;
}) {
  const [tab, setTab] = useState<"category" | "seo">(initialTab);

  return (
    <section className="w-full" dir="rtl">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "دسته‌ها", href: "/categories" },
          { label: initialCategory?.id ? "ویرایش دسته" : "افزودن دسته", href: "/categories/new" },
        ]}
      />

      <div className="mt-5">
        <div
          role="tablist"
          aria-label="Category tabs"
          className="relative -mx-3 sm:mx-0 overflow-x-auto scrollbar-none"
        >
          <div className="px-3 sm:px-0 inline-flex gap-2">
            <button
              role="tab"
              aria-selected={tab === "category"}
              className={`px-4 py-2 rounded-full border transition whitespace-nowrap ${
                tab === "category"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
              }`}
              onClick={() => setTab("category")}
            >
              اطلاعات دسته
            </button>
            <button
              role="tab"
              aria-selected={tab === "seo"}
              className={`px-4 py-2 rounded-full border transition whitespace-nowrap ${
                tab === "seo"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
              }`}
              onClick={() => setTab("seo")}
            >
              SEO
            </button>
          </div>
        </div>

        <div className="mt-4">
          {tab === "category" ? (
            <CategoryForm initialAllCategories={allCategories} initialCategory={initialCategory} />
          ) : (
            <CategorySeoSettingsForm
              categoryId={categoryId}
              initialData={initialSeo}
              initialExists={initialSeoExists}
            />
          )}
        </div>
      </div>
    </section>
  );
}

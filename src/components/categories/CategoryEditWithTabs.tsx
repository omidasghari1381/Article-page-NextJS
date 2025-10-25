"use client";
import { useState } from "react";
import CategoryForm from "./CategoryForm";
import CategorySeoSettingsForm from "./CategorySeoSettingsForm";
import { useTranslation } from "react-i18next";
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
  lang,
  initialTab = "category",
  categoryId,
  allCategories,
  initialCategory,
  initialSeoExists,
  initialSeo,
}: {
  lang: "fa" | "en";
  initialTab?: "category" | "seo";
  categoryId: string | null;
  allCategories: CategoryDTO[];
  initialCategory: CategoryDTO | null;
  initialSeoExists: boolean;
  initialSeo: SeoMetaPayload | null;
}) {
  const { t } = useTranslation("admin");
  const [tab, setTab] = useState<"category" | "seo">(initialTab);

  return (
    <section className="w-full text-skin-base dark:text-skin-base">
      <div className="mt-5">
        <div role="tablist" aria-label="Category tabs" className="relative -mx-3 sm:mx-0 overflow-x-auto scrollbar-none">
          <div className="px-3 sm:px-0 inline-flex gap-2">
            <button
              role="tab"
              aria-selected={tab === "category"}
              className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap
                ${tab === "category"
                  ? "bg-black text-white border-black"
                  : "bg-white dark:bg-skin-card text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-skin-bg/10 border-gray-200 dark:border-skin-border"
                }`}
              onClick={() => setTab("category")}
            >
              {t("categories.editor.tabs.category")}
            </button>

            <button
              role="tab"
              aria-selected={tab === "seo"}
              className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap
                ${tab === "seo"
                  ? "bg-black text-white border-black"
                  : "bg-white dark:bg-skin-card text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-skin-bg/10 border-gray-200 dark:border-skin-border"
                }`}
              onClick={() => setTab("seo")}
            >
              {t("categories.editor.tabs.seo")}
            </button>
          </div>
        </div>

        <div className="mt-4">
          {tab === "category" ? (
            <CategoryForm
              lang={lang}
              initialAllCategories={allCategories}
              initialCategory={initialCategory}
            />
          ) : (
            <CategorySeoSettingsForm
              lang={lang}
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
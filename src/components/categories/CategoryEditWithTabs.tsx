"use client";

import { useMemo, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryForm from "./CategoryForm";
import CategorySeoSettingsForm from "./CategorySeoSettingsForm";


// Types همانی که صفحه دارد
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
  const [tab, setTab] = useState<"category" | "seo" >(initialTab);

  return (
    <section className="w-full" dir="rtl">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "दسته", href: "/categories" },
          { label: "افزودن/ویرایش دسته", href: "/article/new-category" },
        ]}
      />

      <div className="mt-5">
        <div className="flex items-center gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-lg border ${
              tab === "category" ? "bg-black text-white" : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
            onClick={() => setTab("category")}
          >
            اطلاعات دسته
          </button>
          <button
            className={`px-4 py-2 rounded-lg border ${
              tab === "seo" ? "bg-black text-white" : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
            onClick={() => setTab("seo")}
          >
            SEO
          </button>
        </div>

        {tab === "category" ? (
          <CategoryForm
            initialAllCategories={allCategories}
            initialCategory={initialCategory}
          />
        ) : (
          <CategorySeoSettingsForm
            categoryId={categoryId}
            initialData={initialSeo}
            initialExists={initialSeoExists}
          />
        )}
      </div>
    </section>
  );
}

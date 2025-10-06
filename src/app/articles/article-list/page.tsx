// src/app/articles/article-list/page.tsx
import { absolute } from "@/app/utils/base-url";
import ArticleCard from "./ArticleCart";
import ArticleFilters from "./ArticleFilter";

type LiteArticle = {
  id: string;
  title: string;
  subject: string | null;
  createdAt: string;
  category: { id: string; name: string } | null;
  author: { id: string; firstName: string; lastName: string } | null;
  thumbnail: string | null;
  readingPeriod: number;
};

// فقط یک asArray جنریک داشته باش
function asArray<T = any>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data.items)) return data.items as T[];
  if (Array.isArray(data.data)) return data.data as T[];
  return [];
}

export default async function Page({
  searchParams,
}: {
  // ✅ Next 15: searchParams باید Promise باشه
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // ✅ ابتدا await کن
  const sp = await searchParams;

  const q = (sp.q as string) || "";
  const category = (sp.category as string) || "";
  const createdFrom = (sp.createdFrom as string) || "";
  const createdTo = (sp.createdTo as string) || "";
  const sortBy = (sp.sortBy as string) || "createdAt";
  const sortDir = (sp.sortDir as string) || "DESC";
  const page = (sp.page as string) || "1";
  const pageSize = (sp.pageSize as string) || "20";

  const qs = new URLSearchParams({
    q,
    category,
    createdFrom,
    createdTo,
    sortBy,
    sortDir,
    page,
    pageSize,
  });

  const [articlesRes, catsRes] = await Promise.all([
    fetch(absolute(`/api/articles?${qs.toString()}`), { cache: "no-store" }),

    // ✅ فقط از /api/categories استفاده کن (نه /api/articles/categories)
    fetch(absolute(`/api/categories?sortBy=depth&sortDir=ASC&pageSize=100`), {
      cache: "no-store",
    }),
  ]);

  if (!articlesRes.ok) {
    const err = await articlesRes.text().catch(() => "");
    throw new Error(`Failed to load articles (${articlesRes.status}) ${err}`);
  }

  const articlesJson = await articlesRes.json();
  const catsJson = catsRes.ok ? await catsRes.json() : null;

  const categories = asArray<{ id: string; name?: string; title?: string }>(catsJson).map(
    (c) => ({ id: c.id, name: c.name ?? c.title ?? "بدون‌نام" })
  );

  const articles: LiteArticle[] = asArray<LiteArticle>(articlesJson);
  const total =
    typeof (articlesJson as any)?.total === "number"
      ? (articlesJson as any).total
      : articles.length;

  return (
    <main className="px-10 sm:px-20 py-8" dir="rtl">
      <div className="text-black text-2xl font-semibold mb-4">
        <span>تعداد مقالات </span>
        <span>({total})</span>
      </div>

      <ArticleFilters categories={categories} />

      <div className="grid grid-cols-1 gap-6 mt-9">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </main>
  );
}

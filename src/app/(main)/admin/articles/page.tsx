export const dynamic = "force-dynamic";
export const revalidate = 0;

import ArticleCard from "@/components/article/ArticleCart";
import ArticleFilters from "@/components/article/ArticleFilter";
import Breadcrumb from "@/components/Breadcrumb";
import { ArticleService } from "@/server/modules/articles/services/article.service";
import type {
  SortDir,
  Sortable,
} from "@/server/modules/articles/services/article.service";
import { CategoryService } from "@/server/modules/categories/services/category.service";

type LiteArticleCardShape = {
  id: string;
  title: string;
  subject: string | null;
  createdAt: string;
  category: { id: string; name: string } | null;
  author: { id: string; firstName: string; lastName: string } | null;
  thumbnail: string | null;
  readingPeriod: number;
};

function coerceSortBy(v: string | undefined): Sortable {
  const allow: Sortable[] = [
    "createdAt",
    "updatedAt",
    "viewCount",
    "readingPeriod",
    "title",
    "slug",
  ];
  return allow.includes(v as Sortable) ? (v as Sortable) : "createdAt";
}
function coerceSortDir(v: string | undefined): SortDir {
  return v === "ASC" ? "ASC" : "DESC";
}
function toInt(v: string | undefined, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const q = (sp.q as string) || "";
  const categoryId = (sp.category as string) || "";
  const createdFrom = (sp.createdFrom as string) || "";
  const createdTo = (sp.createdTo as string) || "";
  const sortBy = coerceSortBy(sp.sortBy as string);
  const sortDir = coerceSortDir(sp.sortDir as string);
  const page = toInt(sp.page as string, 1);
  const pageSize = Math.min(toInt(sp.pageSize as string, 20), 100);

  const articleSvc = new ArticleService();
  const categorySvc = new CategoryService();

  const [{ items, total }, catEntities] = await Promise.all([
    articleSvc.listArticles({
      page,
      pageSize,
      sort: { by: sortBy, dir: sortDir },
      filters: {
        q: q || undefined,
        categoryId: categoryId || undefined,
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
      },
      variant: "lite",
    }),
    categorySvc.listCategories(),
  ]);

  const categories = catEntities.map((c) => ({
    id: String(c.id),
    name: String(c.name ?? "بدون‌نام"),
  }));

  const articles: LiteArticleCardShape[] = items.map((a: any) => ({
    id: a.id,
    title: a.title,
    subject: a.subject ?? null,
    createdAt: a.createdAt,
    category: a.categories ? { id: "", name: a.categories } : null,
    author: a.author
      ? {
          id: a.author.id,
          firstName: a.author.firstName,
          lastName: a.author.lastName,
        }
      : null,
    thumbnail: a.thumbnail ?? null,
    readingPeriod: a.readingPeriod ?? 0,
  }));

  return (
    <main className="space-y-7">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
        ]}
      />

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

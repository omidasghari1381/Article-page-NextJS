import Breadcrumb from "@/components/Breadcrumb";
import CategoryRow, { type CategoryNode } from "./CategoryCart";
import { CategoryFilters } from "./CategoryFilters";
import { CategoryService } from "@/server/modules/categories/services/category.service";
import { clampLang, type Lang } from "@/lib/i18n/settings";
import { getServerT } from "@/lib/i18n/get-server-t";

type MaybeWrapped<T> =
  | T[]
  | {
      items: T[];
      total?: number;
      page?: number;
      pageSize?: number;
      pages?: number;
    };

function withLangPath(lang: Lang, path: string) {
  return `/${lang}${path}`;
}

function normalizeCategory(raw: any): CategoryNode {
  return {
    id: raw.id,
    name: raw.name ?? "",
    slug: raw.slug ?? "",
    description: raw.description ?? null,
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date(raw.createdAt).toString?.() || String(raw.createdAt),
    depth: typeof raw.depth === "number" ? raw.depth : 0,
    parent: raw.parent
      ? {
          id: raw.parent.id,
          name: raw.parent.name ?? "",
          slug: raw.parent.slug ?? "",
          children: Array.isArray(raw.parent.children)
            ? raw.parent.children.map(normalizeCategory)
            : undefined,
        }
      : null,
    children: Array.isArray(raw.children)
      ? raw.children.map(normalizeCategory)
      : undefined,
  };
}

async function fetchCategoriesFromService(
  sp: Record<string, string | string[] | undefined>
) {
  const get = (k: string, d = "") => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] ?? d : v ?? d;
  };

  const q = get("q");
  const parentId = get("parentId");
  const hasParent = get("hasParent") as "" | "yes" | "no";
  const createdFrom = get("createdFrom");
  const createdTo = get("createdTo");
  const sortBy = get("sortBy", "createdAt");
  const sortDir =
    (get("sortDir", "DESC") || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
  const pageSize = Math.min(
    Math.max(parseInt(get("pageSize", "20") || "20", 10) || 20, 1),
    100
  );
  const page = Math.max(parseInt(get("page", "1") || "1", 10) || 1, 1);

  const svc = new CategoryService();
  const res = await svc.listWithFilters({
    q: q || undefined,
    parentId: parentId || undefined,
    hasParent: hasParent || undefined,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
    sortBy: (
      ["createdAt", "updatedAt", "name", "slug", "depth"] as const
    ).includes(sortBy as any)
      ? (sortBy as any)
      : "createdAt",
    sortDir,
    page,
    pageSize,
  });

  const items: CategoryNode[] = (res.items ?? []).map(normalizeCategory);
  const total = typeof res.total === "number" ? res.total : items.length;
  return { items, total };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = clampLang(raw);
  const t = await getServerT(lang, "admin");

  const sp = await searchParams;
  const { items: categories, total } = await fetchCategoriesFromService(sp);
  const nf = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US");

  return (
    <main className="pb-24 pt-6 px-4 md:px-10 2xl:px-20 text-skin-base">
      <Breadcrumb
        items={[
          { label: t("breadcrumb.brand"), href: withLangPath(lang, "/") },
          {
            label: t("nav.categories"),
            href: withLangPath(lang, "/admin/categories"),
          },
        ]}
      />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("categories.list.title")}</h1>
      </div>

      <section className="mt-6 bg-skin-bg rounded-2xl shadow-sm border border-skin-border p-6 md:p-8">
        <CategoryFilters />
      </section>

      <div className="py-4 my-10">
        <div className="text-2xl">
          {t("categories.list.count", { count: total })}{" "}
        </div>

        <div className="mt-6 bg-skin-bg border-skin-border">
          <div className="divide-y divide-skin-border">
            {categories.map((c: CategoryNode) => (
              <CategoryRow key={c.id} item={c} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// app/categories/Page.tsx
import CategoryRow from "./CategoryCart";
import CategoryCard, { type CategoryNode } from "./CategoryCart"; // مسیر را با پروژه خودت تنظیم کن

type MaybeWrapped<T> =
  | T[]
  | {
      items: T[];
      total?: number;
      page?: number;
      pageSize?: number;
      pages?: number;
    };

// نرمال‌سازی داده برای تطبیق با CategoryNode
function normalizeCategory(raw: any): CategoryNode {
  return {
    id: raw.id,
    name: raw.name ?? "",
    slug: raw.slug ?? "",
    description: raw.description ?? null,
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date(raw.createdAt).toISOString(),
    depth: typeof raw.depth === "number" ? raw.depth : 0,
    parent: raw.parent
      ? {
          id: raw.parent.id,
          name: raw.parent.name ?? "",
          slug: raw.parent.slug ?? "",
          // اگر API والد.children برگردونه، این هم میاد
          children: Array.isArray(raw.parent.children)
            ? raw.parent.children.map(normalizeCategory)
            : undefined,
        }
      : null,
    // اگر API children برگردونه، اینجا نرمال میشه
    children: Array.isArray(raw.children)
      ? raw.children.map(normalizeCategory)
      : undefined,
  };
}

async function fetchCategories() {
  const res = await fetch("http://localhost:3000/api/categories", {
    cache: "no-store",
  });
  if (!res.ok) {
    try {
      console.error("Failed to load categories:", await res.text());
    } catch {}
    throw new Error("Failed to load categories");
  }

  const payload = (await res.json()) as MaybeWrapped<any>;

  // هم حالت آرایه‌ی خالی، هم آبجکت با items، هر دو ساپورت میشن
  const rawItems = Array.isArray(payload) ? payload : payload.items ?? [];
  const items: CategoryNode[] = rawItems.map(normalizeCategory);
  const total = Array.isArray(payload)
    ? payload.length
    : payload.total ?? items.length;

  return { items, total };
}

export default async function Page() {
  const { items: categories, total } = await fetchCategories();

  return (
    <main>
      <div className="mx-20 py-4 my-10" dir="rtl">
        <div className="text-black text-2xl">
          <span>تعداد دسته‌ها </span>
          <span>({total})</span>
        </div>
        <div className="mt-6 bg-white rounded-2xl ">
          <div className="divide-y">
            {categories.map((c: CategoryNode) => (
              <CategoryRow key={c.id} item={c} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

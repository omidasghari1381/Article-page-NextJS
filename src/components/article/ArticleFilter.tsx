"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type CategoryOption = { id: string; name: string };

const SORT_BY = [
  { label: "تاریخ ایجاد", value: "createdAt" },
  { label: "تاریخ بروزرسانی", value: "updatedAt" },
  { label: "بازدید", value: "viewCount" },
  { label: "مدت مطالعه", value: "readingPeriod" },
  { label: "عنوان", value: "title" },
  { label: "اسلاگ", value: "slug" },
];

function asArray<T = any>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data.items)) return data.items as T[];
  if (Array.isArray(data.data)) return data.data as T[];
  return [];
}

export default function ArticleFilters({
  categories: initialCategories,
}: {
  categories?: CategoryOption[];
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const initial = useMemo(() => {
    const get = (k: string, d = "") => sp.get(k) ?? d;
    return {
      q: get("q"),
      categoryId: get("category") || get("categoryId"),
      createdFrom: get("createdFrom"),
      createdTo: get("createdTo"),
      sortBy: get("sortBy", "createdAt"),
      sortDir: (get("sortDir", "DESC") || "DESC").toUpperCase(),
      pageSize: get("pageSize", "20"),
    };
  }, [sp]);

  const [cats, setCats] = useState<CategoryOption[]>(() => initialCategories?.slice?.() ?? []);
  const [loadingCats, setLoadingCats] = useState(false);

  useEffect(() => {
    if (initialCategories?.length) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingCats(true);
        const res = await fetch("/api/categories?sortBy=depth&sortDir=ASC&pageSize=100", { cache: "no-store" });
        if (!res.ok) throw new Error("failed fetch categories");
        const json = await res.json();
        const arr = asArray<any>(json).map((c) => ({ id: c.id, name: c.name ?? c.title ?? "بدون‌نام" }));
        if (mounted) setCats(arr);
      } catch {
        if (mounted) setCats([]);
      } finally {
        if (mounted) setLoadingCats(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialCategories]);

  const updateQuery = useCallback(
    (patch: Record<string, string | string[] | undefined>) => {
      const usp = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) => {
        usp.delete(k);
        if (Array.isArray(v)) v.filter(Boolean).forEach((val) => usp.append(k, val));
        else if (v) usp.set(k, v);
      });
      usp.set("page", "1");
      router.push(`?${usp.toString()}`);
    },
    [sp, router]
  );

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const q = String(fd.get("q") || "");
    const category = String(fd.get("categoryId") || "");
    const createdFrom = String(fd.get("createdFrom") || "");
    const createdTo = String(fd.get("createdTo") || "");
    const sortBy = String(fd.get("sortBy") || "createdAt");
    const sortDir = String(fd.get("sortDir") || "DESC");
    const pageSize = String(fd.get("pageSize") || "20");

    updateQuery({
      q: q || undefined,
      category: category || undefined,
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
      sortBy,
      sortDir,
      pageSize,
    });
  };

  const onReset = () => router.push(`?`);

  return (
    <form
      onSubmit={onSubmit}
      className="bg-skin-card text-skin-base border border-skin-border rounded-2xl p-4 grid gap-4 md:grid-cols-12"
      dir="rtl"
    >
      {/* q */}
      <div className="md:col-span-4">
        <label className="block text-sm text-skin-muted mb-1">جست‌وجو</label>
        <input
          name="q"
          defaultValue={initial.q}
          placeholder="عنوان / توضیح / اسلاگ"
          className="w-full rounded-xl border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border"
        />
      </div>

      {/* دسته‌بندی */}
      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1">دسته‌بندی</label>
        <select
          name="categoryId"
          defaultValue={initial.categoryId || ""}
          className="w-full rounded-xl border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border"
        >
          <option value="">{loadingCats ? "در حال بارگذاری..." : "همه دسته‌ها"}</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* تاریخ‌ها */}
      <div className="md:col-span-2">
        <label className="block text-sm text-skin-muted mb-1">از تاریخ</label>
        <input
          type="date"
          name="createdFrom"
          defaultValue={initial.createdFrom}
          className="w-full rounded-xl border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm text-skin-muted mb-1">تا تاریخ</label>
        <input
          type="date"
          name="createdTo"
          defaultValue={initial.createdTo}
          className="w-full rounded-xl border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border"
        />
      </div>

      {/* sortBy */}
      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1">مرتب‌سازی</label>
        <select
          name="sortBy"
          defaultValue={initial.sortBy}
          className="w-full rounded-xl border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border"
        >
          {SORT_BY.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* sortDir */}
      <div className="md:col-span-2">
        <label className="block text-sm text-skin-muted mb-1">جهت</label>
        <select
          name="sortDir"
          defaultValue={initial.sortDir}
          className="w-full rounded-xl border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border"
        >
          <option value="DESC">نزولی</option>
          <option value="ASC">صعودی</option>
        </select>
      </div>

      {/* pageSize */}
      <div className="md:col-span-2">
        <label className="block text-sm text-skin-muted mb-1">در صفحه</label>
        <select
          name="pageSize"
          defaultValue={initial.pageSize}
          className="w-full rounded-xl border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border"
        >
          <option value="10">10</option><option value="20">20</option><option value="40">40</option>
          <option value="80">80</option><option value="100">100</option>
        </select>
      </div>

      {/* Actions */}
      <div className="md:col-span-12 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onReset}
          className="h-[44px] w-full sm:w-auto px-4 rounded-xl border border-skin-border text-skin-base hover:bg-skin-card/60 text-sm md:text-base whitespace-nowrap leading-none"
        >
          پاکسازی
        </button>

        <button
          type="submit"
          className="h-[44px] w-full sm:w-auto px-4 rounded-xl bg-skin-accent hover:bg-skin-accent-hover text-white transition text-sm md:text-base whitespace-nowrap leading-none"
        >
          اعمال فیلترها
        </button>
      </div>
    </form>
  );
}
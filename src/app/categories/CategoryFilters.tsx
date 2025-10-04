"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** گزینه‌های مرتب‌سازی */
const SORT_BY = [
  { label: "تاریخ ایجاد", value: "createdAt" },
  { label: "تاریخ بروزرسانی", value: "updatedAt" },
  { label: "نام", value: "name" },
  { label: "اسلاگ", value: "slug" },
];

export function CategoryFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const initial = useMemo(() => {
    const get = (k: string, d = "") => sp.get(k) ?? d;

    return {
      q: get("q"),
      parentId: get("parentId"),
      hasParent: get("hasParent"), // "yes" | "no" | ""
      createdFrom: get("createdFrom"),
      createdTo: get("createdTo"),
      sortBy: get("sortBy", "createdAt"),
      sortDir: (get("sortDir", "DESC") || "DESC").toUpperCase(),
      pageSize: get("pageSize", "20"),
    };
  }, [sp]);

  const [hasParent, setHasParent] = useState<"" | "yes" | "no">(
    (initial.hasParent as "" | "yes" | "no") || ""
  );

  const updateQuery = (
    patch: Record<string, string | string[] | undefined>
  ) => {
    const usp = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => {
      usp.delete(k);
      if (Array.isArray(v)) {
        v.filter(Boolean).forEach((val) => usp.append(k, val));
      } else if (v) {
        usp.set(k, v);
      }
    });
    usp.set("page", "1"); // هر بار فیلتر، برگرد صفحه ۱
    router.push(`?${usp.toString()}`);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const q = String(fd.get("q") || "");
    const parentId = String(fd.get("parentId") || "");
    const createdFrom = String(fd.get("createdFrom") || "");
    const createdTo = String(fd.get("createdTo") || "");
    const sortBy = String(fd.get("sortBy") || "createdAt");
    const sortDir = String(fd.get("sortDir") || "DESC");
    const pageSize = String(fd.get("pageSize") || "20");

    updateQuery({
      q: q || undefined,
      parentId: parentId || undefined,
      hasParent: hasParent || undefined, // فقط وقتی انتخاب شده
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
      sortBy,
      sortDir,
      pageSize,
    });
  };

  const onReset = () => {
    setHasParent("");
    router.push(`?`);
  };

  return (
    <form onSubmit={onSubmit} className=" p-4 grid gap-4 md:grid-cols-12">
      {/* q */}
      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1">جستجو</label>
        <input
          name="q"
          defaultValue={initial.q}
          placeholder="نام / اسلاگ / توضیحات"
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* parentId */}
      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1">شناسه والد</label>
        <input
          name="parentId"
          defaultValue={initial.parentId}
          placeholder="UUID والد (اختیاری)"
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* createdFrom */}
      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1">از تاریخ</label>
        <input
          type="date"
          name="createdFrom"
          defaultValue={initial.createdFrom}
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* createdTo */}
      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1">تا تاریخ</label>
        <input
          type="date"
          name="createdTo"
          defaultValue={initial.createdTo}
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>
      {/* hasParent */}
      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1">نوع گره</label>
        <div className="flex gap-2">
          {[
            { label: "همه", value: "" },
            { label: "فقط ریشه", value: "no" },
            { label: "فقط زیرشاخه", value: "yes" },
          ].map((opt) => {
            const active = hasParent === (opt.value as "" | "yes" | "no");
            return (
              <button
                key={opt.value || "all"}
                type="button"
                onClick={() => setHasParent(opt.value as "" | "yes" | "no")}
                className={`px-3 py-1.5 rounded-lg border ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-800 border-gray-200"
                }`}
                aria-pressed={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* sortBy */}
      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1">مرتب‌سازی</label>
        <select
          name="sortBy"
          defaultValue={initial.sortBy}
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {SORT_BY.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* sortDir */}
      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1">جهت</label>
        <select
          name="sortDir"
          defaultValue={initial.sortDir}
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="DESC">نزولی</option>
          <option value="ASC">صعودی</option>
        </select>
      </div>

      {/* pageSize */}
      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1">در صفحه</label>
        <select
          name="pageSize"
          defaultValue={initial.pageSize}
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="40">40</option>
          <option value="80">80</option>
          <option value="100">100</option>
        </select>
      </div>

      {/* Actions */}
      <div className="md:col-span-12 flex items-center gap-2 justify-end">
        {" "}
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
        >
          پاکسازی
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition"
        >
          اعمال فیلتر ها{" "}
        </button>
      </div>
    </form>
  );
}

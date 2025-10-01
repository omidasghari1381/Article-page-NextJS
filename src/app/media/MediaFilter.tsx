"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

export function MediaFilters(props: {
  initial: { q: string; type: string; sort: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(props.initial.q);
  const [type, setType] = useState(props.initial.type);
  const [sort, setSort] = useState(props.initial.sort);

  // ساخت URL با پارامترها
  const makeUrl = useCallback(
    (next: { q?: string; type?: string; sort?: string }) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (next.q !== undefined) {
        if (next.q.trim()) sp.set("q", next.q.trim());
        else sp.delete("q");
      }
      if (next.type !== undefined) {
        if (next.type === "all") sp.delete("type");
        else sp.set("type", next.type);
      }
      if (next.sort !== undefined) sp.set("sort", next.sort);

      // صفحه‌بندی را ریست کن
      sp.delete("offset");

      return `/media?${sp.toString()}`;
    },
    [searchParams]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(() => router.push(makeUrl({ q, type, sort })));
    },
    [q, type, sort, makeUrl, router]
  );

  const onClear = useCallback(() => {
    setQ("");
    setType("all");
    setSort("newest");
    startTransition(() => router.push("/media"));
  }, [router]);

  // با تغییر نوع/سورت نیز فوراً اعمال کن (بدون نیاز به اینتر)
  useEffect(() => {
    startTransition(() => router.replace(makeUrl({ type, sort })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, sort]);

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col md:flex-row gap-3 items-stretch md:items-end"
    >
      {/* Search */}
      <div className="flex-1">
        <label className="block text-sm mb-1">جستجو (نام/توضیح)</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="مثلاً: لوگو یا ویدیو معرفی"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
        />
      </div>

      {/* Type */}
      <div className="w-full md:w-44">
        <label className="block text-sm mb-1">نوع</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-3 py-2"
        >
          <option value="all">همه</option>
          <option value="image">تصویر</option>
          <option value="video">ویدیو</option>
        </select>
      </div>

      {/* Sort */}
      <div className="w-full md:w-52">
        <label className="block text-sm mb-1">مرتب‌سازی</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-3 py-2"
        >
          <option value="newest">جدیدترین</option>
          <option value="oldest">قدیمی‌ترین</option>
          <option value="name_asc">نام (الف → ی)</option>
          <option value="name_desc">نام (ی → الف)</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
        >
          اعمال فیلتر
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
        >
          پاک‌سازی
        </button>
      </div>

      {isPending && (
        <span className="text-sm text-gray-500 md:ml-2">در حال به‌روزرسانی…</span>
      )}
    </form>
  );
}
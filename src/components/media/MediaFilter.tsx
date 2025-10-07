"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

export function MediaFilters(props: { initial: { q: string; type: string; sort: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(props.initial.q);
  const [type, setType] = useState(props.initial.type);
  const [sort, setSort] = useState(props.initial.sort);

  const makeUrl = useCallback(
    (next: { q?: string; type?: string; sort?: string }) => {
      const sp = new URLSearchParams(searchParams.toString());

      if (next.q !== undefined) {
        const v = next.q.trim();
        if (v) sp.set("q", v);
        else sp.delete("q");
      }

      if (next.type !== undefined) {
        if (next.type === "all") sp.delete("type");
        else sp.set("type", next.type);
      }

      if (next.sort !== undefined) {
        sp.set("sort", next.sort);
      }

      sp.delete("offset");

      const qs = sp.toString();
      return qs ? `/media?${qs}` : `/media`;
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

  useEffect(() => {
    startTransition(() => router.replace(makeUrl({ type, sort })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, sort]);

  return (
    <form onSubmit={onSubmit} className="mt-6 bg-white p-2 " dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6">
          <label className="block text-sm text-black mb-2">جستجو (نام/توضیح)</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="مثلاً: لوگو یا ویدیو معرفی"
            className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-black mb-2">نوع</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300">
            <option value="all">همه</option>
            <option value="image">تصویر</option>
            <option value="video">ویدیو</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-black mb-2">مرتب‌سازی</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300">
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
            <option value="name_asc">نام (الف → ی)</option>
            <option value="name_desc">نام (ی → الف)</option>
          </select>
        </div>

        <div className="md:col-span-12 flex items-center gap-3 justify-end">
          <div className="flex items-center gap-2">
            <Link href="/media/editor" className="px-5 py-2 rounded-lg bg-white text-black border-black border hover:bg-gray-100 ">
              + افزودن مدیا
            </Link>
          </div>
          <button type="button" onClick={onClear} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">
            پاک‌سازی
          </button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50" disabled={isPending}>
            {isPending ? "در حال به‌روزرسانی…" : "اعمال فیلترها"}
          </button>
        </div>
      </div>
    </form>
  );
}

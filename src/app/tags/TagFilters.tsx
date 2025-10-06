"use client";

import Link from "next/link";
import React from "react";

export type TagFilterState = {
  q: string;
  sortBy: "createdAt" | "updatedAt" | "name" | "slug";
  sortDir: "ASC" | "DESC";
  page: number;
  pageSize: number;
};

type Props = {
  value: TagFilterState;
  onChange: (patch: Partial<TagFilterState>) => void;
  onApply: () => void;
  onReset: () => void;
  loading?: boolean;
};

export default function TagFilters({
  value,
  onChange,
  onApply,
  onReset,
  loading,
}: Props) {
  const { q, sortBy, sortDir, pageSize } = value;

  return (
    <section
      className="mt-6 bg-white rounded-2xl shadow-sm border p-6 md:p-8"
      dir="rtl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <label className="block text-sm text-gray-800 mb-2">جستجو</label>
          <input
            value={q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="نام یا slug تگ…"
            className="w-full rounded-lg border border-gray-200 text-gray-800 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-800 mb-2">
            مرتب‌سازی بر اساس
          </label>
          <select
            value={sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as any })}
            className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="createdAt">تاریخ ایجاد</option>
            <option value="updatedAt">آخرین بروزرسانی</option>
            <option value="name">نام</option>
            <option value="slug">اسلاگ</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-800 mb-2">
            جهت مرتب‌سازی
          </label>
          <select
            value={sortDir}
            onChange={(e) =>
              onChange({ sortDir: e.target.value as "ASC" | "DESC" })
            }
            className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="DESC">نزولی</option>
            <option value="ASC">صعودی</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-800 mb-2">
            تعداد در صفحه
          </label>
          <select
            value={pageSize}
            onChange={(e) => onChange({ pageSize: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-12 flex items-center gap-3 justify-end">
          <Link
            href="/tags/editor"
            className="px-4 py-2 rounded-lg border text-gray-800 hover:bg-gray-50"
          >
            +افزودن تگ{" "}
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-lg border text-gray-800 hover:bg-gray-50 font-medium"
          >
            پاکسازی
          </button>
          <button
            type="button"
            onClick={onApply}
            className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "در حال به‌روزرسانی…" : "اعمال فیلترها"}
          </button>
        </div>
      </div>
    </section>
  );
}

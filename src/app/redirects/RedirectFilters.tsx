"use client";

import React from "react";

export type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export const STATUS_OPTIONS: Array<RedirectDTO["statusCode"]> = [
  301, 302, 307, 308,
] as const;

export const SORTABLE_FIELDS = [
  "createdAt",
  "updatedAt",
  "fromPath",
  "toPath",
  "statusCode",
  "isActive",
] as const;

export type RedirectFilterState = {
  q: string;
  statusCodes: Array<RedirectDTO["statusCode"]>;
  isActive: "" | "true" | "false";
  createdFrom: string; // YYYY-MM-DD
  createdTo: string;   // YYYY-MM-DD
  sortBy: (typeof SORTABLE_FIELDS)[number];
  sortDir: "ASC" | "DESC";
  pageSize: number;
};

type Props = {
  /** مقدار فعلی فیلترها */
  value: RedirectFilterState;
  /** تغییر یک‌جای بخشی از فیلترها؛ مسئول به‌روزرسانی state در والد */
  onChange: (patch: Partial<RedirectFilterState>) => void;
  /** برای اجرای fetch از والد */
  onApply: () => void;
  /** برای پاکسازی از والد (بازگردانی مقادیر پیش‌فرض) */
  onReset: () => void;
  /** اگر والد در حال فچ است برای دکمه‌ی اعمال غیرفعال شود */
  loading?: boolean;
};

export default function RedirectFilters({
  value,
  onChange,
  onApply,
  onReset,
  loading,
}: Props) {
  const {
    q,
    statusCodes,
    isActive,
    createdFrom,
    createdTo,
    sortBy,
    sortDir,
    pageSize,
  } = value;

  const toggleStatus = (code: RedirectDTO["statusCode"]) => {
    const next = statusCodes.includes(code)
      ? statusCodes.filter((c) => c !== code)
      : [...statusCodes, code];
    onChange({ statusCodes: next });
  };

  return (
    <section className="mt-6 bg-white rounded-2xl shadow-sm border p-6 md:p-8" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <label className="block text-sm text-gray-800 mb-2">جستجو</label>
          <input
            value={q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="روی from/to جستجو می‌کند…"
            className="w-full rounded-lg border border-gray-200 text-gray-800 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-800 mb-2">فعال/غیرفعال</label>
          <select
            value={isActive}
            onChange={(e) => onChange({ isActive: e.target.value as any })}
            className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">همه</option>
            <option value="true">فقط فعال</option>
            <option value="false">فقط غیرفعال</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-800 mb-2">از تاریخ (ایجاد)</label>
          <input
            type="date"
            value={createdFrom}
            onChange={(e) => onChange({ createdFrom: e.target.value })}
            className="w-full rounded-lg border border-gray-200 text-gray-800 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-800 mb-2">تا تاریخ (ایجاد)</label>
          <input
            type="date"
            value={createdTo}
            onChange={(e) => onChange({ createdTo: e.target.value })}
            className="w-full rounded-lg border border-gray-200 text-gray-800 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div className="md:col-span-6">
          <label className="block text-sm text-gray-800 mb-2">کدهای وضعیت (چندانتخاب)</label>
          <div className="flex flex-wrap gap-3">
            {STATUS_OPTIONS.map((c) => {
              const active = statusCodes.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleStatus(c)}
                  className={`px-3 py-1.5 rounded-lg border ${
                    active ? "bg-black text-white border-black" : "bg-white text-gray-800 border-gray-200"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-800 mb-2">مرتب‌سازی بر اساس</label>
          <select
            value={sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as any })}
            className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {SORTABLE_FIELDS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-800 mb-2">جهت مرتب‌سازی</label>
          <select
            value={sortDir}
            onChange={(e) => onChange({ sortDir: e.target.value as "ASC" | "DESC" })}
            className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="DESC">نزولی</option>
            <option value="ASC">صعودی</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-800 mb-2">تعداد در صفحه</label>
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

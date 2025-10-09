"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ROLE_OPTIONS = [
  { label: "ADMIN", value: "ADMIN" },
  { label: "EDITOR", value: "EDITOR" },
  { label: "CLIENT", value: "CLIENT" },
];

const SORT_BY = [
  { label: "تاریخ ایجاد", value: "createdAt" },
  { label: "نام", value: "firstName" },
  { label: "نام‌خانوادگی", value: "lastName" },
  { label: "تلفن", value: "phone" },
  { label: "نقش", value: "role" },
  { label: "تاریخ بروزرسانی", value: "updatedAt" },
];

export function UsersFilter() {
  const router = useRouter();
  const sp = useSearchParams();

  const initial = useMemo(() => {
    const get = (k: string, d = "") => sp.get(k) ?? d;

    const selectedRoles = sp.getAll("role").length
      ? sp.getAll("role")
      : get("role")
      ? get("role")!.split(",").filter(Boolean)
      : [];

    return {
      q: get("q"),
      roles: selectedRoles as string[],
      createdFrom: get("createdFrom"),
      createdTo: get("createdTo"),
      sortBy: get("sortBy", "createdAt"),
      sortDir: (get("sortDir", "DESC") || "DESC").toUpperCase(),
      pageSize: get("pageSize", "20"),
    };
  }, [sp]);

  const [roles, setRoles] = useState<string[]>(initial.roles);

  const updateQuery = (patch: Record<string, string | string[] | undefined>) => {
    const usp = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => {
      usp.delete(k);
      if (Array.isArray(v)) {
        v.filter(Boolean).forEach((val) => usp.append(k, val));
      } else if (v) {
        usp.set(k, v);
      }
    });
    usp.set("page", "1");
    router.push(`?${usp.toString()}`);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const q = String(fd.get("q") || "");
    const createdFrom = String(fd.get("createdFrom") || "");
    const createdTo = String(fd.get("createdTo") || "");
    const sortBy = String(fd.get("sortBy") || "createdAt");
    const sortDir = String(fd.get("sortDir") || "DESC");
    const pageSize = String(fd.get("pageSize") || "20");

    updateQuery({
      q: q || undefined,
      role: roles.length ? roles : undefined,
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
      sortBy,
      sortDir,
      pageSize,
    });
  };

  const onClear = () => {
    setRoles([]);
    router.push(`?`);
  };

  const toggleRole = (value: string) => {
    setRoles((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:gap-6 2xl:gap-8 md:grid-cols-12" dir="rtl">
      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1 sm:mb-2">جستجو</label>
        <input
          name="q"
          defaultValue={initial.q}
          placeholder="نام / نام‌خانوادگی / تلفن"
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1 sm:mb-2">از تاریخ</label>
        <input
          type="date"
          name="createdFrom"
          defaultValue={initial.createdFrom}
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1 sm:mb-2">تا تاریخ</label>
        <input
          type="date"
          name="createdTo"
          defaultValue={initial.createdTo}
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1 sm:mb-2">مرتب‌سازی</label>
        <select
          name="sortBy"
          defaultValue={initial.sortBy}
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {SORT_BY.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-6">
        <label className="block text-sm text-gray-600 mb-2">نقش</label>
        <div className="flex flex-wrap gap-3">
          {ROLE_OPTIONS.map((o) => {
            const active = roles.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggleRole(o.value)}
                className={`px-3 py-1.5 rounded-lg border ${active ? "bg-black text-white border-black" : "bg-white text-gray-800 border-gray-200"}`}
                aria-pressed={active}
                title={o.label}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1 sm:mb-2">جهت</label>
        <select
          name="sortDir"
          defaultValue={initial.sortDir}
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="DESC">نزولی</option>
          <option value="ASC">صعودی</option>
        </select>
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1 sm:mb-2">در صفحه</label>
        <select
          name="pageSize"
          defaultValue={initial.pageSize}
          className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {[10,20,40,80,100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Actions: موبایل زیر هم، فول‌عرض؛ از sm کنار هم. ارتفاع ثابت. */}
      <div className="md:col-span-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-2">
        <button
          type="button"
          onClick={onClear}
          className="h-[44px] w-full sm:w-auto px-4 rounded-lg border text-gray-700 hover:bg-gray-50"
        >
          پاکسازی
        </button>
        <button
          type="submit"
          className="h-[44px] w-full sm:w-auto px-5 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
        >
          اعمال فیلتر
        </button>
      </div>
    </form>
  );
}

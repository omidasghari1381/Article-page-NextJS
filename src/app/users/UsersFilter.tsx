"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ROLE_OPTIONS = [
  // با enum واقعی سینک کن
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

    const selectedRoles =
      sp.getAll("role").length
        ? sp.getAll("role")
        : (get("role") ? get("role")!.split(",").filter(Boolean) : []);

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

  // --- لوکال استیت برای دکمه‌های نقش ---
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
    // همیشه صفحه ۱
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

  const onReset = () => {
    setRoles([]);
    router.push(`?`);
  };

  const toggleRole = (value: string) => {
    setRoles((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const clearRoles = () => setRoles([]);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border p-4 grid gap-4 md:grid-cols-12"
    >
      {/* q */}
      <div className="md:col-span-3">
        <label className="block text-sm text-gray-600 mb-1">جستجو</label>
        <input
          name="q"
          defaultValue={initial.q}
          placeholder="نام / نام‌خانوادگی / تلفن"
          className="w-full rounded-xl border px-3 py-2 outline-none focus:ring"
        />
      </div>

      {/* Roles as toggle buttons */}
      <div className="md:col-span-5">
        <label className="block text-sm text-gray-600 mb-2">نقش</label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={clearRoles}
            className={`px-3 py-2 rounded-2xl border text-sm transition ${
              roles.length === 0
                ? "bg-gray-900 text-white border-gray-900"
                : "hover:bg-gray-50"
            }`}
            aria-pressed={roles.length === 0}
          >
            همه نقش‌ها
          </button>

          {ROLE_OPTIONS.map((o) => {
            const active = roles.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggleRole(o.value)}
                className={`px-3 py-2 rounded-2xl border text-sm transition ${
                  active
                    ? "bg-gray-900 text-white border-gray-900"
                    : "hover:bg-gray-50"
                }`}
                aria-pressed={active}
                data-active={active}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {/* نمایش انتخاب‌ها به صورت چیپ‌های کوچک */}
        {roles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {roles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 rounded-xl bg-gray-100 border px-2 py-1 text-xs"
              >
                {r}
                <button
                  type="button"
                  className="hover:text-red-600"
                  onClick={() => toggleRole(r)}
                  aria-label={`حذف ${r}`}
                  title="حذف"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* createdFrom */}
      <div className="md:col-span-2">
        <label className="block text-sm text-gray-600 mb-1">از تاریخ</label>
        <input
          type="date"
          name="createdFrom"
          defaultValue={initial.createdFrom}
          className="w-full rounded-xl border px-3 py-2"
        />
      </div>

      {/* createdTo */}
      <div className="md:col-span-2">
        <label className="block text-sm text-gray-600 mb-1">تا تاریخ</label>
        <input
          type="date"
          name="createdTo"
          defaultValue={initial.createdTo}
          className="w-full rounded-xl border px-3 py-2"
        />
      </div>

      {/* sortBy */}
      <div className="md:col-span-1">
        <label className="block text-sm text-gray-600 mb-1">مرتب‌سازی</label>
        <select
          name="sortBy"
          defaultValue={initial.sortBy}
          className="w-full rounded-xl border px-3 py-2"
        >
          {SORT_BY.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* sortDir */}
      <div className="md:col-span-1">
        <label className="block text-sm text-gray-600 mb-1">جهت</label>
        <select
          name="sortDir"
          defaultValue={initial.sortDir}
          className="w-full rounded-xl border px-3 py-2"
        >
          <option value="DESC">نزولی</option>
          <option value="ASC">صعودی</option>
        </select>
      </div>

      {/* pageSize */}
      <div className="md:col-span-1">
        <label className="block text-sm text-gray-600 mb-1">در صفحه</label>
        <select
          name="pageSize"
          defaultValue={initial.pageSize}
          className="w-full rounded-xl border px-3 py-2"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="40">40</option>
          <option value="80">80</option>
          <option value="100">100</option>
        </select>
      </div>

      {/* Actions */}
      <div className="md:col-span-12 flex items-center gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition"
        >
          اعمال فیلتر
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-xl border hover:bg-gray-50"
        >
          ریست
        </button>
      </div>
    </form>
  );
}

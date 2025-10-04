"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import RedirectCard from "./RedirectCart";

// ---------- Types ----------
type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

type ListResponse = {
  items: RedirectDTO[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

const STATUS_OPTIONS: Array<RedirectDTO["statusCode"]> = [
  301, 302, 307, 308,
] as const;
const SORTABLE_FIELDS = [
  "createdAt",
  "updatedAt",
  "fromPath",
  "toPath",
  "statusCode",
  "isActive",
] as const;

function Page() {
  // ------- فیلترها / سورت / صفحه‌بندی -------
  const [q, setQ] = useState("");
  const [statusCodes, setStatusCodes] = useState<
    Array<RedirectDTO["statusCode"]>
  >([]);
  const [isActive, setIsActive] = useState<"" | "true" | "false">("");
  const [createdFrom, setCreatedFrom] = useState<string>(""); // YYYY-MM-DD
  const [createdTo, setCreatedTo] = useState<string>(""); // YYYY-MM-DD
  const [sortBy, setSortBy] =
    useState<(typeof SORTABLE_FIELDS)[number]>("createdAt");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ------- داده‌ها -------
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ------- QueryString ساز -------
  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (isActive !== "") p.set("isActive", isActive);
    if (statusCodes.length) {
      statusCodes.forEach((c) => p.append("statusCode", String(c)));
    }
    if (createdFrom)
      p.set("createdFrom", new Date(createdFrom + "T00:00:00Z").toISOString());
    if (createdTo)
      p.set("createdTo", new Date(createdTo + "T00:00:00Z").toISOString());
    p.set("sortBy", sortBy);
    p.set("sortDir", sortDir);
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    return p.toString();
  }, [
    q,
    isActive,
    statusCodes,
    createdFrom,
    createdTo,
    sortBy,
    sortDir,
    page,
    pageSize,
  ]);

  // ------- Fetch -------
  const fetchData = async () => {
    try {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setLoading(true);
      setError(null);

      // GET /api/redirects?...
      const res = await fetch(`/api/redirect?${queryString}`, {
        method: "GET",
        cache: "no-store",
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "خطا در دریافت لیست ریدایرکت‌ها");
      }
      const json: ListResponse = await res.json();
      setData(json);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "خطا در دریافت داده");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  // هر بار فیلتری عوض شد، برو صفحه 1
  useEffect(() => {
    setPage(1);
  }, [
    q,
    isActive,
    statusCodes,
    createdFrom,
    createdTo,
    sortBy,
    sortDir,
    pageSize,
  ]);

  // ------- Handlers -------
  const toggleStatus = (code: RedirectDTO["statusCode"]) => {
    setStatusCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const resetFilters = () => {
    setQ("");
    setStatusCodes([]);
    setIsActive("");
    setCreatedFrom("");
    setCreatedTo("");
    setSortBy("createdAt");
    setSortDir("DESC");
    setPage(1);
    setPageSize(20);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    try {
      const res = await fetch("/api/redirect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "حذف ناموفق بود");
      }
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "خطای حذف");
    }
  };

  const handleToggleActive = async (id: string, next: boolean) => {
    try {
      // PATCH /api/redirects/:id  { isActive: next }
      const res = await fetch(`/api/redirect/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "به‌روزرسانی وضعیت ناموفق بود");
      }
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "خطای به‌روزرسانی");
    }
  };

  const redirects = data?.items ?? [];

  return (
    <main className="pb-24 pt-6 px-20">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "ریدایرکت‌ها", href: "/redirects" },
        ]}
      />
      <div className="mt-6 flex items-center justify-between text-gray-800">
        <h1 className="text-2xl font-semibold">لیست ریدایرکت ها</h1>
      </div>
      {/* فیلترها / سورت */}
      <section
        className="mt-6 bg-white rounded-2xl shadow-sm border p-6 md:p-8"
        dir="rtl"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <label className="block text-sm text-gray-800 mb-2">جستجو</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="روی from/to جستجو می‌کند…"
              className="w-full rounded-lg border border-gray-200 text-gray-800 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-gray-800 mb-2">
              فعال/غیرفعال
            </label>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value as any)}
              className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">همه</option>
              <option value="true">فقط فعال</option>
              <option value="false">فقط غیرفعال</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-gray-800 mb-2">
              از تاریخ (ایجاد)
            </label>
            <input
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-200 text-gray-800 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-gray-800 mb-2">
              تا تاریخ (ایجاد)
            </label>
            <input
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              className="w-full rounded-lg border border-gray-200 text-gray-800 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <div className="md:col-span-6">
            <label className="block text-sm text-gray-800 mb-2">
              کدهای وضعیت (چندانتخاب)
            </label>
            <div className="flex flex-wrap gap-3">
              {STATUS_OPTIONS.map((c) => {
                const active = statusCodes.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleStatus(c)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      active
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-800 border-gray-200"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-gray-800 mb-2">
              مرتب‌سازی بر اساس
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
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
            <label className="block text-sm text-gray-800 mb-2">
              جهت مرتب‌سازی
            </label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
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
              onChange={(e) => setPageSize(Number(e.target.value))}
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
              href="/redirects/editor"
              className="px-4 py-2 rounded-lg border text-gray-800 hover:bg-gray-50"
            >
              +افزودن ریدایرکت{" "}
            </Link>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg border text-gray-800 hover:bg-gray-50 font-medium"
            >
              پاکسازی{" "}
            </button>
            <button
              type="button"
              onClick={fetchData}
              className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "در حال به‌روزرسانی…" : "اعمال فیلترها"}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6" dir="rtl">
        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="px-4 py-10 text-center text-gray-800">
              در حال بارگذاری…
            </div>
          ) : redirects.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-500">
              آیتمی یافت نشد.
            </div>
          ) : (
            redirects.map((r) => (
              <RedirectCard
                key={r.id}
                item={r}
                editHref={(id) => `/redirects/editor/${id}`}
                onDeleteClick={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-0 py-6">
          <div className="text-sm text-gray-500">
            {data ? (
              <>
                نمایش{" "}
                <strong>
                  {(data.page - 1) * data.pageSize + 1}–
                  {Math.min(data.page * data.pageSize, data.total)}
                </strong>{" "}
                از <strong>{data.total}</strong>
              </>
            ) : (
              "—"
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || (data?.page || 1) <= 1}
            >
              قبلی
            </button>
            <span className="text-sm text-gray-800">
              صفحه {data?.page || page} از {data?.pages || 1}
            </span>
            <button
              className="px-3 py-1.5 rounded-lg border text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              onClick={() =>
                setPage((p) => (data ? Math.min(data.pages, p + 1) : p + 1))
              }
              disabled={loading || (data ? data.page >= data.pages : true)}
            >
              بعدی
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Page;

/* ===== Helpers ===== */
function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

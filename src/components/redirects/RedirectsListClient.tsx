// src/components/redirects/RedirectsListClient.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import RedirectCard from "./RedirectCard";

export type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListResponse = {
  items: RedirectDTO[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

type Props = {
  initialQueryString: string;
  initialData: ListResponse;
  statusOptions: ReadonlyArray<301 | 302 | 307 | 308>;
  sortableFields: ReadonlyArray<
    | "createdAt"
    | "updatedAt"
    | "fromPath"
    | "toPath"
    | "statusCode"
    | "isActive"
  >;
};

export default function RedirectsListClient({
  initialQueryString,
  initialData,
  statusOptions,
  sortableFields,
}: Props) {
  const [q, setQ] = useState("");
  const [statusCodes, setStatusCodes] = useState<RedirectDTO["statusCode"][]>(
    []
  );
  const [isActive, setIsActive] = useState<"" | "true" | "false">("");
  const [createdFrom, setCreatedFrom] = useState<string>("");
  const [createdTo, setCreatedTo] = useState<string>("");
  const [sortBy, setSortBy] =
    useState<(typeof sortableFields)[number]>("createdAt");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(initialData.page || 1);
  const [pageSize, setPageSize] = useState(initialData.pageSize || 20);
  const [data, setData] = useState<ListResponse | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (isActive !== "") p.set("isActive", isActive);
    if (statusCodes.length)
      statusCodes.forEach((c) => p.append("statusCode", String(c)));
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

  useEffect(() => {
    if (queryString === initialQueryString) return;
    fetchData();
  }, [queryString]);

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

  const fetchData = async () => {
    try {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      setError(null);
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
    setSortBy("createdAt" as any);
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
      const res = await fetch(`/api/redirect/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "به‌روزرسانی وضعیت ناموفق بود");
      }
    } catch (e: any) {
      alert(e?.message || "خطای به‌روزرسانی");
    } finally {
      await fetchData();
    }
  };

  const dataSafe = data ?? initialData;
  const redirects = dataSafe.items ?? [];

  return (
    <main className="pb-24 pt-6 text-skin-base">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[110rem]">
        <Breadcrumb
          items={[
            { label: "مای پراپ", href: "/" },
            { label: "ریدایرکت‌ها", href: "/admin/redirects" },
          ]}
        />

        <section className="mt-6 bg-skin-card rounded-2xl shadow-sm border border-skin-border p-4 sm:p-6 2xl:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 2xl:gap-8">
            <div className="md:col-span-3">
              <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
                جستجو
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="روی from/to جستجو می‌کند…"
                className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border/70 ltr"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
                فعال/غیرفعال
              </label>
              <select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value as any)}
                className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
              >
                <option value="">همه</option>
                <option value="true">فقط فعال</option>
                <option value="false">فقط غیرفعال</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
                از تاریخ (ایجاد)
              </label>
              <input
                type="date"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
                className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
                تا تاریخ (ایجاد)
              </label>
              <input
                type="date"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
                className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
              />
            </div>

            <div className="md:col-span-6">
              <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
                کدهای وضعیت (چندانتخاب)
              </label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {statusOptions.map((c) => {
                  const active = statusCodes.includes(c as any);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleStatus(c as any)}
                      className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition ${
                        active
                          ? "bg-skin-accent text-white border-transparent hover:opacity-90"
                          : "bg-skin-card text-skin-base border-skin-border hover:bg-skin-card/60"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
                مرتب‌سازی بر اساس
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
              >
                {sortableFields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
                جهت مرتب‌سازی
              </label>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as any)}
                className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
              >
                <option value="DESC">نزولی</option>
                <option value="ASC">صعودی</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
                تعداد در صفحه
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 justify-end">
              <Link
                href="/admin/redirects/editor"
                className="px-4 py-2.5 rounded-lg border border-skin-border bg-skin-card text-skin-base hover:bg-skin-card/60 text-center whitespace-nowrap"
              >
                +افزودن ریدایرکت
              </Link>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2.5 rounded-lg border border-skin-border bg-skin-card text-skin-base hover:bg-skin-card/60 whitespace-nowrap"
              >
                پاکسازی
              </button>
              <button
                type="button"
                onClick={fetchData}
                className="px-5 py-2.5 rounded-lg bg-skin-accent hover:bg-skin-accent-hover text-white disabled:opacity-50 whitespace-nowrap"
                disabled={loading}
              >
                {loading ? "در حال به‌روزرسانی…" : "اعمال فیلترها"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6">
          {error && (
            <div className="mb-4 rounded border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 p-3 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {loading ? (
              <div className="px-4 py-10 text-center text-skin-base">
                در حال بارگذاری…
              </div>
            ) : (dataSafe?.items?.length ?? 0) === 0 ? (
              <div className="px-4 py-10 text-center text-skin-muted">
                آیتمی یافت نشد.
              </div>
            ) : (
              redirects.map((r) => (
                <RedirectCard
                  key={r.id}
                  item={r}
                  editHref={(id) => `/admin/redirects/editor/${id}`}
                  onDeleteClick={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between px-0 py-6">
            <div className="text-sm text-skin-muted order-2 sm:order-1 text-center sm:text-right">
              {dataSafe ? (
                <>
                  نمایش{" "}
                  <strong className="text-skin-base">
                    {(dataSafe.page - 1) * dataSafe.pageSize + 1}–
                    {Math.min(
                      dataSafe.page * dataSafe.pageSize,
                      dataSafe.total
                    )}
                  </strong>{" "}
                  از{" "}
                  <strong className="text-skin-base">{dataSafe.total}</strong>
                </>
              ) : (
                "—"
              )}
            </div>
            <div className="order-1 sm:order-2 flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-skin-border bg-skin-card text-skin-base hover:bg-skin-card/60 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading || (dataSafe?.page || 1) <= 1}
              >
                قبلی
              </button>
              <span className="text-sm text-skin-base">
                صفحه {dataSafe?.page || 1} از {dataSafe?.pages || 1}
              </span>
              <button
                className="px-3 py-1.5 rounded-lg border border-skin-border bg-skin-card text-skin-base hover:bg-skin-card/60 disabled:opacity-50"
                onClick={() =>
                  setPage((p) =>
                    dataSafe ? Math.min(dataSafe.pages, p + 1) : p + 1
                  )
                }
                disabled={
                  loading || (dataSafe ? dataSafe.page >= dataSafe.pages : true)
                }
              >
                بعدی
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

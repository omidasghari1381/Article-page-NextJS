"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import type { TagFilterState } from "./TagFilters";
import TagFilters from "./TagFilters";
import TagCard from "./TagCard";

type TagDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = {
  items: TagDTO[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
};

export default function Page() {
  const [filters, setFilters] = useState<TagFilterState>({
    q: "",
    sortBy: "createdAt",
    sortDir: "DESC",
    page: 1,
    pageSize: 20,
  });

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.q.trim()) p.set("q", filters.q.trim());
    p.set("page", String(filters.page));
    p.set("perPage", String(filters.pageSize));
    p.set("sortBy", filters.sortBy);
    p.set("sortDir", filters.sortDir);
    return p.toString();
  }, [filters]);

  const fetchData = async () => {
    try {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setLoading(true);
      setError(null);

      const res = await fetch(`/api/tags?${queryString}`, {
        method: "GET",
        cache: "no-store",
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "خطا در دریافت لیست تگ‌ها");
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "خطا در دریافت داده");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [queryString]);

  // reset page to 1 on filter change
  useEffect(() => {
    setFilters((f) => ({ ...f, page: 1 }));
  }, [filters.q, filters.sortBy, filters.sortDir, filters.pageSize]);

  const handleDelete = async (id: string) => {
    if (!confirm("آیا مطمئنی حذف شود؟")) return;
    try {
      const res = await fetch("/api/tags", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id }),
  cache: "no-store",
});
      if (!res.ok) throw new Error(await res.text());
      await fetchData();
    } catch (err: any) {
      alert(err.message || "خطا در حذف تگ");
    }
  };

  const resetFilters = () =>
    setFilters({
      q: "",
      sortBy: "createdAt",
      sortDir: "DESC",
      page: 1,
      pageSize: 20,
    });

  const tags = data?.items ?? [];

  return (
    <main className="pb-24 pt-6 px-20">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "تگ‌ها", href: "/tags" },
        ]}
      />

      <div className="mt-6 flex items-center justify-between text-gray-800">
        <h1 className="text-2xl font-semibold">لیست تگ‌ها</h1>
      </div>

      <TagFilters
        value={filters}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onApply={fetchData}
        onReset={resetFilters}
        loading={loading}
      />

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
          ) : tags.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-500">
              آیتمی یافت نشد.
            </div>
          ) : (
            tags.map((t) => (
              <TagCard
                key={t.id}
                item={t}
                editHref={`/tags/editor/${t.id}`}
                onDeleteClick={handleDelete}
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
                  {(data.page - 1) * data.perPage + 1}–
                  {Math.min(data.page * data.perPage, data.total)}
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
              onClick={() =>
                setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
              }
              disabled={loading || (data?.page || 1) <= 1}
            >
              قبلی
            </button>
            <span className="text-sm text-gray-800">
              صفحه {data?.page || filters.page} از {data?.pages || 1}
            </span>
            <button
              className="px-3 py-1.5 rounded-lg border text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  page: data ? Math.min(data.pages, f.page + 1) : f.page + 1,
                }))
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

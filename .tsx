// =====================
// app/media/page.tsx
// =====================
import Breadcrumb from "@/components/Breadcrumb";
import type { SimpleMediaType } from "@/server/modules/media/enums/media.enums";
import { absolute } from "@/app/utils/base-url";
import { MediaGrid } from "@/components/media/MediaCart";
import { MediaFilters } from "@/components/media/MediaFilter";

/** ---- Types ---- */
type MediaDTO = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  type: SimpleMediaType;
  createdAt: string;
  updatedAt: string;
};

type ListRes = { items: MediaDTO[]; total: number };

/** ---- Data fetcher (Server-side) ---- */
async function fetchMedia(searchParams: {
  q?: string;
  type?: string;
  sort?: string;
  limit?: string;
  offset?: string;
}): Promise<ListRes> {
  const qs = new URLSearchParams();

  if (searchParams.q) qs.set("q", searchParams.q);
  if (searchParams.type && searchParams.type !== "all") qs.set("type", searchParams.type);
  if (searchParams.sort) qs.set("sort", searchParams.sort);
  qs.set("limit", searchParams.limit ?? "100");
  if (searchParams.offset) qs.set("offset", searchParams.offset);

  const url = absolute(`/api/media?${qs.toString()}`);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load media");
  return (await res.json()) as ListRes;
}

export default async function MediaListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ✅ Next.js 15: await searchParams
  const spRaw = await searchParams;
  const sp = {
    q: typeof spRaw.q === "string" ? spRaw.q : undefined,
    type: typeof spRaw.type === "string" ? spRaw.type : "all",
    sort: typeof spRaw.sort === "string" ? spRaw.sort : "newest",
    limit: typeof spRaw.limit === "string" ? spRaw.limit : "100",
    offset: typeof spRaw.offset === "string" ? spRaw.offset : "0",
  };

  const { items, total } = await fetchMedia(sp);

  return (
    <main className="pb-28 pt-4 sm:pt-6" dir="rtl">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "مای پراپ", href: "/" }, { label: "مدیا", href: "/media" }]} />

        <div className="mt-4 sm:mt-6 flex items-center justify-between text-gray-800">
          <h1 className="text-xl sm:text-2xl font-semibold">لیست مدیا</h1>
        </div>

        <section className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-sm border p-4 sm:p-6 lg:p-8" dir="rtl">
          <MediaFilters initial={{ q: sp.q ?? "", type: sp.type!, sort: sp.sort! }} />
        </section>

        <div className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 mb-2">
          مجموع نتایج: <b>{total}</b>
        </div>

        <MediaGrid items={items} />
      </div>
    </main>
  );
}

// ================================
// components/media/MediaCart.tsx
// ================================
"use client";

import type { SimpleMediaType } from "@/server/modules/media/enums/media.enums";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// اگر type اینجا لازم است دوباره تعریف شود:
export type MediaDTO = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  type: SimpleMediaType;
  createdAt: string;
  updatedAt: string;
};

function getBaseOrigin() {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

function toAbsoluteUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.href;
  } catch {
    const base = getBaseOrigin();
    return new URL(url.replace(/^\/+/, "/"), base || "http://localhost:3000").href;
  }
}

export function MediaGrid({ items }: { items: MediaDTO[] }) {
  const [list, setList] = useState<MediaDTO[]>(() => items?.slice?.() ?? []);
  const [selected, setSelected] = useState<MediaDTO | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setList(items?.slice?.() ?? []);
  }, [items]);

  const gridItems = useMemo(() => list, [list]);

  const handleCopyUrl = async (m: MediaDTO) => {
    const full = toAbsoluteUrl(m.url);
    await navigator.clipboard.writeText(full);
    setCopied(m.id);
    setTimeout(() => setCopied(null), 1200);
  };

  const handleDelete = async (m: MediaDTO) => {
    if (!confirm(`«${m.name}» حذف شود؟`)) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/media/${m.id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "خطا در حذف مدیا");
      }
      router.refresh();
      setList((prev) => prev.filter((x) => x.id !== m.id));
      setSelected(null);
    } catch (err: any) {
      alert(err?.message ?? "خطای نامشخص در حذف");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/*
        - از auto-fill + minmax برای این‌که کارت‌ها تو موبایل خیلی ریز نشن
        - حداقل 160px برای هر کارت
      */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 sm:gap-4 md:gap-5">
        {gridItems.map((m) => (
          <button
            key={m.id}
            className="border rounded-xl p-2 text-right hover:shadow transition bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={() => setSelected(m)}
            title={m.name}
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={toAbsoluteUrl(m.url)} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <video src={toAbsoluteUrl(m.url)} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="line-clamp-1 text-sm font-medium text-black">{m.name}</div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selected ? (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full sm:w-[92vw] sm:max-w-2xl rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-lg max-h-[92vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-between mb-4">
              <h2 className="text-lg font-semibold">جزئیات مدیا</h2>
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="text-black px-4 py-2 rounded-lg border hover:bg-gray-50" onClick={() => setSelected(null)}>
                  بستن
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {selected.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={toAbsoluteUrl(selected.url)} alt={selected.name} className="w-full h-full object-cover" />
                  ) : (
                    <video src={toAbsoluteUrl(selected.url)} className="w-full h-full object-cover" controls />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">نام</div>
                  <div className="font-medium text-black break-words">{selected.name}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">توضیحات</div>
                  <div className="text-gray-800 whitespace-pre-wrap break-words">{selected.description || "—"}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">آدرس (URL)</div>
                  <button
                    className="w-full text-right text-blue-700 underline break-all hover:opacity-80"
                    onClick={() => handleCopyUrl(selected)}
                    title="برای کپی کلیک کنید"
                  >
                    {toAbsoluteUrl(selected.url)}
                  </button>
                  {copied === selected.id && <div className="text-xs text-green-600 mt-1">آدرس کامل کپی شد ✓</div>}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                  <Link href={`/media/editor/${selected.id}`} className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800">
                    ویرایش
                  </Link>

                  <a href={toAbsoluteUrl(selected.url)} target="_blank" className="text-black px-4 py-2 rounded-xl border hover:bg-gray-50" rel="noreferrer">
                    باز کردن فایل
                  </a>

                  <button onClick={() => handleDelete(selected)} disabled={deleting} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60" title="حذف مدیا">
                    {deleting ? "در حال حذف..." : "حذف"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// ==================================
// components/media/MediaFilter.tsx
// ==================================
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
    <form onSubmit={onSubmit} className="-mx-2 sm:mx-0" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        <div className="lg:col-span-6">
          <label className="block text-sm text-black mb-1 sm:mb-2">جستجو (نام/توضیح)</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="مثلاً: لوگو یا ویدیو معرفی"
            className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-3">
          <div>
            <label className="block text-sm text-black mb-1 sm:mb-2">نوع</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="all">همه</option>
              <option value="image">تصویر</option>
              <option value="video">ویدیو</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-black mb-1 sm:mb-2">مرتب‌سازی</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="newest">جدیدترین</option>
              <option value="oldest">قدیمی‌ترین</option>
              <option value="name_asc">نام (الف → ی)</option>
              <option value="name_desc">نام (ی → الف)</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/media/editor"
            className="px-5 py-2.5 rounded-lg bg-white text-black border-black border hover:bg-gray-100 text-center"
          >
            + افزودن مدیا
          </Link>
          <div className="flex gap-2 sm:gap-3">
            <button type="button" onClick={onClear} className="px-4 py-2.5 rounded-lg border text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
              پاک‌سازی
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 w-full sm:w-auto" disabled={isPending}>
              {isPending ? "در حال به‌روزرسانی…" : "اعمال فیلترها"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

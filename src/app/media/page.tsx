import Link from "next/link";
import { Suspense } from "react";
import type { SimpleMediaType } from "@/server/modules/media/enums/media.enums";
import { MediaGrid } from "./mediaCart";
import { MediaFilters } from "./MediaFilter";

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

/** ---- Data fetcher ---- */
async function fetchMedia(searchParams: {
  q?: string;
  type?: string;
  sort?: string;
  limit?: string;
  offset?: string;
}) {
  const qs = new URLSearchParams();

  if (searchParams.q) qs.set("q", searchParams.q);
  if (searchParams.type && searchParams.type !== "all")
    qs.set("type", searchParams.type);
  if (searchParams.sort) qs.set("sort", searchParams.sort);
  qs.set("limit", searchParams.limit ?? "100");
  if (searchParams.offset) qs.set("offset", searchParams.offset);

  const res = await fetch(`http://localhost:3000/api/media?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load media");
  return (await res.json()) as ListRes;
}

/** ---- Page ---- */
export default async function MediaListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // نرمال‌سازی searchParams (تک‌ارزشی)
  const sp = {
    q: typeof searchParams.q === "string" ? searchParams.q : undefined,
    type: typeof searchParams.type === "string" ? searchParams.type : "all",
    sort: typeof searchParams.sort === "string" ? searchParams.sort : "newest",
    limit: typeof searchParams.limit === "string" ? searchParams.limit : "100",
    offset: typeof searchParams.offset === "string" ? searchParams.offset : "0",
  };

  const dataPromise = fetchMedia(sp);

  return (
    <main className="p-6 md:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">مدیا</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/media/editor"
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
          >
            افزودن مدیا
          </Link>
        </div>
      </div>

      <MediaFilters
        initial={{ q: sp.q ?? "", type: sp.type!, sort: sp.sort! }}
      />

      <Suspense fallback={<div className="mt-6">در حال بارگذاری...</div>}>
        <MediaResults dataPromise={dataPromise} />
      </Suspense>
    </main>
  );
}

/** ---- Server component to render results ---- */
async function MediaResults({
  dataPromise,
}: {
  dataPromise: Promise<ListRes>;
}) {
  const { items, total } = await dataPromise;

  return (
    <>
      <div className="text-sm text-gray-500 mt-4 mb-2">
        مجموع نتایج: <b>{total}</b>
      </div>
      <MediaGrid items={items} />
    </>
  );
}

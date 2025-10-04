import { Suspense } from "react";
import type { SimpleMediaType } from "@/server/modules/media/enums/media.enums";
import { MediaFilters } from "./MediaFilter";
import { MediaGrid } from "./MediaCart";
import Breadcrumb from "@/components/Breadcrumb";

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

export default async function MediaListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const spRaw = await searchParams;
  const sp = {
    q: typeof spRaw.q === "string" ? spRaw.q : undefined,
    type: typeof spRaw.type === "string" ? spRaw.type : "all",
    sort: typeof spRaw.sort === "string" ? spRaw.sort : "newest",
    limit: typeof spRaw.limit === "string" ? spRaw.limit : "100",
    offset: typeof spRaw.offset === "string" ? spRaw.offset : "0",
  };

  const dataPromise = fetchMedia(sp);

  return (
    <main className="pb-24 pt-6 px-20" dir="rtl">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مدیا", href: "/media" },
        ]}
      />{" "}
      <div className="mt-6 flex items-center justify-between text-gray-800">
        <h1 className="text-2xl font-semibold">لیست مدیا</h1>
      </div>
      <section
        className="mt-6 bg-white rounded-2xl shadow-sm border p-6 md:p-8"
        dir="rtl"
      >
        <MediaFilters
          initial={{ q: sp.q ?? "", type: sp.type!, sort: sp.sort! }}
        />{" "}
      </section>
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

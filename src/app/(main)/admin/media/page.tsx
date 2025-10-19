import Breadcrumb from "@/components/Breadcrumb";
import { absolute } from "@/app/utils/base-url";
import { MediaFilters } from "@/components/media/MediaFilter";
import type { SimpleMediaType } from "@/server/modules/media/enums/media.enums";
import { MediaGrid } from "@/components/media/MediaCart";

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
    <main className="pb-28 pt-4 sm:pt-6 text-skin-base">
      <div className="mx-auto w-full max-w-8xl sm:px-6">
        <Breadcrumb
          items={[
            { label: "مای پراپ", href: "/" },
            { label: "مدیا", href: "/admin/media" },
          ]}
        />

        <div className="mt-4 sm:mt-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-skin-heading">لیست مدیا</h1>
        </div>

        <section className="mt-4 sm:mt-6 bg-skin-card border border-skin-border rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8" dir="rtl">
          <MediaFilters initial={{ q: sp.q ?? "", type: sp.type!, sort: sp.sort! }} />
        </section>

        <div className="text-xs sm:text-sm text-skin-muted mt-3 sm:mt-4 mb-2">
          مجموع نتایج: <b className="text-skin-heading">{total}</b>
        </div>

        <MediaGrid items={items} />
      </div>
    </main>
  );
}
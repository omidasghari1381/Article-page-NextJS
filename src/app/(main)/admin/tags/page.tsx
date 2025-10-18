import Breadcrumb from "@/components/Breadcrumb";
import TagFilters, { type TagFilterState } from "@/components/tags/TagFilters";
import TagCard, { type TagDTO } from "@/components/tags/TagCard";
import Link from "next/link";
import { TagsService } from "@/server/modules/tags/services/tag.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export type ListResponse = {
  items: TagDTO[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
};

async function getTagsViaService(search: {
  q?: string;
  sortBy?: TagFilterState["sortBy"];
  sortDir?: TagFilterState["sortDir"];
  page?: string;
  perPage?: string;
}): Promise<ListResponse> {
  const svc = new TagsService();

  const page = Math.max(1, Number(search.page ?? "1"));
  const perPage = Math.max(1, Math.min(100, Number(search.perPage ?? "20")));
  const q = typeof search.q === "string" ? search.q : "";
  const sortBy = (search.sortBy ?? "createdAt") as TagFilterState["sortBy"];
  const sortDir = (search.sortDir ?? "DESC") as TagFilterState["sortDir"];

  const {
    items,
    total,
    page: pageNum,
    perPage: per,
  } = await svc.listTags({
    q,
    page,
    perPage,
    sortBy,
    sortDir,
  });

  const pages = per > 0 ? Math.max(1, Math.ceil(total / per)) : 1;

  const normalizedItems: TagDTO[] = items.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description ?? null,
    createdAt: t.createdAt?.toString(),
    updatedAt: t.updatedAt?.toString(),
  }));

  return { items: normalizedItems, total, page: pageNum, perPage: per, pages };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const sortBy = (
    typeof sp.sortBy === "string" ? sp.sortBy : "createdAt"
  ) as TagFilterState["sortBy"];
  const sortDir = (
    typeof sp.sortDir === "string" ? sp.sortDir : "DESC"
  ) as TagFilterState["sortDir"];
  const page = typeof sp.page === "string" ? sp.page : "1";
  const perPageParam = typeof sp.perPage === "string" ? sp.perPage : "20";
  const debug = sp.__debug === "1";

  const {
    items,
    total,
    pages,
    perPage,
    page: pageNum,
  } = await getTagsViaService({
    q,
    sortBy,
    sortDir,
    page,
    perPage: perPageParam,
  });

  const safePages = pages > 0 ? pages : 1;
  const canPrev = pageNum > 1;
  const canNext = pageNum < safePages;

  const buildUrl = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    const clamped = Math.min(Math.max(1, nextPage), safePages);
    params.set("page", String(clamped));
    params.set("perPage", String(perPage));
    const qs = params.toString();
    return qs ? `/admin/tags?${qs}` : "/admin/tags";
  };

  return (
    <main className="pb-24 pt-6" dir="rtl">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[110rem]">
        <Breadcrumb
          items={[
            { label: "مای پراپ", href: "/" },
            { label: "تگ‌ها", href: "/admin/tags" },
          ]}
        />

        <div className="mt-4 sm:mt-6 flex items-center justify-between text-gray-800">
          <h1 className="text-xl sm:text-2xl font-semibold">لیست تگ‌ها</h1>
        </div>

        <TagFilters
          value={{
            q,
            sortBy,
            sortDir,
            page: Number(page),
            pageSize: Number(perPageParam),
          }}
        />

        <section className="mt-6" dir="rtl">
          {debug ? (
            <pre className="mb-4 rounded bg-gray-50 p-3 text-xs text-gray-700 overflow-auto">
              {JSON.stringify(
                {
                  in: { q, sortBy, sortDir, page, perPageParam },
                  out: { total, perPage, pageNum, pages, safePages },
                },
                null,
                2
              )}
            </pre>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-500">
                آیتمی یافت نشد.
              </div>
            ) : (
              items.map((t) => (
                <TagCard
                  key={t.id}
                  item={t}
                  editHref={(id) => `/admin/tags/editor/${id}`}
                />
              ))
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between px-0 py-6">
            <div className="text-sm text-gray-500 order-2 sm:order-1 text-center sm:text-right">
              {total > 0 ? (
                <>
                  نمایش{" "}
                  <strong>
                    {(pageNum - 1) * perPage + 1}–
                    {Math.min(pageNum * perPage, total)}
                  </strong>{" "}
                  از <strong>{total}</strong>
                </>
              ) : (
                "—"
              )}
            </div>

            <div className="order-1 sm:order-2 flex items-center gap-2">
              {canPrev ? (
                <Link
                  className="px-3 py-1.5 rounded-lg border text-gray-800 hover:bg-gray-50 whitespace-nowrap"
                  href={buildUrl(pageNum - 1)}
                >
                  قبلی
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg border text-gray-400 bg-gray-50 cursor-not-allowed whitespace-nowrap">
                  قبلی
                </span>
              )}

              <span className="text-sm text-gray-800">
                صفحه {pageNum} از {safePages}
              </span>

              {canNext ? (
                <Link
                  className="px-3 py-1.5 rounded-lg border text-gray-800 hover:bg-gray-50 whitespace-nowrap"
                  href={buildUrl(pageNum + 1)}
                >
                  بعدی
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg border text-gray-400 bg-gray-50 cursor-not-allowed whitespace-nowrap">
                  بعدی
                </span>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

import "server-only";
import { cookies, headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";
import RedirectsListClient from "@/components/redirects/RedirectsListClient";
import { absolute } from "@/app/utils/base-url";

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

const STATUS_OPTIONS = [301, 302, 307, 308] as const;
const SORTABLE_FIELDS = ["createdAt", "updatedAt", "fromPath", "toPath", "statusCode", "isActive"] as const;

function buildQuery(sp: Record<string, string | string[] | undefined>) {
  const p = new URLSearchParams();
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) || "";

  const q = get("q").trim();
  if (q) p.set("q", q);

  const isActive = get("isActive");
  if (isActive === "true" || isActive === "false") p.set("isActive", isActive);

  const statusCode = sp["statusCode"];
  const codes = (Array.isArray(statusCode) ? statusCode : statusCode ? [statusCode] : []).map(String);
  for (const c of codes) p.append("statusCode", c);

  const createdFrom = get("createdFrom");
  const createdTo = get("createdTo");
  if (createdFrom) p.set("createdFrom", new Date(createdFrom + "T00:00:00Z").toISOString());
  if (createdTo) p.set("createdTo", new Date(createdTo + "T00:00:00Z").toISOString());

  const sortBy = get("sortBy");
  p.set("sortBy", (SORTABLE_FIELDS as readonly string[]).includes(sortBy) ? sortBy : "createdAt");

  const sortDir = get("sortDir");
  p.set("sortDir", sortDir === "ASC" ? "ASC" : "DESC");

  const page = parseInt(get("page") || "1", 10) || 1;
  const pageSize = parseInt(get("pageSize") || "20", 10) || 20;
  p.set("page", String(Math.max(1, page)));
  p.set("pageSize", String(pageSize));

  return p.toString();
}

const getInit = async () => {
  const hdrs = await headers();
  const ck = await cookies();
  return {
    headers: {
      cookie: ck.toString(),
      "x-forwarded-host": hdrs.get("host") ?? undefined,
    } as Record<string, string>,
    cache: "no-store" as const,
  };
};

const fetchRedirects = cache(async (qs: string): Promise<ListResponse | null> => {
  noStore();
  const init = await getInit();
  const res = await fetch(absolute(`/api/redirect?${qs}`), init);
  if (!res.ok) return null;
  return (await res.json()) as ListResponse;
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = buildQuery(sp);
  const initial =
    (await fetchRedirects(qs)) ??
    ({ items: [], total: 0, page: 1, pageSize: 20, pages: 1 } satisfies ListResponse);

  return (
    <RedirectsListClient
      initialQueryString={qs}
      initialData={initial}
      statusOptions={STATUS_OPTIONS as any}
      sortableFields={SORTABLE_FIELDS as any}
    />
  );
}

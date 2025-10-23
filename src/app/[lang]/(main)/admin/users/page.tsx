export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { UserService } from "@/server/modules/users/services/users.service";
import { clampLang, type Lang } from "@/lib/i18n/settings";
import { getServerT } from "@/lib/i18n/get-server-t";
import UsersFilter from "./UsersFilter";
import UserListItem from "./UserCard";

type SearchParams = Record<string, string | string[] | undefined>;

function arr(v?: string | string[]) {
  if (!v) return undefined;
  return Array.isArray(v) ? v : v.split(",").map((s) => s.trim()).filter(Boolean);
}

function withLangPath(lang: Lang, path: string) {
  return `/${lang}${path}`;
}

export default async function UsersListPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: SearchParams;
}) {
  const { lang: raw } = await params;
  const lang: Lang = clampLang(raw);
  const t = await getServerT(lang, "admin");

  const svc = new UserService();

  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const roleParams = arr(searchParams.role);
  const sortBy = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "createdAt";
  const sortDir = (typeof searchParams.sortDir === "string" ? searchParams.sortDir : "DESC").toUpperCase();
  const page = Number(searchParams.page ?? "1") || 1;
  const pageSize = Number(searchParams.pageSize ?? "20") || 20;
  const createdFrom = typeof searchParams.createdFrom === "string" ? searchParams.createdFrom : undefined;
  const createdTo = typeof searchParams.createdTo === "string" ? searchParams.createdTo : undefined;
  const withDeleted = (searchParams.withDeleted ?? "1") as string | undefined;
  const deletedOnly = typeof searchParams.deletedOnly === "string" ? searchParams.deletedOnly : undefined;

  const list = await svc.userList({
    q,
    role: roleParams,
    sortBy,
    sortDir: sortDir === "ASC" ? "ASC" : "DESC",
    page,
    pageSize,
    createdFrom,
    createdTo,
    withDeleted: withDeleted === "1",
    deletedOnly: deletedOnly === "1",
  } as any);

  const nf = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US");

  return (
    <main className="pb-24 pt-6 text-skin-base">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[110rem]">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.brand"), href: withLangPath(lang, "/") },
            { label: t("breadcrumb.admin"), href: withLangPath(lang, "/admin") },
            { label: t("nav.users"), href: withLangPath(lang, "/admin/users") },
          ]}
        />

        <div className="mt-4 sm:mt-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-skin-heading">
            {t("users.list.title")}
          </h1>
        </div>

        <section className="mt-6 bg-skin-card rounded-2xl shadow-sm border border-skin-border p-4 sm:p-6 2xl:p-8">
          <UsersFilter sp={searchParams} lang={lang} />
        </section>

        <div className="mt-4 text-sm text-skin-muted">
          {t("users.list.summary", {
            total: nf.format(list.total),
            page: list.page,
            pages: list.pages,
          })}
        </div>

        <section className="mt-6 space-y-4">
          {list.items.map((u: any) => (
            <UserListItem key={u.id} item={u} lang={lang} />
          ))}
        </section>

        <Pagination
          lang={lang}
          total={list.total}
          page={list.page}
          pageSize={list.pageSize}
          sp={searchParams}
        />
      </div>
    </main>
  );
}

function Pagination({
  lang,
  total,
  page,
  pageSize,
  sp,
}: {
  lang: Lang;
  total: number;
  page: number;
  pageSize: number;
  sp: SearchParams;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const makeHref = (p: number) => {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (Array.isArray(v)) v.forEach((x) => usp.append(k, x));
      else if (typeof v === "string") usp.set(k, v);
    }
    usp.set("page", String(p));
    return `?${usp.toString()}`;
  };

  const tPrev = "«";
  const tNext = "»";

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={makeHref(Math.max(1, page - 1))}
        className="px-3 py-2 rounded-xl border border-skin-border text-sm hover:bg-skin-card/60 aria-disabled:opacity-50"
        aria-disabled={page === 1}
        hrefLang={lang}
      >
        {tPrev}
      </Link>
      <span className="px-3 py-2 text-sm text-skin-muted">
        {page} / {pages}
      </span>
      <Link
        href={makeHref(Math.min(pages, page + 1))}
        className="px-3 py-2 rounded-xl border border-skin-border text-sm hover:bg-skin-card/60 aria-disabled:opacity-50"
        aria-disabled={page === pages}
        hrefLang={lang}
      >
        {tNext}
      </Link>
    </div>
  );
}
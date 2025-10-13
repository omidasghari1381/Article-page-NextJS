import { Suspense } from "react";
import { headers } from "next/headers";
import { UsersFilter } from "./UsersFilter";
import UserListItem from "./UserCard";
import Breadcrumb from "@/components/Breadcrumb";

type SearchParams = Record<string, string | string[] | undefined> | undefined;

type ListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

type UserDTO = {
  id: string;
  firstName: string;
  lastName: string;
  role: string | number;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: number;
};

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  const h = headers();
  const host = (await h).get("x-forwarded-host") ?? (await h).get("host");
  const proto = (await h).get("x-forwarded-proto") ?? "http";
  if (!host) throw new Error("Host header is missing");
  return `${proto}://${host}`;
}

function toQS(
  obj: Record<string, string | number | undefined | (string | number)[]>
) {
  const usp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((x) => usp.append(k, String(x)));
    else if (v !== undefined) usp.set(k, String(v));
  });
  return usp.toString();
}

async function fetchUsers(sp: SearchParams) {
  const q = typeof sp?.q === "string" ? sp.q : undefined;
  const role = sp?.role;
  const roleParams = Array.isArray(role)
    ? role
    : typeof role === "string"
    ? role.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const sortBy = typeof sp?.sortBy === "string" ? sp.sortBy : "createdAt";
  const sortDir = typeof sp?.sortDir === "string" ? sp.sortDir : "DESC";
  const page = typeof sp?.page === "string" ? sp.page : "1";
  const pageSize = typeof sp?.pageSize === "string" ? sp.pageSize : "20";
  const createdFrom = typeof sp?.createdFrom === "string" ? sp.createdFrom : undefined;
  const createdTo = typeof sp?.createdTo === "string" ? sp.createdTo : undefined;
  const withDeleted = typeof sp?.withDeleted === "string" ? sp.withDeleted : "1";
  const deletedOnly = typeof sp?.deletedOnly === "string" ? sp.deletedOnly : undefined;

  const qs = toQS({
    q, sortBy, sortDir, page, pageSize, createdFrom, createdTo, withDeleted,
    ...(deletedOnly ? { deletedOnly } : {}),
    ...(roleParams ? { role: roleParams } : {}),
  });

  const base = getBaseUrl();
  const url = new URL(`/api/users?${qs}`, await base);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to fetch users");
  }
  const data = (await res.json()) as ListResponse<UserDTO>;
  return data;
}

export default async function UsersListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const data = await fetchUsers(sp);

  return (
    <main className="pb-24 pt-6">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[110rem]">
        <Breadcrumb items={[{ label: "مای پراپ", href: "/" }, { label: "کاربران", href: "/admin/users" }]} />

        <div className="mt-4 sm:mt-6 flex items-center justify-between text-gray-800">
          <h1 className="text-xl sm:text-2xl font-semibold">لیست کاربران</h1>
        </div>

        <section className="mt-6 bg-white rounded-2xl shadow-sm border p-4 sm:p-6 2xl:p-8">
          <Suspense fallback={null}>
            <UsersFilter />
          </Suspense>
        </section>

        <div className="mt-4 text-sm text-gray-500">
          {data.total.toLocaleString("fa-IR")} کاربر • صفحه {data.page} از {data.pages}
        </div>

        <section className="mt-6 space-y-4">
          {data.items.map((u) => (
            <UserListItem key={u.id} item={u} />
          ))}
        </section>

        <Pagination total={data.total} page={data.page} pageSize={data.pageSize} />
      </div>
    </main>
  );
}

function Pagination({ total, page, pageSize }: { total: number; page: number; pageSize: number; }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const makeHref = (p: number) => {
    const usp = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
    usp.set("page", String(p));
    return `?${usp.toString()}`;
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <a href={makeHref(Math.max(1, page - 1))} className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50 aria-disabled:opacity-50" aria-disabled={page === 1}>
        قبلی
      </a>
      <span className="px-3 py-2 text-sm text-gray-600">{page} / {pages}</span>
      <a href={makeHref(Math.min(pages, page + 1))} className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50 aria-disabled:opacity-50" aria-disabled={page === pages}>
        بعدی
      </a>
    </div>
  );
}

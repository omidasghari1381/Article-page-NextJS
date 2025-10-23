import Link from "next/link";
import { getServerT } from "@/lib/i18n/get-server-t";
import type { Lang } from "@/lib/i18n/settings";

const ROLE_OPTIONS = [
  { i18n: "roles.ADMIN", value: "ADMIN" },
  { i18n: "roles.EDITOR", value: "EDITOR" },
  { i18n: "roles.CLIENT", value: "CLIENT" },
];

const SORT_BY = [
  { i18n: "users.filters.sort.createdAt", value: "createdAt" },
  { i18n: "users.filters.sort.firstName", value: "firstName" },
  { i18n: "users.filters.sort.lastName", value: "lastName" },
  { i18n: "users.filters.sort.phone", value: "phone" },
  { i18n: "users.filters.sort.role", value: "role" },
  { i18n: "users.filters.sort.updatedAt", value: "updatedAt" },
];

export default async function UsersFilter({
  sp,
  lang,
}: {
  sp: Record<string, string | string[] | undefined>;
  lang: Lang;
}) {
  const t = await getServerT(lang, "admin");

  const get = (k: string, d = "") =>
    typeof sp[k] === "string" ? (sp[k] as string) : d;
  const multi = (k: string) =>
    Array.isArray(sp[k])
      ? (sp[k] as string[])
      : get(k)
      ? get(k)!.split(",").filter(Boolean)
      : [];

  const initial = {
    q: get("q"),
    roles: multi("role"),
    createdFrom: get("createdFrom"),
    createdTo: get("createdTo"),
    sortBy: get("sortBy", "createdAt"),
    sortDir: (get("sortDir", "DESC") || "DESC").toUpperCase(),
    pageSize: get("pageSize", "20"),
  };

  return (
    <form
      method="GET"
      className="grid gap-4 sm:gap-6 2xl:gap-8 md:grid-cols-12"
    >
      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
          {t("users.filters.search")}
        </label>
        <input
          name="q"
          defaultValue={initial.q}
          placeholder={t("users.filters.searchPlaceholder")}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
          {t("users.filters.fromDate")}
        </label>
        <input
          type="date"
          name="createdFrom"
          defaultValue={initial.createdFrom}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
          {t("users.filters.toDate")}
        </label>
        <input
          type="date"
          name="createdTo"
          defaultValue={initial.createdTo}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
          {t("users.filters.sortBy")}
        </label>
        <select
          name="sortBy"
          defaultValue={initial.sortBy}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        >
          {SORT_BY.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.i18n)}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-6">
        <label className="block text-sm text-skin-muted mb-2">
          {t("users.filters.role")}
        </label>
        <div className="flex flex-wrap gap-3">
          {ROLE_OPTIONS.map((o) => {
            const checked = initial.roles.includes(o.value);
            return (
              <label
                key={o.value}
                className={[
                  "px-3 py-1.5 rounded-lg border cursor-pointer transition-colors",
                  checked
                    ? "bg-skin-accent text-white border-transparent hover:opacity-95"
                    : "bg-skin-card text-skin-base border-skin-border hover:bg-skin-card/60",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  name="role"
                  value={o.value}
                  defaultChecked={checked}
                  className="sr-only"
                />
                {t(o.i18n)}
              </label>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
          {t("users.filters.direction")}
        </label>
        <select
          name="sortDir"
          defaultValue={initial.sortDir}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        >
          <option value="DESC">{t("users.filters.desc")}</option>
          <option value="ASC">{t("users.filters.asc")}</option>
        </select>
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">
          {t("users.filters.perPage")}
        </label>
        <select
          name="pageSize"
          defaultValue={initial.pageSize}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        >
          {[10, 20, 40, 80, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-2">
        <Link href="?">
          <span className="h-[44px] inline-flex items-center justify-center w-full sm:w-auto px-4 rounded-lg border border-skin-border text-skin-base hover:bg-skin-card/60">
            {t("actions.clear")}
          </span>
        </Link>
        <button
          type="submit"
          className="h-[44px] w-full sm:w-auto px-5 rounded-lg bg-skin-accent hover:bg-skin-accent-hover text-white"
        >
          {t("actions.apply")}
        </button>
      </div>
    </form>
  );
}

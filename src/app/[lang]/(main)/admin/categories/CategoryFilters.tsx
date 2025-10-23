"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

const SORT_BY = [
  { i18n: "categories.filters.sort.createdAt", value: "createdAt" },
  { i18n: "categories.filters.sort.updatedAt", value: "updatedAt" },
  { i18n: "categories.filters.sort.name", value: "name" },
  { i18n: "categories.filters.sort.slug", value: "slug" }
];

export function CategoryFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const { t } = useTranslation("admin");

  const initial = useMemo(() => {
    const get = (k: string, d = "") => sp.get(k) ?? d;
    return {
      q: get("q"),
      parentId: get("parentId"),
      hasParent: get("hasParent"),
      createdFrom: get("createdFrom"),
      createdTo: get("createdTo"),
      sortBy: get("sortBy", "createdAt"),
      sortDir: (get("sortDir", "DESC") || "DESC").toUpperCase(),
      pageSize: get("pageSize", "20"),
    };
  }, [sp]);

  const [hasParent, setHasParent] = useState<"" | "yes" | "no">(
    (initial.hasParent as "" | "yes" | "no") || ""
  );

  const updateQuery = (patch: Record<string, string | string[] | undefined>) => {
    const usp = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => {
      usp.delete(k);
      if (Array.isArray(v)) v.filter(Boolean).forEach((val) => usp.append(k, val));
      else if (v) usp.set(k, v);
    });
    usp.set("page", "1");
    router.push(`?${usp.toString()}`);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const q = String(fd.get("q") || "");
    const parentId = String(fd.get("parentId") || "");
    const createdFrom = String(fd.get("createdFrom") || "");
    const createdTo = String(fd.get("createdTo") || "");
    const sortBy = String(fd.get("sortBy") || "createdAt");
    const sortDir = String(fd.get("sortDir") || "DESC");
    const pageSize = String(fd.get("pageSize") || "20");

    updateQuery({
      q: q || undefined,
      parentId: parentId || undefined,
      hasParent: hasParent || undefined,
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
      sortBy,
      sortDir,
      pageSize,
    });
  };

  const onReset = () => {
    setHasParent("");
    router.push(`?`);
  };

  return (
    <form onSubmit={onSubmit} className="p-4 grid gap-4 md:grid-cols-12">
      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1">{t("categories.filters.search")}</label>
        <input
          name="q"
          defaultValue={initial.q}
          placeholder={t("categories.filters.searchPlaceholder")}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1">{t("categories.filters.parentId")}</label>
        <input
          name="parentId"
          defaultValue={initial.parentId}
          placeholder={t("categories.filters.parentIdPlaceholder")}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70 ltr"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1">{t("categories.filters.fromDate")}</label>
        <input
          type="date"
          name="createdFrom"
          defaultValue={initial.createdFrom}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1">{t("categories.filters.toDate")}</label>
        <input
          type="date"
          name="createdTo"
          defaultValue={initial.createdTo}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1">{t("categories.filters.nodeType")}</label>
        <div className="flex gap-2">
          {[
            { label: t("categories.filters.nodeTypeAll"), value: "" },
            { label: t("categories.filters.nodeTypeRoot"), value: "no" },
            { label: t("categories.filters.nodeTypeChild"), value: "yes" },
          ].map((opt) => {
            const active = hasParent === (opt.value as "" | "yes" | "no");
            return (
              <button
                key={opt.value || "all"}
                type="button"
                onClick={() => setHasParent(opt.value as "" | "yes" | "no")}
                className={`px-3 py-1.5 rounded-lg border ${
                  active
                    ? "bg-skin-accent text-white border-skin-accent"
                    : "bg-skin-bg text-skin-base border-skin-border hover:bg-skin-card"
                }`}
                aria-pressed={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1">{t("categories.filters.sortBy")}</label>
        <select
          name="sortBy"
          defaultValue={initial.sortBy}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
        >
          {SORT_BY.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.i18n)}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1">{t("categories.filters.direction")}</label>
        <select
          name="sortDir"
          defaultValue={initial.sortDir}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
        >
          <option value="DESC">{t("categories.filters.desc")}</option>
          <option value="ASC">{t("categories.filters.asc")}</option>
        </select>
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1">{t("categories.filters.perPage")}</label>
        <select
          name="pageSize"
          defaultValue={initial.pageSize}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
        >
          {[10,20,40,80,100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="md:col-span-12 flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-lg border border-skin-border text-skin-base hover:bg-skin-card"
        >
          {t("actions.clear")}
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-skin-accent text-white hover:bg-skin-accent/90 transition"
        >
          {t("actions.apply")}
        </button>
      </div>
    </form>
  );
}
import Link from "next/link";

const ROLE_OPTIONS = [
  { label: "ADMIN", value: "ADMIN" },
  { label: "EDITOR", value: "EDITOR" },
  { label: "CLIENT", value: "CLIENT" },
];

const SORT_BY = [
  { label: "تاریخ ایجاد", value: "createdAt" },
  { label: "نام", value: "firstName" },
  { label: "نام‌خانوادگی", value: "lastName" },
  { label: "تلفن", value: "phone" },
  { label: "نقش", value: "role" },
  { label: "تاریخ بروزرسانی", value: "updatedAt" },
];

export default function UsersFilter({
  sp,
}: {
  sp: Record<string, string | string[] | undefined>;
}) {
  const get = (k: string, d = "") => (typeof sp[k] === "string" ? (sp[k] as string) : d);
  const multi = (k: string) =>
    Array.isArray(sp[k]) ? (sp[k] as string[]) : get(k) ? get(k)!.split(",").filter(Boolean) : [];

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
    <form method="GET" className="grid gap-4 sm:gap-6 2xl:gap-8 md:grid-cols-12" dir="rtl">
      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">جستجو</label>
        <input
          name="q"
          defaultValue={initial.q}
          placeholder="نام / نام‌خانوادگی / تلفن"
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">از تاریخ</label>
        <input
          type="date"
          name="createdFrom"
          defaultValue={initial.createdFrom}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">تا تاریخ</label>
        <input
          type="date"
          name="createdTo"
          defaultValue={initial.createdTo}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">مرتب‌سازی</label>
        <select
          name="sortBy"
          defaultValue={initial.sortBy}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        >
          {SORT_BY.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-6">
        <label className="block text-sm text-skin-muted mb-2">نقش</label>
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
                <input type="checkbox" name="role" value={o.value} defaultChecked={checked} className="sr-only" />
                {o.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">جهت</label>
        <select
          name="sortDir"
          defaultValue={initial.sortDir}
          className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
        >
          <option value="DESC">نزولی</option>
          <option value="ASC">صعودی</option>
        </select>
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm text-skin-muted mb-1 sm:mb-2">در صفحه</label>
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
            پاکسازی
          </span>
        </Link>
        <button
          type="submit"
          className="h-[44px] w-full sm:w-auto px-5 rounded-lg bg-skin-accent hover:bg-skin-accent-hover text-white"
        >
          اعمال فیلتر
        </button>
      </div>
    </form>
  );
}
import Link from "next/link";

export type TagFilterState = {
  q: string;
  sortBy: "createdAt" | "updatedAt" | "name" | "slug";
  sortDir: "ASC" | "DESC";
  page: number;
  pageSize: number; // mapped to perPage
};

type Props = { value: TagFilterState };

export default function TagFilters({ value }: Props) {
  const { q, sortBy, sortDir, pageSize } = value;
  return (
    <section
      className="mt-6 bg-white rounded-2xl shadow-sm border p-4 sm:p-6 2xl:p-8"
      dir="rtl"
    >
      <form method="GET" action="/tags">
        <input type="hidden" name="page" value={1} />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 2xl:gap-8">
          <div className="md:col-span-4">
            <label className="block text-sm text-gray-800 mb-1 sm:mb-2">
              جستجو
            </label>
            <input
              name="q"
              defaultValue={q}
              placeholder="نام یا slug تگ…"
              className="w-full rounded-lg border border-gray-200 text-gray-800 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-gray-800 mb-1 sm:mb-2">
              مرتب‌سازی بر اساس
            </label>
            <select
              name="sortBy"
              defaultValue={sortBy}
              className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="createdAt">تاریخ ایجاد</option>
              <option value="updatedAt">آخرین بروزرسانی</option>
              <option value="name">نام</option>
              <option value="slug">اسلاگ</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-800 mb-1 sm:mb-2">
              جهت مرتب‌سازی
            </label>
            <select
              name="sortDir"
              defaultValue={sortDir}
              className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="DESC">نزولی</option>
              <option value="ASC">صعودی</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-gray-800 mb-1 sm:mb-2">
              تعداد در صفحه
            </label>
            <select
              name="perPage"
              defaultValue={String(pageSize)}
              className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 justify-end">
            <Link
              href="/admin/tags/editor"
              className="px-4 py-2.5 rounded-lg border text-gray-800 hover:bg-gray-50 text-center whitespace-nowrap"
            >
              +افزودن تگ
            </Link>
            <Link
              href="/admin/tags"
              className="px-4 py-2.5 rounded-lg border text-gray-800 hover:bg-gray-50 font-medium text-center whitespace-nowrap"
            >
              پاکسازی
            </Link>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap"
            >
              اعمال فیلترها
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

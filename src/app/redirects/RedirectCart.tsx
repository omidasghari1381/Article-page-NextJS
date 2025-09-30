// components/RedirectCard.tsx
"use client";

import Link from "next/link";

export type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
  createdAt?: string; // ISO (اختیاری)
  updatedAt?: string; // ISO (اختیاری)
};

type Props = {
  item: RedirectDTO;

  /** لینک صفحهٔ ادیت؛ اگر بدهی، دکمهٔ «ویرایش» به صورت <Link> نمایش داده می‌شه */
  editHref?: string | ((id: string) => string);

  /** هندلر مستقیم برای ویرایش؛ اگر editHref ندادی و اینو بدی، دکمهٔ «ویرایش» رو با onClick می‌ذاره */
  onEditClick?: (id: string) => void;

  /** حذف */
  onDeleteClick?: (id: string) => void;

  /** تغییر وضعیت فعال/غیرفعال */
  onToggleActive?: (id: string, next: boolean) => void;

  /** نمایش تاریخ‌ها (پیش‌فرض true) */
  showDates?: boolean;
};

export default function RedirectCard({
  item,
  editHref,
  onEditClick,
  onDeleteClick,
  onToggleActive,
  showDates = true,
}: Props) {
  const { id, fromPath, toPath, statusCode, isActive, createdAt, updatedAt } = item;

  const editLink =
    typeof editHref === "function" ? editHref(id) : typeof editHref === "string" ? `${editHref}` : null;

  return (
    <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-5" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* مسیرها */}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-gray-500 mb-1">fromPath</div>
          <div className="font-mono text-xs md:text-sm text-black break-all ltr">{fromPath}</div>

          <div className="text-[13px] text-gray-500 mt-3 mb-1">toPath</div>
          <div className="font-mono text-xs md:text-sm text-black break-all ltr">{toPath}</div>
        </div>

        {/* وضعیت و کد */}
        <div className="w-full md:w-auto grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-gray-500">کد:</span>
            <span className="px-2 py-1 rounded-lg border text-sm">{statusCode}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] text-gray-500">وضعیت:</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isActive ? "bg-green-600" : "bg-gray-500"}`} />
              {isActive ? "فعال" : "غیرفعال"}
            </span>
          </div>
        </div>
      </div>

      {/* تاریخ‌ها */}
      {showDates && (createdAt || updatedAt) && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500">
          {createdAt && (
            <div>
              <span className="text-gray-400">ایجاد: </span>
              <time dateTime={createdAt}>{formatDateTime(createdAt)}</time>
            </div>
          )}
          {updatedAt && (
            <div>
              <span className="text-gray-400">ویرایش: </span>
              <time dateTime={updatedAt}>{formatDateTime(updatedAt)}</time>
            </div>
          )}
        </div>
      )}

      {/* اکشن‌ها */}
      {(editLink || onEditClick || onDeleteClick || onToggleActive) && (
        <div className="mt-5 flex items-center justify-end gap-2">
          {typeof onToggleActive === "function" && (
            <button
              className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
              onClick={() => onToggleActive(id, !isActive)}
            >
              {isActive ? "غیرفعال کن" : "فعال کن"}
            </button>
          )}

          {editLink ? (
            <Link href={editLink} className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50">
              ویرایش
            </Link>
          ) : typeof onEditClick === "function" ? (
            <button
              className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
              onClick={() => onEditClick(id)}
            >
              ویرایش
            </button>
          ) : null}

          {typeof onDeleteClick === "function" && (
            <button
              className="px-3 py-1.5 rounded-lg bg-red-700 text-white hover:bg-red-800"
              onClick={() => onDeleteClick(id)}
            >
              حذف
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ===== Helpers ===== */
function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return iso;
  }
}

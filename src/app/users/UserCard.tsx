"use client";

import Link from "next/link";
import { useState } from "react";

export type UserDTO = {
  id: string;
  firstName: string;
  lastName: string;
  role: string | number;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: number;
};

type Props = {
  item: UserDTO;
  editHref?: string | ((id: string) => string);
  onEditClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
  showDates?: boolean;
};

export default function UserListItem({
  item,
  editHref,
  onEditClick,
  onDeleteClick,
  showDates = true,
}: Props) {
  const {
    id,
    firstName,
    lastName,
    role,
    phone,
    createdAt,
    updatedAt,
    isDeleted,
  } = item;

  const providedEditLink =
    typeof editHref === "function"
      ? editHref(id)
      : typeof editHref === "string"
      ? editHref
      : null;

  const finalEditHref = providedEditLink ?? `/users/${id}`;

  const [copied, setCopied] = useState(false);

  const copyPhone = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText)
        await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const canDelete = typeof onDeleteClick === "function" && isDeleted !== 1;

  return (
    <div
      className={`rounded-2xl border shadow-sm bg-white p-4 sm:p-5 2xl:p-6 text-black border-gray-300 ${
        isDeleted === 1 ? "opacity-75" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        {/* نام/نقش/وضعیت + تلفن؛ روی موبایل زیر هم */}
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0">
            <div className="text-[13px] text-gray-500 mb-1">نام و نقش</div>
            <div className="flex items-center flex-wrap gap-2 min-w-0">
              <div className="text-base md:text-lg font-semibold truncate max-w-[30ch]">
                {firstName} {lastName}
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 text-gray-700">
                نقش: <strong className="font-semibold">{String(role)}</strong>
              </span>
              {isDeleted === 1 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px]">
                  حذف‌شده
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-[13px] text-gray-500 mb-1">تلفن</div>
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                title={phone}
                className="font-mono text-xs md:text-sm text-black truncate max-w-[24ch] text-left cursor-pointer hover:underline mt-1"
                onClick={() => copyPhone(phone)}
              >
                {phone}
              </button>
              {copied && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px]">
                  کپی شد
                </span>
              )}
            </div>
          </div>
        </div>

        {/* تاریخ‌ها: روی موبایل می‌آد زیر اطلاعات؛ روی دسکتاپ کنار اکشن‌ها */}
        {showDates && (createdAt || updatedAt) && (
          <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 md:order-none">
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

        {/* اکشن‌ها: موبایل فول‌عرض و زیر هم؛ از sm کنار هم و ارتفاع ثابت */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4 md:shrink-0">
          {typeof onEditClick === "function" ? (
            <button
              className="h-[44px] w-full sm:w-auto px-3 rounded-lg border text-gray-700 hover:bg-gray-50 flex justify-center items-center"
              onClick={() => onEditClick(id)}
            >
              ویرایش
            </button>
          ) : (
            <Link
              href={finalEditHref}
              className="h-[44px] w-full sm:w-auto px-3 rounded-lg border text-gray-700 hover:bg-gray-50 flex justify-center items-center"
            >
              ویرایش
            </Link>
          )}

          {typeof onDeleteClick === "function" && (
            <button
              className={`h-[44px] w-full sm:w-auto px-3 rounded-lg text-white text-center ${
                canDelete
                  ? "bg-red-700 hover:bg-red-800"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={() => canDelete && onDeleteClick(id)}
              disabled={!canDelete}
              title={isDeleted === 1 ? "این کاربر قبلاً حذف شده است" : ""}
            >
              حذف
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Helpers */
function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso!;
  }
}

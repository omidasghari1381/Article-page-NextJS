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
};

type Props = {
  item: UserDTO;

  /** لینک صفحه‌ی ویرایش یا فانکشن کلیک */
  editHref?: string | ((id: string) => string);
  onEditClick?: (id: string) => void;

  /** اکشن‌های اختیاری اضافه */
  onDeleteClick?: (id: string) => void;

  /** نمایش زمان‌ها */
  showDates?: boolean;
};

export default function UserListItem({
  item,
  editHref,
  onEditClick,
  onDeleteClick,
  showDates = true,
}: Props) {
  const { id, firstName, lastName, role, phone, createdAt, updatedAt } = item;

  // 1) اگر editHref تابع بود، بسازش
  // 2) اگر رشته بود، همونو بگیر
  // 3) در غیر این صورت پیش‌فرض: /users/${id}
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
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
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

  return (
    <div className="rounded-2xl border shadow-sm bg-white p-4 text-black border-gray-300">
      <div className="flex items-center justify-between gap-4">
        {/* اطلاعات اصلی - استایل لیستی */}
        <div className="flex gap-10 flex-1 min-w-0">
          {/* نام و نقش */}
          <div className="min-w-0">
            <div className="text-[13px] text-gray-500 mb-1">نام و نقش</div>
            <div className="flex items-center flex-wrap gap-2 min-w-0">
              <div className="text-base md:text-lg font-semibold truncate max-w-[30ch]">
                {firstName} {lastName}
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border">
                نقش: <strong className="font-semibold">{String(role)}</strong>
              </span>
            </div>
          </div>

          {/* تلفن (کلیک = کپی) */}
          <div className="min-w-0">
            <div className="text-[13px] text-gray-500 mb-1">تلفن</div>
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                title={phone}
                className="font-mono text-xs md:text-sm text-black ltr truncate max-w-[24ch] text-left cursor-pointer hover:underline"
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

        {/* تاریخ‌ها */}
        {showDates && (createdAt || updatedAt) && (
          <div className="gap-3 text-xs text-gray-500 hidden md:flex">
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
        <div className="flex items-center md:gap-4 gap-3">
          {/* دکمه ویرایش: همیشه نمایش داده می‌شود */}
          {typeof onEditClick === "function" ? (
            <button
              className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
              onClick={() => onEditClick(id)}
            >
              ویرایش
            </button>
          ) : (
            <Link
              href={finalEditHref}
              className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
            >
              ویرایش
            </Link>
          )}

          {/* دکمه حذف اختیاری */}
          {typeof onDeleteClick === "function" && (
            <button
              className="px-3 py-1.5 rounded-lg bg-red-700 text-white hover:bg-red-800"
              onClick={() => onDeleteClick(id)}
            >
              حذف
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Helpers ===== */
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

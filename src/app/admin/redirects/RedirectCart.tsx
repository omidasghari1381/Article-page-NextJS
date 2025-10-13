"use client";

import type { RedirectStatus } from "@/server/modules/redirects/enums/RedirectStatus.enum";
import Link from "next/link";
import { useState } from "react";

export type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: RedirectStatus;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  item: RedirectDTO;
  editHref?: string | ((id: string) => string);
  onEditClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
  onToggleActive?: (id: string, next: boolean) => void;
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

  const [copied, setCopied] = useState<null | "from" | "to">(null);

  const copyToClipboard = async (text: string, which: "from" | "to") => {
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
      setCopied(which);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  return (
    <div className="rounded-2xl border shadow-sm bg-white p-4 sm:p-5 2xl:p-6 text-black">
      {/*

      */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-5">
        {/* مسیرها */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <div className="text-[12px] sm:text-[13px] text-gray-500 mb-1">fromPath</div>
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  title={fromPath}
                  className="font-mono text-xs md:text-sm text-black ltr truncate max-w-full sm:max-w-[40ch] 2xl:max-w-[64ch] text-left cursor-pointer hover:underline"
                  onClick={() => copyToClipboard(fromPath, "from")}
                >
                  {fromPath}
                </button>
                {copied === "from" && (
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px]">
                    کپی شد
                  </span>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[12px] sm:text-[13px] text-gray-500 mb-1">toPath</div>
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  title={toPath}
                  className="font-mono text-xs md:text-sm text-black ltr truncate max-w-full sm:max-w-[40ch] 2xl:max-w-[64ch] text-left cursor-pointer hover:underline"
                  onClick={() => copyToClipboard(toPath, "to")}
                >
                  {toPath}
                </button>
                {copied === "to" && (
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px]">
                    کپی شد
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* تاریخ‌ها */}
        {showDates && (createdAt || updatedAt) && (
          <div className="flex flex-wrap gap-2 md:gap-3 text-[11px] sm:text-xs text-gray-500">
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

        {/* وضعیت + کد + اکشن‌ها */}
        <div className="flex flex-col sm:flex-row md:flex-row items-stretch sm:items-center md:items-center md:gap-4 gap-3 w-full md:w-auto">
          <div className="text-black flex items-center gap-2">
            <span className="text-[12px] sm:text-[13px] mx-1">کد:</span>
            <span className="px-2 py-1 rounded-lg border text-xs sm:text-sm">{statusCode}</span>
          </div>

          <div className="flex items-center">
            <span className="text-[12px] sm:text-[13px] text-gray-500">وضعیت:</span>{" "}
            <span
              className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs ${
                isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isActive ? "bg-green-600" : "bg-gray-500"}`} />
              {isActive ? "فعال" : "غیرفعال"}
            </span>
          </div>

          {(editLink || onEditClick || onDeleteClick || onToggleActive) && (
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-end gap-2 md:gap-2 md:ml-2 w-full md:w-auto">
              {typeof onToggleActive === "function" && (
                <button
                  className="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                  onClick={() => onToggleActive(id, !isActive)}
                >
                  {isActive ? "غیرفعال کن" : "فعال کن"}
                </button>
              )}

              {editLink ? (
                <Link href={editLink} className="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 text-center">
                  ویرایش
                </Link>
              ) : typeof onEditClick === "function" ? (
                <button className="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50" onClick={() => onEditClick(id)}>
                  ویرایش
                </button>
              ) : null}

              {typeof onDeleteClick === "function" && (
                <button className="px-3 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800" onClick={() => onDeleteClick(id)}>
                  حذف
                </button>
              )}
            </div>
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
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return iso;
  }
}

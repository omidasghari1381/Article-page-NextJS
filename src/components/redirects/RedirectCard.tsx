"use client";

import Link from "next/link";
import { useState } from "react";

export type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
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

export default function RedirectCard({ item, editHref, onEditClick, onDeleteClick, onToggleActive, showDates = true }: Props) {
  const { id, fromPath, toPath, statusCode, isActive, createdAt, updatedAt } = item;
  const editLink = typeof editHref === "function" ? editHref(id) : typeof editHref === "string" ? `${editHref}` : null;
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
    <div className="rounded-2xl border shadow-sm bg-white p-4 text-black">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-10 flex-1 min-w-0">
          <div className="min-w-0">
            <div className="text-[13px] text-gray-500 mb-1">fromPath</div>
            <div className="flex items-center gap-2 min-w-0">
              <button type="button" title={fromPath} className="font-mono text-xs md:text-sm text-black ltr truncate max-w-[38ch] text-left cursor-pointer hover:underline" onClick={() => copyToClipboard(fromPath, "from")}>
                {fromPath}
              </button>
              {copied === "from" && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px]">کپی شد</span>
              )}
            </div>

            <div className="text-[13px] text-gray-500 mt-3 mb-1">toPath</div>
            <div className="flex items-center gap-2 min-w-0">
              <button type="button" title={toPath} className="font-mono text-xs md:text-sm text-black ltr truncate max-w-[38ch] text-left cursor-pointer hover:underline" onClick={() => copyToClipboard(toPath, "to")}>
                {toPath}
              </button>
              {copied === "to" && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px]">کپی شد</span>
              )}
            </div>
          </div>
        </div>

        {showDates && (createdAt || updatedAt) && (
          <div className="gap-3 text-xs text-gray-500 flex">
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

        <div className="flex items-center md:gap-4 gap-3">
          <div className="text-black">
            <span className="text-[13px] mx-1">کد:</span>
            <span className="px-2 py-1 rounded-lg border text-sm">{statusCode}</span>
          </div>
          <div>
            <span className="text-[13px] text-gray-500">وضعیت:</span>{" "}
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
              <span className={`h-2 w-2 rounded-full ${isActive ? "bg-green-600" : "bg-gray-500"}`} />
              {isActive ? "فعال" : "غیرفعال"}
            </span>
          </div>

          {(editLink || onEditClick || onDeleteClick || onToggleActive) && (
            <div className="mt-2 md:mt-0 flex items-center justify-end gap-2">
              {typeof onToggleActive === "function" && (
                <button className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50" onClick={() => onToggleActive(id, !isActive)}>
                  {isActive ? "غیرفعال کن" : "فعال کن"}
                </button>
              )}

              {editLink ? (
                <Link href={editLink} className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50">ویرایش</Link>
              ) : typeof onEditClick === "function" ? (
                <button className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50" onClick={() => onEditClick(id)}>ویرایش</button>
              ) : null}

              {typeof onDeleteClick === "function" && (
                <button className="px-3 py-1.5 rounded-lg bg-red-700 text-white hover:bg-red-800" onClick={() => onDeleteClick(id)}>حذف</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return iso as string;
  }
}

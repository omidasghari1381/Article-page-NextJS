"use client";

import Link from "next/link";

export type TagDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  item: TagDTO;
  editHref?: string | ((id: string) => string);
  onEditClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
  showDates?: boolean;
};

export default function TagCard({
  item,
  editHref,
  onEditClick,
  onDeleteClick,
  showDates = true,
}: Props) {
  const { id, name, slug, description, createdAt, updatedAt } = item;

  const editLink =
    typeof editHref === "function"
      ? editHref(id)
      : typeof editHref === "string"
      ? editHref
      : null;

  return (
    <div className="rounded-2xl border shadow-sm bg-white p-4 text-black">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="text-base font-semibold">{name}</div>
          <div className="text-sm text-gray-500 mt-1">@{slug}</div>
          {description && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {showDates && (createdAt || updatedAt) && (
          <div className="gap-3 text-xs text-gray-500 flex flex-col text-left">
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

        <div className="flex items-center gap-2 shrink-0">
          {editLink ? (
            <Link
              href={editLink}
              className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
            >
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
      </div>
    </div>
  );
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

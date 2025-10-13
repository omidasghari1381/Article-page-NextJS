"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

/** ---------- Types ---------- */
export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string; // ISO
  updatedAt?: string;
  depth?: number;
  parent?:
    | (Pick<CategoryNode, "id" | "name" | "slug"> & {
        children?: CategoryNode[];
      })
    | null;
  children?: CategoryNode[];
};

type Props = {
  item: CategoryNode;
  href?: string | ((node: CategoryNode) => string);
  editHref?: string | ((id: string) => string);
  onEditClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
  onViewClick?: (id: string) => void;
  showDates?: boolean;
};

/** ---------- Helpers ---------- */
function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso ?? "—";
  }
}

function timeAgoFa(iso?: string) {
  if (!iso) return "";
  const now = Date.now();
  const diffSec = Math.round((new Date(iso).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, sec] of steps) {
    if (Math.abs(diffSec) >= sec || unit === "second") {
      return rtf.format(Math.round(diffSec / sec), unit);
    }
  }
  return "";
}

const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** ---------- Recursive Tree ---------- */
function TreeList({
  node,
  level = 0,
  makeHref,
  onPick,
}: {
  node: CategoryNode;
  level?: number;
  makeHref: (n: CategoryNode) => string;
  onPick?: (n: CategoryNode) => void;
}) {
  const pr = 8 + level * 12;
  return (
    <li className="py-1">
      <div className="flex items-center justify-between gap-2" style={{ paddingRight: pr }}>
        <Link
          href={makeHref(node)}
          className="text-sm hover:underline truncate"
          title={node.name}
          onClick={() => onPick?.(node)}
        >
          {node.name}
        </Link>
        {node.children?.length ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {node.children.length} زیرمجموعه
          </span>
        ) : null}
      </div>

      {!!node.children?.length && (
        <ul className="mt-1 border-r pr-3 mr-1">
          {node.children!.map((c) => (
            <TreeList key={c.id} node={c} level={level + 1} makeHref={makeHref} onPick={onPick} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** ---------- Card-style (RedirectCard-like) ---------- */
export default function CategoryRow({
  item,
  href,
  editHref,
  onEditClick,
  onDeleteClick,
  onViewClick,
  showDates = true,
}: Props) {
  const { id, name, slug, description, createdAt, updatedAt, parent, children } = item;

  const viewLink = useMemo(() => {
    if (typeof href === "function") return href(item);
    if (typeof href === "string") return href;
    return `/categories/editor/${id}`;
  }, [href, item, slug]);

  const [open, setOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const [copied, setCopied] = useState(false);
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text);
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

  const resolvedEditLink =
    typeof editHref === "function" ? editHref(id) : typeof editHref === "string" ? editHref : null;

  return (
    <div  ref={rowRef} className="rounded-2xl border mt-4 shadow-sm bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        {/* info */}
        <div className="flex gap-10 flex-1 min-w-0">
          <div className="min-w-0">
            <div className="text-[13px] text-gray-500 mb-1">نام</div>
            <div className="flex items-center gap-2 min-w-0">
              {onViewClick ? (
                <button
                  onClick={() => onViewClick(id)}
                  className="text-sm md:text-base font-medium text-black truncate hover:underline"
                  title={name}
                >
                  {name}
                </button>
              ) : (
                <Link
                  href={viewLink}
                  className="text-sm md:text-base font-medium text-black truncate hover:underline"
                  title={name}
                >
                  {name}
                </Link>
              )}
            </div>

            <div className="text-[13px] text-gray-500 mt-3 mb-1">اسلاگ</div>
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => copyToClipboard(slug)}
                className="font-mono text-xs md:text-sm text-black ltr truncate max-w-[38ch] text-left cursor-pointer hover:underline"
                title={slug}
              >
                {slug}
              </button>
              {copied && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px]">
                  کپی شد
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-[13px] text-gray-500 mb-1">والد</div>
            {parent ? (
              <Link
                href={
                  typeof href === "function"
                    ? href({ ...item, id: parent.id, name: parent.name, slug: parent.slug })
                    : typeof href === "string"
                    ? href
                    : `/articles/category/${parent.slug}`
                }
                className="text-sm hover:underline truncate"
                title={parent.name}
              >
                {parent.name}
              </Link>
            ) : (
              <div className="text-sm text-gray-500">بدون والد</div>
            )}

            <div className="text-[13px] text-gray-500 mt-3 mb-1">تعداد فرزند</div>
            <div className="text-sm">
              <span className="px-2 py-1 rounded-lg border">{children?.length ?? 0}</span>
            </div>
          </div>

          {description ? (
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-gray-500 mb-1">توضیحات</div>
              <p className="text-sm text-gray-800 line-clamp-2">{description}</p>
            </div>
          ) : null}
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
          <button
            type="button"
            onClick={() => setOpen((s) => !s)}
            className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            ساختار
            <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {resolvedEditLink ? (
            <Link href={resolvedEditLink} className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50">
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

          {onViewClick ? (
            <button className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50" onClick={() => onViewClick(id)}>
              ویرایش
            </button>
          ) : (
            <Link href={viewLink} className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50">
              ویرایش
            </Link>
          )}
        </div>
      </div>

      {open && (
        <div role="menu" className="mt-3 rounded-xl border shadow-sm bg-white p-3">
          <div className="mb-3">
            <div className="text-xs font-semibold text-gray-500 mb-1">والد</div>
            {parent ? (
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={
                    typeof href === "function"
                      ? href({ ...item, id: parent.id, name: parent.name, slug: parent.slug, children: parent.children })
                      : typeof href === "string"
                      ? href
                      : `/articles/category/${parent.slug}`
                  }
                  className="text-sm hover:underline"
                  title={parent.name}
                >
                  {parent.name}
                </Link>
                {parent.children?.length ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {parent.children.length} زیرمجموعه
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-gray-500">بدون والد</div>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">فرزندان این دسته</div>
            {children?.length ? (
              <ul className="max-h-72 overflow-auto pr-1">
                {children.map((child) => (
                  <TreeList key={child.id} node={child} makeHref={() => viewLink} onPick={() => {}} />
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">بدون فرزند</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { timeAgoFa } from "@/app/utils/date";

type ApiAuthor = { id: string; firstName?: string; lastName?: string };
type ApiReply = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  user: ApiAuthor;
};

type RepliesAccordionProps = {
  commentId: string;
  defaultOpen?: boolean;
  className?: string;
  pageSize?: number;
  reloadSignal?: number;
};

export default function RepliesAccordion({
  commentId,
  defaultOpen = false,
  className = "",
  pageSize = 20,
  reloadSignal,
}: RepliesAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState<ApiReply[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [visible, setVisible] = useState(pageSize);

  useEffect(() => {
    let cancel = false;
    const source = axios.CancelToken.source();

    async function fetchReplies() {
      if (!commentId) return;
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get<{ data: ApiReply[] }>(
          `/api/comments/${encodeURIComponent(commentId)}/replies`,
          { cancelToken: source.token }
        );
        if (!cancel) {
          setReplies(data?.data || []);
          setVisible(pageSize);
        }
      } catch (e: any) {
        if (!axios.isCancel(e)) {
          console.error("fetch replies error:", e);
          if (!cancel) setError("خطا در دریافت پاسخ‌ها");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    if (open) fetchReplies();

    return () => {
      cancel = true;
      source.cancel("abort replies fetch");
    };
  }, [commentId, open, reloadSignal, pageSize]);

  const displayCount = replies.length;
  const showToggle = displayCount > 0 || !open;
  const list = useMemo(() => replies.slice(0, visible), [replies, visible]);

  return (
    <div className={`text-[#2E3232] dark:text-skin-base ${className}`} dir="rtl">
      {showToggle && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="group inline-flex w-full items-center justify-between gap-2 rounded-lg md:w-auto md:rounded-none md:justify-start"
          aria-expanded={open}
          aria-controls={`replies-panel-${commentId}`}
        >
          <span className="hidden md:inline text-sm text-emerald-700 group-hover:text-emerald-800">
            {open ? "مخفی کردن پاسخ‌ها" : `نمایش ${displayCount} پاسخ`}
          </span>
          <Image
            src={"/svg/arrow.svg"}
            alt="arrow"
            width={11}
            height={5}
            className={`mr-3 transition-transform duration-200 dark:invert ${
              open ? "rotate-90" : "-rotate-90"
            }`}
          />
        </button>
      )}

      <div
        id={`replies-panel-${commentId}`}
        className={`transition-all duration-300 overflow-hidden ${
          open
            ? "max-h-[9999px] border-t border-slate-100 dark:border-skin-border"
            : "max-h-0"
        }`}
      >
        {open && (
          <div className="p-3 md:p-4">
            {loading && (
              <div className="text-xs text-slate-500 dark:text-skin-muted">
                در حال دریافت پاسخ‌ها…
              </div>
            )}
            {error && <div className="text-xs text-red-600">{error}</div>}

            {!loading && !error && displayCount > 0 && (
              <ul className="space-y-3 md:space-y-4">
                {list.map((r) => {
                  const author =
                    [r.user?.firstName, r.user?.lastName]
                      .filter(Boolean)
                      .join(" ") || "—";
                  const when = r.createdAt ? timeAgoFa(r.createdAt) : "—";
                  return (
                    <li
                      key={r.id}
                      className="rounded-xl border border-slate-200 dark:border-skin-border p-2.5 md:p-3.5 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 md:gap-3.5">
                        <div className="relative w-8 h-8 md:w-9 md:h-9 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-skin-border bg-slate-100 dark:bg-skin-card shrink-0">
                          <Image
                            src={"/image/author.png"}
                            alt={"author"}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div className="truncate text-[11px] md:text-xs">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {author}
                              </span>
                            </div>
                            <div className="shrink-0 text-[10px] md:text-xs text-slate-500 dark:text-skin-muted flex items-center gap-1">
                              <span>{when}</span>
                            </div>
                          </div>
                          <p className="my-2.5 md:my-4 text-[14px] md:text-[15px] leading-7 text-slate-700 dark:text-skin-base break-words">
                            {r.text}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {!loading && !error && displayCount > visible && (
              <div className="mt-3">
                <button
                  onClick={() => setVisible((v) => v + pageSize)}
                  className="w-full md:w-auto px-3 py-2 md:px-0 md:py-0 text-xs text-emerald-700 hover:underline rounded-lg md:rounded-none border border-slate-200 dark:border-skin-border md:border-0 transition-colors"
                >
                  نمایش بیشتر
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
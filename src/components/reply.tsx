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
  pageSize?: number;        // اختیاری: برای لود تدریجی
  reloadSignal?: number;    // اختیاری: تغییرش باعث refetch می‌شود
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

  // صفحه‌بندی ساده‌ی کلاینتی (اگر خواستی)
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
          setVisible(pageSize); // ریست تعداد نمایشی در هر فچ
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

    // فقط وقتی آکاردئون باز می‌شود، فچ می‌زنیم (اولین‌بار)؛
    // اگر از قبل باز است، بلافاصله فچ کن.
    if (open) fetchReplies();

    return () => {
      cancel = true;
      source.cancel("abort replies fetch");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentId, open, reloadSignal, pageSize]);

  const displayCount = replies.length;

  // اگر هیچ ریپلایی نداریم، تا وقتی باز نشده، دکمه نشان بده که "نمایش 0 پاسخ" نمایش داده نشود
  const showToggle = displayCount > 0 || !open;

  const list = useMemo(() => replies.slice(0, visible), [replies, visible]);

  return (
    <div className={`text-[#2E3232] ${className}`} dir="rtl">
      {showToggle && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800"
        >
          <span>
            {open
              ? "مخفی کردن پاسخ‌ها"
              : `نمایش ${displayCount} پاسخ`}
          </span>
          <Image
            src={"/svg/arrow.svg"}
            alt="arrow"
            width={11}
            height={5}
            className={`object-cover mr-3 transition-transform duration-200 ${
              open ? "rotate-90" : "-rotate-90"
            }`}
          />
        </button>
      )}

      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-[9999px] border-t border-slate-100" : "max-h-0"
        }`}
      >
        {/* وضعیت‌ها */}
        {open && (
          <div className="p-4">
            {loading && (
              <div className="text-xs text-slate-500">در حال دریافت پاسخ‌ها…</div>
            )}
            {error && (
              <div className="text-xs text-red-600">{error}</div>
            )}

            {/* لیست ریپلای‌ها */}
            {!loading && !error && displayCount > 0 && (
              <ul className="space-y-4">
                {list.map((r) => {
                  const author =
                    [r.user?.firstName, r.user?.lastName].filter(Boolean).join(" ") || "—";
                  const when = r.createdAt ? timeAgoFa(r.createdAt) : "—";
                  return (
                    <li key={r.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start gap-3">
                        <div className="relative w-9 h-9 overflow-hidden rounded-full ring-1 ring-slate-200 bg-slate-100 shrink-0">
                          <Image
                            src={"/image/author.png"}
                            alt={"author"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="font-bold text-slate-900">{author}</span>
                            <span className="text-slate-400">•</span>
                            <span>{when}</span>
                          </div>
                          <p className="my-4 text-[15px] leading-7 text-slate-700">
                            {r.text}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* لود بیشتر (اگر ریپلای زیاد باشد) */}
            {!loading && !error && displayCount > visible && (
              <div className="mt-3">
                <button
                  onClick={() => setVisible((v) => v + pageSize)}
                  className="text-xs text-emerald-700 hover:underline"
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
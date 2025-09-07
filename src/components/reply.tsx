import React, { useMemo, useState } from "react";
import Image from "next/image";

type Reply = {
  id: number | string;
  author: string;
  time: string;
  text: string;
  avatar?: string;
};

type RepliesAccordionProps = {
  count?: number; // تعداد کل پاسخ‌ها (برای تیتر)
  replies?: Reply[]; // لیست پاسخ‌ها
  defaultOpen?: boolean; // باز/بسته بودن اولیه
  className?: string;
};

export default function RepliesAccordion({
  count,
  replies,
  defaultOpen = false,
  className = "",
}: RepliesAccordionProps) {
  const fallbackReplies = useMemo<Reply[]>(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        id: i + 1,
        author: "کاربر نمونه",
        time: `${i + 1} ساعت پیش`,
        text: "این یک متن تستی برای پاسخ است. اینجا صرفاً برای نمایش استایل، تایپوگرافی و رفتار آکاردئون استفاده شده است.",
        avatar: "/placeholder-avatar.png",
      })),
    []
  );

  const list = replies?.length ? replies : fallbackReplies;
  const displayCount = typeof count === "number" ? count : list.length;

  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`text-[#2E3232] ${className}`} dir="rtl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800"
      >
        <span>نمایش {displayCount} پاسخ</span>{" "}
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
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-[9999px] border-t border-slate-100" : "max-h-0"
        }`}
      >
        <ul className="p-4 space-y-4">
          {list.map((r) => (
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
                    <span className="font-bold text-slate-900">{r.author}</span>
                    <span className="text-slate-400">•</span>
                    <span>{r.time}</span>
                  </div>
                  <p className="mt-1 text-[15px] leading-7 text-slate-700">
                    {r.text}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <button className="px-2 py-1 rounded-lg hover:bg-slate-50">
                      پاسخ
                    </button>
                    <button className="px-2 py-1 rounded-lg hover:bg-slate-50">
                      گزارش
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* نوار پایین (اختیاری) */}
        <div className="px-4 pb-4 pt-0">
          <button className="w-full text-sm text-emerald-700 hover:text-emerald-800 px-3 py-2 rounded-xl border border-emerald-100 hover:bg-emerald-50">
            افزودن پاسخ جدید
          </button>
        </div>
      </div>
    </div>
  );
}

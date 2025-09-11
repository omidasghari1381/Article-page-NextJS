"use client";
import Image from "next/image";
import React, { useState } from "react";

type SummaryItem = {
  id?: string | number;
  text: string;
  href?: string;
  iconSrc?: string;
};

interface SummaryDropdownProps {
  title?: string;
  items?: SummaryItem[];
}

export default function SummaryDropdown({
  title = "خلاصه آنچه در مقاله می‌خوانیم",
  items = [],
}: SummaryDropdownProps) {
  const [open, setOpen] = useState(true);

  return (
    <section className="relative rounded-sm border border-[#EBEBEB] bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/svg/Rectangle2.svg"
            alt="thumb"
            width={5.910609245300293}
            height={32.08616638183594}
          />
          <Image src="/svg/Notes.svg" alt="thumb" width={28} height={28} />

          <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
        </div>

        <button
          onClick={() => setOpen((p) => !p)}
          className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700"
          aria-label="toggle"
        >
          <svg
            className={`transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "mt-4 max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="space-y-3 pr-2">
          {items.map((it, idx) => (
            <li key={it.id ?? idx} className="flex items-center gap-6">
              {" "}
              <Image
                src="/svg/Rectangle.svg"
                alt="thumb"
                width={5}
                height={22}
                className="rotate-90"
              />
              {it.href ? (
                <a
                  href={it.href}
                  className="text-slate-800 hover:text-emerald-600 font-medium line-clamp-1"
                >
                  {it.text}
                </a>
              ) : (
                <span className="text-slate-800 font-medium line-clamp-1">
                  {it.text}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

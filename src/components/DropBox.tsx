"use client";
import React, { useState } from "react";

type DropBoxProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
};

export default function DropBox({
  title,
  children,
  defaultOpen = false,
  className = "",
  headerClassName = "",
}: DropBoxProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={`
        rounded-sm border p-4 gap-4 transition-colors
        ${open ? "border-[#304C49] dark:border-[#19CCA7]" : "border-slate-200 dark:border-skin-border"}
        bg-white dark:bg-skin-card
        ${className}
      `}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 ${headerClassName}`}
      >
        <h4 className="text-base sm:text-base font-bold text-[#0E1515] dark:text-white">
          {title}
        </h4>
        <span
          className={`
            inline-flex w-6 h-6 items-center justify-center rounded-md text-slate-700 dark:text-white
            transition-transform duration-400 ease-in-out
            ${open ? "-rotate-180" : "rotate-0"}
          `}
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 text-sm leading-7 text-[#2E3232] dark:text-skin-muted">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
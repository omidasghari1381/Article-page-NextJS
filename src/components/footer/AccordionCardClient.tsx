"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  image?: string;
  icon?: React.ReactNode;
};

const dash = (v: any) => {
  if (v == null) return "-";
  const s = String(v).trim();
  return s.length ? s : "-";
};

export default function AccordionCard({
  title,
  children,
  defaultOpen,
  className,
  headerClassName,
  image,
  icon,
}: Props) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <section className={`rounded-2xl border border-skin-border bg-skin-card shadow-sm ${className || ""}`} dir="rtl">
      <div className={`flex items-center justify-between gap-3 px-4 py-3 ${headerClassName || ""}`}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-skin-bg hover:bg-skin-card/60 border border-skin-border transition-colors"
        >
          <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-transform duration-400 ease-in-out ${open ? "rotate-180" : "rotate-0"}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2 text-skin-heading">
          <h4 className="text-sm sm:text-base font-semibold">{dash(title)}</h4>
          {icon ?? (
            <Image src={image || ""} alt="icon" width={30} height={30} className="rounded-sm" />
          )}
        </div>
      </div>

      <div className={`grid transition-all duration-500 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-7 pb-5 pt-0 text-skin-base" dir="ltr">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
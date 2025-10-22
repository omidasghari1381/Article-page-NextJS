"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Item = { id: string | number; title: string; href: string };

const dash = (v: any) => {
  if (v == null) return "-";
  const s = String(v).trim();
  return s.length ? s : "-";
};

export default function TrainingsSliderList({
  title,
  items,
  pageSize,
  className,
  prevIcon,
  nextIcon,
}: {
  title?: string;
  items?: Item[];
  pageSize?: number;
  className?: string;
  prevIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
}) {
  const resolvedTitle = dash(title);
  const data: Item[] = useMemo<Item[]>(
    () => (Array.isArray(items) ? items : []),
    [items]
  );

  const safePageSize = Math.max(1, Number(pageSize || (data.length || 4)));
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil((data.length || 1) / safePageSize));
  const start = page * safePageSize;
  const visible = data.length ? data.slice(start, start + safePageSize) : [];

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <section className={`${className || ""} w-full lg:w-[587.0379px] lg:h-[202.3433px]`} dir="ltr">
      <div className="relative flex items-center justify-center mb-4">
        <button
          onClick={() => canPrev && setPage((p) => p - 1)}
          className="absolute right-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-skin-card hover:bg-skin-card/70 border border-skin-border disabled:opacity-40"
          disabled={!canPrev}
          aria-label="قبلی"
        >
          {prevIcon ?? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-skin-base" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <h3 className="text-sm font-semibold text-skin-heading text-left">
          {resolvedTitle}
        </h3>
        <button
          onClick={() => canNext && setPage((p) => p + 1)}
          className="absolute left-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-skin-card hover:bg-skin-card/70 border border-skin-border disabled:opacity-40"
          disabled={!canNext}
          aria-label="بعدی"
        >
          {nextIcon ?? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-skin-base" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {visible.length ? (
        <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base font-semibold mt-6 sm:mt-10">
          {visible.map((it) => (
            <li key={it.id} className="flex justify-between gap-3 text-right">
              <Link href={it.href} aria-label="مشاهده آموزش" className="shrink-0">
                <Image src="/svg/Arrowleft.svg" alt="arrow" width={16.05} height={16.05} className="ml-1.5 dark:invert" />
              </Link>
              <Link href={it.href} className="text-skin-base hover:text-skin-accent transition-colors leading-7">
                {dash(it.title)}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 sm:mt-10 text-sm sm:text-base font-semibold text-skin-muted text-center">
          -
        </div>
      )}
    </section>
  );
}
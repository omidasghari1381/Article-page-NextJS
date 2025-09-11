"use client";

import { useEffect, useRef, useState } from "react";

type Country = {
  dial: string; // مثل +98
  name: string; // نمایش در منو
  flag: string; // ایموجی پرچم (برای سادگی)
};

const COUNTRIES: Country[] = [
  { dial: "+98", name: "ایران", flag: "🇮🇷" },
  { dial: "+1", name: "United States", flag: "🇺🇸" },
  { dial: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { dial: "+49", name: "Germany", flag: "🇩🇪" },
  { dial: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
];

export default function PhoneInput({
  value,
  onChange,
  defaultDial = "+98",
  className = "",
}: {
  value?: string;
  onChange?: (v: string) => void;
  defaultDial?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dial, setDial] = useState(defaultDial);
  const [phone, setPhone] = useState(value ?? "");
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = COUNTRIES.find((c) => c.dial === dial) ?? COUNTRIES[0];

  return (
    <div ref={rootRef} className={`relative ${className}`} dir="rtl">
      <div
        className={`
          h-11 w-full rounded-2xl border border-gray-300 bg-white
          flex items-center justify-between
          focus-within:ring-2 focus-within:ring-[#19CCA7]/30 focus-within:border-[#19CCA7]/60
        `}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-full pr-3 pl-2 flex items-center gap-2 text-gray-800"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-xl leading-none">{selected.flag}</span>
          <span className="text-sm font-medium">{dial}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3.5 h-3.5 transition ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <span className="w-px h-6 bg-gray-300" aria-hidden />

        <input
          dir="ltr"
          inputMode="tel"
          pattern="[0-9]*"
          placeholder="شماره موبایل را وارد نمایید"
          className="flex-1 bg-transparent h-full px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none"
          value={phone}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/[^\d]/g, "");
            setPhone(onlyDigits);
            onChange?.(onlyDigits);
          }}
        />
      </div>

      {open && (
        <ul
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-56 rounded-2xl border border-gray-200 bg-white shadow-xl p-1 text-sm"
          role="listbox"
        >
          {COUNTRIES.map((c) => (
            <li key={c.dial}>
              <button
                type="button"
                className={`w-full px-3 py-2 rounded-xl flex items-center justify-between hover:bg-gray-50 ${
                  c.dial === dial ? "bg-gray-50" : ""
                }`}
                onClick={() => {
                  setDial(c.dial);
                  setOpen(false);
                }}
                role="option"
                aria-selected={c.dial === dial}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-gray-800">{c.dial}</span>
                </span>
                <span className="text-xs text-gray-500 truncate">{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

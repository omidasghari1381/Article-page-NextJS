"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Country = {
  dial: string;
  name: string;
  flag: string;
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
  placeholder = "شماره موبایل را وارد نمایید",
  disabled = false,
}: {
  value?: string;
  onChange?: (v: string) => void;
  defaultDial?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  const [open, setOpen] = useState(false);
  const [dial, setDial] = useState(defaultDial);
  const [phone, setPhone] = useState(value ?? "");
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // sync controlled value
  useEffect(() => {
    if (typeof value === "string") setPhone(value);
  }, [value]);

  // click outside (برای پورتال هم کار می‌کند)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        rootRef.current &&
        (rootRef.current.contains(t) || menuRef.current?.contains(t))
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // محاسبه موقعیت منو (fixed) بر اساس ریشه
  useEffect(() => {
    if (!open || !rootRef.current) return;

    const update = () => {
      const r = rootRef.current!.getBoundingClientRect();
      const menuW = 224; // w-56
      const gap = 6;
      let left = r.right - menuW; // راست‌چین به لبه راست کنترل
      left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
      const top = r.bottom + gap;
      setPos({ top, left });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  const selected =
    COUNTRIES.find((c) => c.dial === dial) ?? COUNTRIES[0];

  return (
    <div ref={rootRef} className={`relative ${className}`} dir="rtl">
      {/* ردیف کنترل؛ بدون border/radius/bg چون شِل بیرونی کنترل می‌کند */}
      <div className="flex w-full items-center justify-between bg-transparent">
        <button
          type="button"
          onClick={() => !disabled && setOpen((v) => !v)}
          className="h-11 pr-3 pl-2 flex items-center gap-2 text-gray-800 disabled:opacity-60"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
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
          placeholder={placeholder}
          className="flex-1 bg-transparent h-11 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-60"
          value={phone}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/[^\d]/g, "");
            setPhone(onlyDigits);
            onChange?.(onlyDigits);
          }}
          disabled={disabled}
        />
      </div>

      {/* Dropdown via portal (fixed) */}
      {open &&
        pos &&
        createPortal(
          <ul
            ref={menuRef}
            className="fixed z-[1000] w-56 rounded-2xl border border-gray-200 bg-white shadow-xl p-1 text-sm text-black"
            style={{ top: pos.top, left: pos.left }}
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
                  <span className="text-xs text-gray-500 truncate">
                    {c.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { switchLangInPathname } from "@/app/utils/locale-path";

export default function LangSwitch({
  nextLang,     // "fa" | "en"
  label,        // متن دکمه
  className = "",
}: {
  nextLang: "fa" | "en";
  label: string;
  className?: string;
}) {
  const pathname = usePathname() || "/";

  const target = switchLangInPathname(pathname, nextLang);

  const handleClick = () => {
    // set cookie, html attrs (optional اما کمک می‌کند قبل از بارگذاری هم درست شود)
    document.cookie = `lng=${nextLang}; path=/`;
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === "fa" ? "rtl" : "ltr";

    // Hard navigation تا i18n کلاینت کامل re-init شود
    window.location.assign(target);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={`switch to ${nextLang}`}
    >
      {label}
    </button>
  );
}
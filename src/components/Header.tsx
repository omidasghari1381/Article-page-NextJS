"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import Logo from "./Logo";
import { useTheme } from "next-themes";
import i18next from "@/lib/i18n/client";
import { useRouter, usePathname } from "next/navigation";
import { switchLangInPathname } from "@/app/utils/locale-path";
import { useTranslation } from "react-i18next";

const navLink =
  "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-skin-base hover:bg-skin-card/60 transition";

function DD({
  title,
  children,
  summeryClassName = "",
  menuClassName = "",
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  summeryClassName?: string;
  menuClassName?: string;
}) {
  return (
    <details className="relative group">
      <summary
        className={`${navLink} cursor-pointer list-none flex items-center ${summeryClassName}`}
      >
        <span className="text-skin-base">{title}</span>
        <span className="text-xs opacity-60 pr-1">▾</span>
      </summary>
      <div
        className={`absolute top-[110%] right-0 w-56 rounded-md border border-skin-border bg-skin-card shadow-xl p-2 z-30
                    invisible opacity-0 group-open:visible group-open:opacity-100 transition ${menuClassName}`}
      >
        <div className="flex flex-col text-skin-base">{children}</div>
      </div>
    </details>
  );
}

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const langFromPath = useMemo<"fa" | "en">(() => {
    const seg = (pathname || "/").split("/")[1];
    return seg === "en" ? "en" : "fa";
  }, [pathname]);
  const { t } = useTranslation("header");

  useEffect(() => setMounted(true), []);
  const current = mounted ? resolvedTheme : undefined;
useEffect(() => {
  i18next.changeLanguage(langFromPath);

  document.documentElement.lang = langFromPath;
  document.documentElement.dir = langFromPath === "fa" ? "rtl" : "ltr";
  document.cookie = `lng=${langFromPath}; path=/`;
}, [langFromPath]);
  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    requestAnimationFrame(() => {
      setTheme(current === "dark" ? "light" : "dark");
      window.setTimeout(() => {
        root.classList.remove("theme-anim");
      }, 300);
    });
  };

  const toggleLanguage = () => {
    const nextLang: "fa" | "en" = langFromPath === "fa" ? "en" : "fa";
    i18next.changeLanguage(nextLang);

    const nextPath = switchLangInPathname(pathname || "/", nextLang);
    router.replace(nextPath);

    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === "fa" ? "rtl" : "ltr";
    document.cookie = `lng=${nextLang}; path=/`;
  };

  useEffect(() => {
    if (!open) {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.top = "";
      if (top) {
        const y = parseInt(top, 10) * -1;
        window.scrollTo(0, y || 0);
      }
      return;
    }

    const y = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.top = "";
      if (top) {
        const yPrev = parseInt(top, 10) * -1;
        window.scrollTo(0, yPrev || 0);
      }
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-skin-border bg-skin-bg">
      <div className="h-[72px] lg:h-[122px] flex items-center justify-between px-4 sm:px-6 lg:px-20 mx-auto">
        <div className="flex items-center gap-2 lg:gap-3">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1">
            <DD
              title={
                <span className="flex gap-2 items-center justify-center whitespace-nowrap text-sm leading-6">
                  <Image
                    src="/svg/money.svg"
                    alt="money"
                    width={20}
                    height={20}
                    className="dark:invert"
                  />
                  {t("propTrading")}
                </span>
              }
            />
            <span className="inline-flex justify-center items-center whitespace-nowrap bg-[#19CCA7] border border-skin-border px-4 py-2 rounded-sm text-xs font-medium transition w-[64px] h-[28px] text-black">
                  {t("updated")}
            </span>
            <DD
              title={
                <span className="flex items-center text-sm whitespace-nowrap">
                  <Image
                    src="/svg/plan.svg"
                    alt="plan"
                    width={40}
                    height={40}
                    className="dark:invert"
                  />
                  {t("plans")}
                </span>
              }
            />
            <Link
              href="/careers"
              className={`${navLink} text-sm leading-6 whitespace-nowrap`}
            >
              <Image
                src="/svg/groupmen.svg"
                alt="team"
                width={40}
                height={40}
                className="dark:invert"
              />
                  {t("collabration")}
            </Link>
            <DD
              title={
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                    />
                  </svg>
                  {t("aboutUs")}
                </span>
              }
            />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-11 h-11 lg:w-[51px] lg:h-[51px] bg-skin-card rounded-full hover:bg-skin-card/70 border border-skin-border transition"
            aria-label="theme"
          >
            {mounted && current === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-skin-base"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <Image src="/svg/sun.svg" alt="sun" width={20} height={20} />
            )}
          </button>

          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center w-11 h-11 lg:w-[51px] lg:h-[51px] bg-skin-card rounded-full hover:bg-skin-card/70 border border-skin-border transition text-skin-base text-sm"
            aria-label="change language"
          >
            {langFromPath === "fa" ? "EN" : "فا"}
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/contact"
              className="flex items-center justify-center leading-6 text-base gap-2 border border-skin-border px-4 py-2 rounded-sm font-medium hover:bg-skin-card/60 transition text-skin-base w-[150px] h-[51px]"
            >
              <Image
                src="/svg/phone2.svg"
                alt="phone"
                width={20}
                height={20}
                className="dark:invert"
              />
                  {t("contact")}
            </Link>

            <Link
              href="/login"
              className="flex justify-center items-center leading-6 [background:linear-gradient(180deg,#111414_0%,#272F2F_100%)]
                         text-white rounded-sm text-sm font-medium hover:opacity-90 transition w-[150px] h-[51px] dark:invert"
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                  {t("signup")}
              </span>
            </Link>
          </div>

          {/* دکمه منوی موبایل */}
          <button
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-skin-border hover:bg-skin-card/60 text-skin-base"
            onClick={() => setOpen(true)}
            aria-label="open menu"
            aria-expanded={open}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-skin-base"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import { useTheme } from "next-themes";

const navLink =
  "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition text-black";

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
        <span className="dark:text-white">{title}</span>
        <span className="text-xs opacity-60 pr-1 dark:text-white">▾</span>
      </summary>
      <div
        className={`absolute top-[110%] right-0 w-56 rounded-sm border border-gray-200 bg-white shadow-xl p-2 z-30
                    invisible opacity-0 group-open:visible group-open:opacity-100 transition ${menuClassName} `}
      >
        <div className="flex flex-col ">{children}</div>
      </div>
    </details>
  );
}

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? resolvedTheme : undefined;

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

  const [open, setOpen] = useState(false);

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
    <header
      className="sticky top-0 z-40  border-b border-gray-200 backdrop-blur-none lg:backdrop-blur dark:border-blue-900 bg-white dark:bg-[rgb15 23 42]"
    >
      <div className="h-[72px] lg:h-[122px] flex items-center justify-between px-4 sm:px-6 lg:px-20 mx-auto">
        <div className="flex items-center gap-2 lg:gap-3">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1 ">
            <DD
              title={
                <span className="flex gap-2 items-center justify-center whitespace-nowrap text-sm leading-6 dark:text-white">
                  <Image
                    src="/svg/money.svg"
                    alt="money"
                    width={20}
                    height={20}
                  />
                  پراپ تریدینگ
                </span>
              }
            />
            <span className="inline-flex justify-center items-center whitespace-nowrap bg-[#19CCA7] border border-gray-300 px-4 py-2 rounded-sm text-xs font-medium hover:bg-gray-50 transition w-[64px] h-[28px]">
              اپدیت شده
            </span>
            <DD
              title={
                <span className="flex items-center text-sm whitespace-nowrap dark:text-white">
                  <Image
                    src="/svg/plan.svg"
                    alt="plan"
                    width={40}
                    height={40}
                  />
                  پلن‌های ما
                </span>
              }
            />
            <Link
              href="/careers"
              className={`${navLink} flex items-center text-sm leading-6 whitespace-nowrap`}
            >
              <Image
                src="/svg/groupmen.svg"
                alt="team"
                width={40}
                height={40}
              />
              همکاری با ما
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
                  درباره ما
                </span>
              }
            />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-11 h-11 lg:w-[51px] lg:h-[51px] !bg-gray-100 rounded-full hover:bg-gray-200 transition dark:!bg-gray-700 dark:hover:!bg-gray-600"
            aria-label="theme"
          >
            {mounted && current === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <Image src="/svg/sun.svg" alt="sun" width={20} height={20} />
            )}
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/contact"
              className="flex items-center justify-center leading-6 text-base gap-2 border border-gray-300 px-4 py-2 rounded-sm font-medium hover:bg-gray-50 transition text-black w-[150px] h-[51px] dark:bg-gray-400"
            >
              <Image src="/svg/phone2.svg" alt="phone" width={20} height={20} />
              تماس با ما
            </Link>

            <Link
              href="/login"
              className="flex justify-center items-center leading-6 [background:linear-gradient(180deg,#111414_0%,#272F2F_100%)]
                         text-white rounded-sm text-sm font-medium hover:opacity-90 transition w-[150px] h-[51px]"
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
                ورود و ثبت‌ نام
              </span>
            </Link>
          </div>

          <button
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-gray-300 hover:bg-gray-50"
            onClick={() => setOpen(true)}
            aria-label="open menu"
            aria-expanded={open}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden fixed inset-0 z-40 transition
               ${
                 open
                   ? "bg-transparent  pointer-events-auto"
                   : "pointer-events-none"
               }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`lg:hidden fixed top-0 right-0 left-0 z-50
              bg-white border-b border-gray-200 shadow-xl
              transition-transform duration-300 will-change-transform
              ${open ? "translate-y-0" : "-translate-y-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between h-[64px] border-b border-gray-200 px-4">
          <div className="flex-1" />
          <Logo />
          <div className="flex-1 flex justify-end">
            <button
              className="inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100"
              onClick={() => setOpen(false)}
              aria-label="close menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="p-6">
          <ul className="flex flex-col items-center text-center gap-2 text-base">
            <li className="w-full">
              <DD
                summeryClassName="justify-center w-full"
                menuClassName="right-1/2 translate-x-1/2 w-64"
                title={
                  <span className="flex gap-2 items-center justify-center">
                    <Image
                      src="/svg/money.svg"
                      alt="money"
                      width={20}
                      height={20}
                    />
                    پراپ تریدینگ
                  </span>
                }
              />
            </li>

            <li className="w-full">
              <span
                style={{ backgroundColor: "#19CCA7" }}
                className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 rounded-md text-sm font-medium
                           border border-gray-300 text-black
                           dark:border-neutral-700"
              >
                اپدیت شده
              </span>
            </li>

            <li className="w-full">
              <DD
                summeryClassName="justify-center w-full"
                menuClassName="right-1/2 translate-x-1/2 w-64"
                title={
                  <span className="flex items-center gap-2 justify-center">
                    <Image
                      src="/svg/plan.svg"
                      alt="plan"
                      width={20}
                      height={20}
                    />
                    پلن‌های ما
                  </span>
                }
              />
            </li>

            <li className="w-full">
              <Link
                href="/careers"
                className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-md font-medium
                           border border-transparent text-black hover:bg-gray-50
                           dark:text-gray-100 dark:hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/svg/groupmen.svg"
                  alt="team"
                  width={24}
                  height={24}
                />
                همکاری با ما
              </Link>
            </li>

            <li className="w-full">
              <DD
                summeryClassName="justify-center w-full"
                menuClassName="right-1/2 translate-x-1/2 w-64"
                title={
                  <span className="flex items-center gap-2 justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                      />
                    </svg>
                    درباره ما
                  </span>
                }
              />
            </li>
          </ul>

          <div className="mt-6 grid gap-3">
            <Link
              href="/contact"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium
                         border text-black hover:bg-gray-50 border-gray-300
                         dark:text-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              onClick={() => setOpen(false)}
            >
              <Image src="/svg/phone2.svg" alt="phone" width={20} height={20} />
              تماس با ما
            </Link>

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-white
                         [background:linear-gradient(180deg,#111414_0%,#272F2F_100%)]"
              onClick={() => setOpen(false)}
            >
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
              ورود و ثبت‌ نام
            </Link>
          </div>
        </nav>
      </aside>
    </header>
  );
}

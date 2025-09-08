"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Logo from "./Logo";

const navLink =
  "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition text-black";

function DD({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <details className="relative group">
      <summary
        className={`${navLink} cursor-pointer list-none flex items-center`}
      >
        <span>{title}</span>
        <span className="text-xs opacity-60 pr-1">▾</span>
      </summary>
      <div
        className="absolute top-[110%] right-0 w-56 rounded-sm border border-gray-200 bg-white shadow-xl p-2 z-30
                   invisible opacity-0 group-open:visible group-open:opacity-100 transition"
      >
        <div className="flex flex-col">{children}</div>
      </div>
    </details>
  );
}

export default function Header() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <header className="sticky top-0 z-40 bg-white backdrop-blur border-b border-gray-200">
      <div className="h-[122px] flex items-center justify-between  px-20  mx-auto ">
        <div className="flex items-center gap-1 ">
          <Logo />
          <DD
            title={
              <span className="flex gap-2 items-center justify-center whitespace-nowrap text-sm leading-6">
                <Image
                  src="/svg/money.svg"
                  alt="arrowUp"
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
                پراپ تریدینگ
              </span>
            }
            children={undefined}
          ></DD>
          <span
            style={{ backgroundColor: "#19CCA7" }}
            className="inline-flex justify-center whitespace-nowrap  items-center gap-2 border border-gray-300 px-4 py-2 rounded-sm text-xs font-medium hover:bg-gray-50 transition w-[64px] h-[28px]"
          >
            اپدیت شده
          </span>
          <DD
            title={
              <span className="flex items-center  text-sm">
                <Image
                  src="/svg/plan.svg"
                  alt="arrowUp"
                  width={40}
                  height={40}
                  className="rounded-sm"
                />
                پلن‌های ما
              </span>
            }
            children={undefined}
          ></DD>
          <Link
            href="/careers"
            className={`${navLink} flex items-center text-sm leading-6`}
          >
            <Image
              src="/svg/groupmen.svg"
              alt="arrowUp"
              width={40}
              height={40}
              className="rounded-sm"
            />
            همکاری با ما
          </Link>
          <DD
            title={
              <span className="flex items-center gap-2">
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
            children={undefined}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark((v) => !v)}
            className="flex items-center justify-center w-[51px] h-[51px] bg-gray-100 rounded-full hover:bg-gray-200 transition"
            aria-label="theme"
          >
            {!dark && (
              <Image
                src="/svg/sun.svg"
                alt="arrowUp"
                width={20}
                height={20}
                className="rounded-sm"
              />
            )}
            {dark && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>{" "}
          <Link
            href="/contact"
            className="flex items-center justify-center leading-6 text-base gap-2 border border-gray-300 px-4 py-2 rounded-sm  font-medium hover:bg-gray-50 transition text-black w-[150px] h-[51px]"
          >
            <span className="text-lg">📞</span>
            تماس با ما
          </Link>
          <Link
            href="/login"
            className="flex justify-center place-content-start container mx-auto leading-6 items-center [background:linear-gradient(180deg,#111414_0%,#272F2F_100%)] text-white rounded-sm text-sm font-medium hover:bg-gray-800 transition w-[150px] h-[51px]"
          >
            <span className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
      </div>
    </header>
  );
}

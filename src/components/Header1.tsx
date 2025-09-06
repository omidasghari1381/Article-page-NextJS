"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import DD from "./Dd";

const navLink =
  "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition text-black";

export default function Header() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <header className="sticky top-0 z-40 bg-white backdrop-blur border-b border-gray-200">
      <div className="h-[122px] flex items-center justify-between  px-20 mx-auto ">
        <div className="flex items-center gap-1">
          <Logo />
          <DD
            title={
              <span className="flex  gap-2 items-center justify-center whitespace-nowrap text-sm leading-6">
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
                    d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                  />
                </svg>
                پراپ تریدینگ
              </span>
            }
            children={undefined}
          ></DD>
          <span
            style={{ backgroundColor: "#19CCA7" }}
            className="inline-flex justify-center whitespace-nowrap  items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition w-[64px] h-[28px]"
          >
            اپدیت شده
          </span>
          <DD
            title={
              <span className="flex items-center gap-2 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M12 11h4" />
                  <path d="M12 16h4" />
                  <path d="M8 11h.01" />
                  <path d="M8 16h.01" />
                </svg>
                پلن‌های ما
              </span>
            }
            children={undefined}
          ></DD>
          <Link
            href="/careers"
            className={`${navLink} flex items-center gap-2 text-sm leading-6`}
          >
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
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
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
                <circle cx="12" cy="12" r="4" />
                <path d="M12 3v1" />
                <path d="M12 20v1" />
                <path d="M3 12h1" />
                <path d="M20 12h1" />
                <path d="m18.364 5.636-.707.707" />
                <path d="m6.343 17.657-.707.707" />
                <path d="m5.636 5.636.707.707" />
                <path d="m17.657 17.657.707.707" />
              </svg>
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
            className="flex items-center justify-center leading-6 text-base gap-2 border border-gray-300 px-4 py-2 rounded-lg  font-medium hover:bg-gray-50 transition text-black w-[150px] h-[51px]"
          >
            تماس با ما
            <span className="text-lg">📞</span>
          </Link>
          <Link
            href="/login"
            className="flex justify-center place-content-start container mx-auto leading-6 items-center [background:linear-gradient(180deg,#111414_0%,#272F2F_100%)] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition w-[150px] h-[51px]"
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

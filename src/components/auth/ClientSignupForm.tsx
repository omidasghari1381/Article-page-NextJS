"use client";

import Image from "next/image";
import PhoneInput from "@/components/PhoneInput";
import React, { useMemo, useState } from "react";

// همان تایپ‌های قبلی (بدون تغییر)
type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  dial: string; // در PhoneInput فعلی استفاده نمی‌شود، برای سازگاری حفظ شده
  password: string;
  remember: boolean;
};

export default function ClientSignupForm() {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    phone: "",
    dial: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () =>
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.phone.trim() &&
      form.password.length >= 8 &&
      !loading,
    [form, loading]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "firstname is essential";
    if (!form.lastName.trim()) errs.lastName = "surname is essential";
    if (!form.phone.trim()) errs.phone = "phone number is essential";
    if (form.password.length < 8)
      errs.password = "your password must contain 8 letter";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: `${form.dial}${form.phone}`,
          password: form.password,
          remember: form.remember,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setErrors({ general: data?.message ?? "register failed" });
        return;
      }

      alert("register successful");
    } catch (err) {
      setErrors({ general: "Server error .Try again later" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-base text-[#1C2120]">نام</label>
          <input
            className={`input ${errors.firstName ? "!border-red-400" : ""}`}
            placeholder="نام خود را وارد نمایید"
            value={form.firstName}
            onChange={(e) =>
              setForm((f) => ({ ...f, firstName: e.target.value }))
            }
          />
          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-base text-[#1C2120]">نام خانوادگی</label>
          <input
            className={`input ${errors.lastName ? "!border-red-400" : ""}`}
            placeholder="نام خانوادگی خود را وارد نمایید"
            value={form.lastName}
            onChange={(e) =>
              setForm((f) => ({ ...f, lastName: e.target.value }))
            }
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-base text-[#1C2120] font-medium">
          شماره موبایل
        </label>
        <div
          className={[
            "relative mt-2.5 rounded-xl bg-white overflow-hidden transition",
            errors.phone ? "border-red-400" : "border-gray-200",
            "focus-within:ring-2 focus-within:ring-gray-300",
            "border",
          ].join(" ")}
        >
          {" "}
          <PhoneInput
            className="w-full"
            onChange={(val: string) => setForm((f) => ({ ...f, phone: val }))}
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone}</p>
          )}
        </div>
      </div>

        <div
          className={[
            "relative mt-2.5 rounded-xl bg-white overflow-hidden transition",
            errors.password ? "border-red-400" : "border-gray-200",
            "focus-within:ring-2 focus-within:ring-gray-300",
            "border",
          ].join(" ")}
        >
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <Image
              src="/image/password.png"
              alt="password"
              width={18}
              height={18}
              className="opacity-70"
            />
          </span>
          <input
            className="w-full bg-transparent h-11 px-3 border-0 outline-none focus:outline-none focus:ring-0 focus:border-transparent text-black"
            style={{ paddingRight: "2rem", paddingInlineEnd: "2rem" }}
            type="password"
            placeholder="رمز عبور خود را وارد نمایید"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            autoComplete="current-password"
          />
        </div>

      <label className="flex items-center gap-2 text-base text-[#1C2120]">
        <input
          type="checkbox"
          className="checkbox"
          checked={form.remember}
          onChange={(e) =>
            setForm((f) => ({ ...f, remember: e.target.checked }))
          }
        />
        مرا به خاطر بسپار
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className={`w-full h-12 rounded-xl text-white font-semibold [background:linear-gradient(180deg,#141414_0%,#313131_100%)] hover:[background:linear-gradient(180deg,#161919_0%,#2B3333_100%)] shadow-[inset_0_-12px_24px_rgba(255,255,255,0.08)] disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <span className="inline-flex items-center gap-2">
          {loading ? "در حال ارسال..." : "ثبت نام"}
          <Image
            src="/svg/arrowPoint.svg"
            alt="arrowPoint"
            height={24}
            width={24}
          />
        </span>
      </button>

      <div className="relative text-center">
        <div className="h-px bg-[#DEDFDE]" />
        <span className="absolute inset-0 -top-3 mx-auto bg-white px-3 text-sm font-normal text-gray-400 w-fit">
          یا
        </span>
      </div>

      <button
        type="button"
        onClick={() => alert("ورود با گوگل - بعداً اتصال واقعی")}
        className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium"
      >
        <span className="inline-flex items-center gap-3">
          ورود و ثبت نام با حساب گوگل
          <Image
            src="/svg/GoogleIcon.svg"
            alt="google"
            width={18}
            height={18}
          />
        </span>
      </button>

      {errors.general && (
        <div className="text-sm text-red-600 text-center">{errors.general}</div>
      )}

      <p className="text-sm text-gray-600 text-center">
        حساب کاربری دارید؟
        <a
          href="/login"
          className="text-[#19CCA7] font-semibold px-1 hover:underline"
        >
          وارد شوید
        </a>
      </p>
    </form>
  );
}

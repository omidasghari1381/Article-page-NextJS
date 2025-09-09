"use client";
import AutoSlider from "@/components/AutoSlider";
import PhoneInput from "@/components/PhoneInput";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type FormState = {
  phone: string;
  dial: string;
  password: string;
  remember: boolean;
};

export default function Page() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    phone: "",
    dial: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => form.phone.trim() && form.password.length >= 8 && !loading,
    [form, loading]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.phone.trim()) errs.phone = "phone number is essential";
    if (form.password.length < 8)
      errs.password = "your password must contain 8 letter";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        phone: `${form.dial}${form.phone}` || form.phone,
        password: form.password,
        remember: form.remember ? "1" : "0",
      });

      if (!res || res.error) {
        setErrors({ general: res?.error ?? "login failed" });
        return;
      }

      router.replace("/"); 
    } catch {
      setErrors({ general: "Server error .Try again later" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[28px] shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* ستون اسلایدر */}
            <div className="relative bg-[#FAFAFA]">
              <div className="relative bg-gray-50">
                <div className="p-8 sm:p-12 lg:p-16 h-full">
                  <AutoSlider />
                </div>
              </div>
            </div>

            {/* ستون فرم */}
            <div className="p-6 sm:p-10">
              {/* نوار بالای مسیر */}
              <div className="flex items-center mb-6 justify-end gap-2.5">
                <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
                  صفحه اصلی
                </a>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl border-[#BFC1C0] border grid place-items-center">
                    <Image src="/svg/ArrowRight.svg" alt="" height={16} width={16} />
                  </div>
                </div>
              </div>

              {/* هدر لوگین */}
              <div className="justify-center items-center flex-col flex">
                <div className="w-[60px] h-[60px] bg-[#19C9A4] rounded-[14px] flex justify-center items-center my-8">
                  <Image src="/image/mainLogo.png" alt="logo" height={39} width={34} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  ورود به مای پراپ
                </h1>
                <p className="text-gray-500 mt-6">
                  لطفاً شماره موبایل و رمز عبور خود را وارد کنید.
                </p>
              </div>

              {/* فرم */}
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {/* موبایل */}
                <div className="space-y-2">
                  <label className="text-base text-[#1C2120] font-medium">شماره موبایل</label>
                  <PhoneInput
                    className="mt-2.5"
                    // @ts-ignore
                    onChange={(val: string) => setForm((f) => ({ ...f, phone: val }))}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>

                {/* رمز عبور */}
                <div className="space-y-2">
                  <label className="text-base text-[#1C2120] font-medium">رمز عبور</label>
                  <div className="relative mt-2.5">
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <Image
                        src="/image/password.png"
                        alt="password"
                        width={18}
                        height={18}
                        className="opacity-70"
                      />
                    </span>
                    <input
                      className={`input pr-12 ${errors.password ? "!border-red-400" : ""}`}
                      type="password"
                      placeholder="رمز عبور خود را وارد نمایید"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  <div className="flex justify-end">
                    <a href="/forgot-password" className="text-sm text-[#19CCA7] hover:underline">
                      رمز عبور را فراموش کرده‌اید؟
                    </a>
                  </div>
                </div>

                {/* مرا به خاطر بسپار */}
                <label className="flex items-center gap-2 text-base text-[#1C2120]">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
                  />
                  مرا به خاطر بسپار
                </label>

                {/* دکمه ورود */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full h-12 rounded-xl text-white font-semibold
                             [background:linear-gradient(180deg,#141414_0%,#313131_100%)]
                             hover:[background:linear-gradient(180deg,#161919_0%,#2B3333_100%)]
                             shadow-[inset_0_-12px_24px_rgba(255,255,255,0.08)]
                             disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span className="inline-flex items-center gap-2">
                    {loading ? "در حال ورود..." : "ورود"}
                    <Image src="/svg/arrowPoint.svg" alt="arrowPoint" height={24} width={24} />
                  </span>
                </button>

                {/* جداکننده */}
                <div className="relative text-center">
                  <div className="h-px bg-[#DEDFDE]" />
                  <span className="absolute inset-0 -top-3 mx-auto bg-white px-3 text-sm font-normal text-gray-400 w-fit">
                    یا
                  </span>
                </div>

                {/* گوگل (ماک) */}
                <button
                  type="button"
                  onClick={() => alert("ورود با گوگل - بعداً اتصال واقعی")}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium"
                >
                  <span className="inline-flex items-center gap-3">
                    ورود با حساب گوگل
                    <Image src="/svg/GoogleIcon.svg" alt="google" width={18} height={18} />
                  </span>
                </button>

                {/* خطای کلی */}
                {errors.general && (
                  <div className="text-sm text-red-600 text-center">{errors.general}</div>
                )}

                {/* لینک ثبت‌نام */}
                <p className="text-sm text-gray-600 text-center">
                  حساب ندارید؟
                  <a href="/signup" className="text-[#19CCA7] font-semibold px-1 hover:underline">
                    همین حالا ثبت‌نام کنید
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
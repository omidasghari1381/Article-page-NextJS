"use client";
import AutoSlider from "@/components/AutoSlider";
import PhoneInput from "@/components/PhoneInput";
import Image from "next/image";
import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[28px] shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative bg-[#FAFAFA]">
              <div className="relative bg-gray-50">
                <div className="p-8 sm:p-12 lg:p-16 h-full">
                  <AutoSlider />
                </div>
              </div>
            </div>{" "}
            <div className="p-6 sm:p-10">
              <div className="flex items-center mb-6 justify-end gap-2.5">
                <a
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  صفحه اصلی
                </a>
                <div className="flex items-center gap-2 ">
                  <div className="w-9 h-9 rounded-xl border-[#BFC1C0] border-1 grid place-items-center">
                    {/* آیکن/لوگو موقت */}
                    <Image
                      src="/svg/ArrowRight.svg"
                      alt="sign-in"
                      height={16}
                      width={16}
                      className=""
                    />
                  </div>
                </div>
              </div>
              <div className="justify-center items-center flex-col flex ">
                <div className="w-[60px] h-[60px] bg-[#19C9A4] rounded-[14px] flex justify-center items-center my-8">
                  <Image
                    src="/image/mainLogo.png"
                    alt="sign-in"
                    height={38.96553421020508}
                    width={33.92672348022461}
                  />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  به مای پراپ خوش آمدید.
                </h1>
                <p className="text-gray-500 mt-6">
                  اطلاعات خود را جهت ثبت‌نام وارد نمایید.
                </p>
              </div>
              <form className="mt-8 space-y-5">
                {/* نام و نام‌خانوادگی */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-base text-[#1C2120]">نام</label>
                    <input
                      className="input"
                      placeholder="نام خود را وارد نمایید"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-base text-[#1C2120]">
                      نام خانوادگی
                    </label>
                    <input
                      className="input"
                      placeholder="نام خانوادگی خود را وارد نمایید"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-base text-[#1C2120] font-medium">
                    شماره موبایل
                  </label>
                  <PhoneInput className="mt-2.5" />
                </div>

                {/* رمز عبور */}
                <div className="space-y-2">
                  <label className="text-base text-[#1C2120] font-medium">
                    رمز عبور
                  </label>
                  <div className="relative mt-2.5">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Image
                        src="/image/password.png"
                        alt="password"
                        width={18}
                        height={18}
                        className="opacity-70"
                      />
                    </span>
                    <input
                      className="input pr-6"
                      type="password"
                      placeholder="رمز عبور خود را وارد نمایید"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-base text-[#1C2120]">
                  <input type="checkbox" className="checkbox" />
                  مرا به خاطر بسپار
                </label>
                <button
                  type="button"
                  className="w-full h-12 rounded-xl text-white font-semibold
                             [background:linear-gradient(180deg,#141414_0%,#313131_100%)]
                             hover:[background:linear-gradient(180deg,#161919_0%,#2B3333_100%)]
                             shadow-[inset_0_-12px_24px_rgba(255,255,255,0.08)]"
                >
                  <span className="inline-flex items-center gap-2">
                    ثبت نام
                    <Image
                      src="/svg/arrowPoint.svg"
                      alt="arrowPoint"
                      height={24}
                      width={24}
                    />{" "}
                  </span>
                </button>

                {/* جداکننده */}
                <div className="relative text-center">
                  <div className="h-px bg-[#DEDFDE]" />
                  <span className="absolute inset-0 -top-3 mx-auto bg-white px-3 text-sm font-normal text-gray-400 w-fit">
                    یا
                  </span>
                </div>

                {/* دکمه گوگل */}
                <button
                  type="button"
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium"
                >
                  <span className="inline-flex items-center gap-3">
                    ورود و ثبت نام با حساب گوگل
                    <Image
                      src="/svg/GoogleIcon.svg"
                      alt="password"
                      width={18}
                      height={18}
                    />{" "}
                  </span>
                </button>

                {/* لینک ورود */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

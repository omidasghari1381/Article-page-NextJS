// src/app/[lang]/signup/page.tsx
import ClientSignupForm from "@/components/auth/ClientSignupForm";
import AutoSlider from "@/components/AutoSlider";
import Image from "next/image";
import Link from "next/link";

import { clampLang, type Lang } from "@/lib/i18n/settings";
import { getServerT } from "@/lib/i18n/get-server-t";
import LangSwitch from "@/components/auth/LangSwitch";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = clampLang(raw);
  const t = await getServerT(lang, "auth");

  const nextLang: Lang = lang === "fa" ? "en" : "fa";

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[28px] shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative bg-[#FAFAFA]">
              <div className="relative bg-gray-50">
                <div className="p-8 sm:p-12 lg:p-16 h-full">
                  <AutoSlider key={lang} lang={lang} />
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10">
              <div className="flex items-center mb-6 justify-between">
                <LangSwitch
                  nextLang={nextLang}
                  label={nextLang}
                  className="flex items-center w-9 h-9 hover:bg-gray-200 border border-[#BFC1C0] rounded-xl justify-center text-sm transition"
                />

                <div className="flex items-center gap-2.5">
                  <a
                    href={`/${lang}`}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {t("home_link")}
                  </a>

                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl border-[#BFC1C0] border grid place-items-center hover:bg-gray-200">
                      <Image
                        src="/svg/ArrowRight.svg"
                        alt=""
                        height={16}
                        width={16}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero */}
              <div className="justify-center items-center flex-col flex">
                <div className="w-[60px] h-[60px] bg-[#19C9A4] rounded-[14px] flex justify-center items-center my-8">
                  <Image
                    src="/image/mainLogo.png"
                    alt={t("logo_alt")}
                    height={39}
                    width={34}
                  />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {t("welcome_title")}
                </h1>
                <p className="text-gray-500 mt-6">{t("welcome_desc")}</p>
              </div>

              <ClientSignupForm key={lang} lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
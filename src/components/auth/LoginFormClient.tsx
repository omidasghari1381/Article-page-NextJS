"use client";

import "@/lib/i18n/client";
import i18n from "@/lib/i18n/client";
import Image from "next/image";
import PhoneInput from "@/components/PhoneInput";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Lang } from "@/lib/i18n/settings";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type FormState = {
  phone: string;
  dial: string;
  password: string;
  remember: boolean;
};

export default function LoginFormClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const { t } = useTranslation("auth");

  // 👇 تریگر برای ری‌رندر ترجمه‌ها
  const [languageKey, setLanguageKey] = useState(0);

  useEffect(() => {
    (async () => {
      if (i18n.language !== lang) {
        await i18n.changeLanguage(lang);
        setLanguageKey((k) => k + 1); // ⬅️ تریگر ری‌رنـدر ترجمه‌ها
      }
      if (!i18n.hasLoadedNamespace("auth")) {
        await i18n.loadNamespaces(["auth"]);
      }
    })();
  }, [lang]);

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
    if (!form.phone.trim()) errs.phone = t("errors.phone_required");
    if (form.password.length < 8) errs.password = t("errors.password_min");
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
        setErrors({ general: res?.error ?? t("errors.register_failed") });
        return;
      }
      router.replace(`/${lang}`);
    } catch {
      setErrors({ general: t("errors.server_error") });
    } finally {
      setLoading(false);
    }
  }

  // 👇 key برای مجبور کردن ری‌اکت به ری‌رنـدر وقتی زبان تغییر کرد
  return (
    <div
      key={languageKey}
      className="p-6 sm:p-10 transition-opacity duration-300"
    >
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
          {t("login.title")}
        </h1>
        <p className="text-gray-500 mt-6">{t("login.desc")}</p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div
          className={[
            "relative mt-2.5 rounded-xl bg-white overflow-hidden transition",
            errors.phone ? "border-red-400" : "border-gray-200",
            "focus-within:ring-2 focus-within:ring-gray-300",
            "border",
          ].join(" ")}
        >
          <PhoneInput
            className="w-full"
            placeholder={t("placeholders.phone")}
            onChange={(val) => setForm((f) => ({ ...f, phone: val }))}
          />
        </div>
        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}

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
              alt={t("alts.password")}
              width={18}
              height={18}
              className="opacity-70"
            />
          </span>
          <input
            className="w-full bg-transparent h-11 px-3 border-0 outline-none text-black"
            type="password"
            placeholder={t("placeholders.password")}
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            autoComplete="current-password"
          />
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password}</p>
        )}

        <label className="flex items-center gap-2 text-base text-[#1C2120]">
          <input
            type="checkbox"
            className="checkbox"
            checked={form.remember}
            onChange={(e) =>
              setForm((f) => ({ ...f, remember: e.target.checked }))
            }
          />
          {t("labels.remember")}
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 rounded-xl text-white font-semibold [background:linear-gradient(180deg,#141414_0%,#313131_100%)] hover:[background:linear-gradient(180deg,#161919_0%,#2B3333_100%)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="inline-flex items-center gap-2">
            {loading ? t("buttons.logging_in") : t("buttons.login")}
            <Image
              src="/svg/arrowPoint.svg"
              alt={t("alts.arrow_point")}
              height={24}
              width={24}
            />
          </span>
        </button>
      </form>
    </div>
  );
}

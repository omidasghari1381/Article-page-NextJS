"use client";

import "@/lib/i18n/client"; 
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Lang } from "@/lib/i18n/settings";
import i18n from "@/lib/i18n/client";

type SlideItem = { title: string; subtitle: string };

export default function SignupHeroSlider({ lang }: { lang: Lang }) {
  const { t } = useTranslation("auth");

  useEffect(() => {
    (async () => {
      if (i18n.language !== lang) await i18n.changeLanguage(lang);
      if (!i18n.hasLoadedNamespace("auth")) await i18n.loadNamespaces(["auth"]);
    })();
  }, [lang]);

  const slides = (t("slider.items", { returnObjects: true }) as SlideItem[]) ?? [];
  const hasSlides = Array.isArray(slides) && slides.length > 0;

  const fallbackSlides: SlideItem[] = [
    { title: t("slider.fallback.0.title"), subtitle: t("slider.fallback.0.subtitle") },
    { title: t("slider.fallback.1.title"), subtitle: t("slider.fallback.1.subtitle") },
    { title: t("slider.fallback.2.title"), subtitle: t("slider.fallback.2.subtitle") },
  ];

  const data = hasSlides ? slides : fallbackSlides;

  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);
  const DURATION = 5_000;

  useEffect(() => {
    play();
    return stop;
  }, [data.length]);

  const play = () => {
    stop();
    timer.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % data.length);
    }, DURATION);
  };

  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };

  return (
    <div
      className="relative bg-gray-50 w-full flex justify-center"
      dir="rtl"
      onMouseEnter={stop}
      onMouseLeave={play}
    >
      <div className="absolute inset-0 pointer-events-none" />

      <div className="relative w-full mx-auto max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl 2xl:max-w-7xl p-0 flex flex-col h-full">
        <div className="flex-1 grid place-items-center">
          <div className="w-[260px] sm:w-[340px] md:w-[380px] lg:w-[390px] xl:w-[480px] max-w-full relative">
            {data.map((s, i) => (
              <div
                key={`slide-${i}`}
                className={`transition-opacity duration-700 ease-out ${
                  i === idx ? "opacity-100" : "opacity-0 absolute inset-0"
                }`}
              >
                <Image
                  src="/svg/sign-in.svg"
                  alt={t("slider.image_alt")}
                  width={544}
                  height={544}
                  priority={i === 0}
                  className="w-full h-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center align-middle">
          <h2 className="text-[22px] sm:text-[28px] md:text-3xl font-extrabold text-[#1C2120] leading-tight tracking-tight whitespace-break-spaces align-middle text-center">
            {data[idx]?.title}
          </h2>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-[#666968] leading-7 ">
            {data[idx]?.subtitle}
          </p>
        </div>

        <div className="mt-3 flex justify-center gap-1 sm:gap-2">
          {data.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={t("slider.dot_aria", { n: i + 1 })}
              className={`h-[3px] rounded-full transition-all ${
                i === idx ? "w-8 bg-[#020202]" : "w-3 bg-[#DBDBDB]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
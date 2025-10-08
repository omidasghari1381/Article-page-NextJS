"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function SignupHeroSlider() {
  const slides = [
    {
      src: "/svg/sign-in.svg",
      title: "مسیر جهانی به سمت حرفه‌ای شدن",
      subtitle:
        "با زیرساختی سریع، ایمن، و تحلیل‌هایی مبتنی بر داده‌های لحظه‌ای.",
    },
    {
      src: "/svg/sign-in.svg",
      title: "مدیریت ریسک هوشمند",
      subtitle: "ابزارهای دقیق برای معامله‌گر حرفه‌ای.",
    },
    {
      src: "/svg/sign-in.svg",
      title: "پراپ تریدینگ با شرایط شفاف",
      subtitle: "قوانین واضح، پرداخت سریع و پشتیبانی واقعی.",
    },
  ];

  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);
  const DURATION = 5_000;

  useEffect(() => {
    play();
    return stop;
  }, []);

  const play = () => {
    stop();
    timer.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
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
      {/* overlay */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Centered container: always stays inside the parent card, regardless of page layout */}
      <div className="relative w-full mx-auto max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl 2xl:max-w-7xl p-0 flex flex-col h-full">
        <div className="flex-1 grid place-items-center">
          {/* slider viewport - responsive widths; stays centered */}
          <div className="w-[260px] sm:w-[340px] md:w-[380px] lg:w-[390px] xl:w-[480px] max-w-full relative">
            {slides.map((s, i) => (
              <div
                key={s.src + i}
                className={`transition-opacity duration-700 ease-out ${
                  i === idx ? "opacity-100" : "opacity-0 absolute inset-0"
                }`}
              >
                <Image
                  src={s.src}
                  alt={s.title ?? `slide-${i + 1}`}
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
            {slides[idx].title}
          </h2>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-[#666968] leading-7 ">
            {slides[idx].subtitle}
          </p>
        </div>

        <div className="mt-3 flex justify-center gap-1 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`اسلاید ${i + 1}`}
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

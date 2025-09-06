"use client"
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

  // اتوپلی
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
      className="relative bg-gray-50"
      dir="rtl"
      onMouseEnter={stop}
      onMouseLeave={play}
    >
      <div className="absolute inset-0 pointer-events-none " />

      <div className="relative p-8 sm:p-12 lg:p-16 flex flex-col h-full">
        <div className="flex-1 grid place-items-center">
          <div className="w-[420px] max-w-full">
            {slides.map((s, i) => (
              <div
                key={s.src + i}
                className={`transition-opacity duration-700 ease-out ${
                  i === idx ? "opacity-100" : "opacity-0 absolute"
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
        <div className="mt-6 text-center">
          <h2 className="text-[28px] sm:text-3xl font-extrabold text-[#1C2120] leading-tight tracking-tight">
            {slides[idx].title}
          </h2>
          <p className="mt-2 text-base sm:text-lg text-[#666968] leading-7">
            {slides[idx].subtitle}
          </p>
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`اسلاید ${i + 1}`}
              className={`h-[3px] w-10 rounded-full transition-all ${
                i === idx ? "w-8 bg-[#020202]" : "w-3 bg-[#DBDBDB]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

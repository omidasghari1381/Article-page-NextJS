"use client";

import React, { useEffect, useRef, type ElementType } from "react";

type Mode = "scroll" | "mount";

type RevealProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
  mode?: Mode;
  once?: boolean;
  disabled?: boolean;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export default function Reveal<T extends ElementType = "div">({
  as,
  className = "",
  children,
  mode = "scroll",
  once = true,
  disabled = false,
  ...rest
}: RevealProps<T>) {
  const Tag = (as || "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const rafId = useRef<number | null>(null);
  const revealedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // اگر قبلاً ریویل شده و once=true، مستقیم نهایی کن
    if (once && (revealedRef.current || el.dataset.revealed === "1")) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      el.style.willChange = "";
      return;
    }

    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const reduced = !!mql?.matches;

    // حالت بدون انیمیشن
    if (disabled || reduced) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      el.style.willChange = "";
      return;
    }

    el.style.willChange = "transform, opacity";

    // حالت mount: انیمیشن یک‌باره روی مونت
    if (mode === "mount") {
      let start = 0;
      const distance = 14;
      const duration = 600;
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

      el.style.opacity = "0";
      el.style.transform = `translateY(${distance}px)`;

      const loop = (ts: number) => {
        if (start === 0) start = ts;
        const progress = Math.min(1, (ts - start) / duration);
        const eased = easeOut(progress);
        el.style.opacity = String(eased);
        el.style.transform = `translateY(${(1 - eased) * distance}px)`;

        if (progress < 1) {
          rafId.current = requestAnimationFrame(loop);
        } else {
          revealedRef.current = true;
          el.dataset.revealed = "1";
          el.style.willChange = "";
          rafId.current = null;
        }
      };

      rafId.current = requestAnimationFrame(loop);
      return () => {
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
        el.style.willChange = "";
      };
    }

    // حالت scroll: تشخیص ورود با IntersectionObserver
    {
      let cleaned = false;
      const distance = 16;

      // حالت اولیه
      el.style.opacity = "0";
      el.style.transform = `translateY(${distance}px)`;

      const io = new IntersectionObserver(
        (entries) => {
          if (cleaned) return;
          const entry = entries[0];
          if (!entry) return;

          if (entry.isIntersecting) {
            // انیمیشن نرم با Web Animations API
            el.animate(
              [
                { opacity: 0, transform: `translateY(${distance}px)` },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 600, easing: "cubic-bezier(.17,.67,.32,1)" }
            ).onfinish = () => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
              el.style.willChange = "";
            };

            if (once) {
              revealedRef.current = true;
              el.dataset.revealed = "1";
              io.disconnect();
            }
          } else if (!once) {
            // اگر once=false، با خروج از ویو برگرد به حالت قبل
            el.style.opacity = "0";
            el.style.transform = `translateY(${distance}px)`;
          }
        },
        { rootMargin: "0px 0px -20% 0px", threshold: 0.1 }
      );

      io.observe(el);

      return () => {
        cleaned = true;
        io.disconnect();
        el.style.willChange = "";
      };
    }
  }, [mode, once, disabled]);

  return (
    <Tag
      ref={ref as any}
      className={className}
      {...(rest as any)}
      // حالت اولیه برای SSR/hydration تا لحظه‌ی اجرا شدن افکت
      style={{ opacity: 0, transform: "translateY(16px)" }}
      data-revealed={revealedRef.current ? "1" : undefined}
    >
      {children}
    </Tag>
  );
}
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const reduced = !!mql?.matches;

    if (disabled || reduced) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0px)";
      return;
    }

    el.style.willChange = "transform, opacity";

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

    let stopped = false;
    let last = -1;
    const distance = 16;
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    el.style.opacity = "0";
    el.style.transform = `translateY(${distance}px)`;

    const loop = () => {
      if (!el || stopped) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      const anchor = rect.top + rect.height / 2;

      const start = vh * 3;
      const end = vh * 0.35;

      const denom = Math.max(1, start - end);
      const progress = clamp01((start - anchor) / denom);

      if (Math.abs(progress - last) > 0.005) {
        last = progress;
        el.style.opacity = String(progress);
        el.style.transform = `translateY(${(1 - progress) * distance}px)`;
      }

      if (once && progress >= 1) {
        stopped = true;
        el.style.willChange = "";
        rafId.current = null;
        return;
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      el.style.willChange = "";
    };
  }, [mode, once, disabled]);

  return (
    <Tag
      ref={ref as any}
      className={className}
      {...(rest as any)}
      style={{ opacity: 0, transform: "translateY(16px)" }}
    >
      {children}
    </Tag>
  );
}

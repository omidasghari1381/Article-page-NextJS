"use client";

import React, {
  useEffect,
  useRef,
  type ElementType,
  type ComponentPropsWithoutRef,
} from "react";

type FadeInProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
  /** مدت زمان ترنزیشن (ms) */
  duration?: number;
  /** تاخیر شروع (ms) */
  delay?: number;
  /** جابه‌جایی اولیه در محور Y (px) */
  distance?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export default function FadeIn<T extends ElementType = "div">({
  as,
  className = "",
  children,
  duration = 700,
  delay = 0,
  distance = 12,
  ...rest
}: FadeInProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = `translateY(${distance}px)`;
    el.style.transition = `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`;

    // شروع انیمیشن در فریم بعدی
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, [duration, delay, distance]);

  // نکته: از createElement استفاده می‌کنیم تا TS درباره JSX ElementType غر نزند
  return React.createElement(
    Tag,
    {
      ...(rest as any),
      ref: ref as any,
      className,
    },
    children
  );
}
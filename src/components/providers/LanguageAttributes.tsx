"use client";
import { useEffect } from "react";

export default function LanguageAttributes({ lang }: { lang: "fa" | "en" }) {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
  }, [lang]);
  return null;
}
"use client";

import { useState } from "react";

export default function CopyPhone({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <>
      <button
        type="button"
        title={text}
        onClick={onCopy}
        className="
          font-mono text-xs md:text-sm truncate max-w-[24ch] text-left cursor-pointer mt-1
          text-skin-heading dark:text-white hover:underline transition-colors
        "
      >
        {text}
      </button>

      {copied && (
        <span
          className="
            shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px]
            bg-emerald-100 text-emerald-700
            dark:bg-emerald-500/20 dark:text-emerald-300
          "
        >
          کپی شد
        </span>
      )}
    </>
  );
}
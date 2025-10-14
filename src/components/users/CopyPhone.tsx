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
        className="font-mono text-xs md:text-sm text-black truncate max-w-[24ch] text-left cursor-pointer hover:underline mt-1"
        onClick={onCopy}
      >
        {text}
      </button>
      {copied && (
        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px]">
          کپی شد
        </span>
      )}
    </>
  );
}

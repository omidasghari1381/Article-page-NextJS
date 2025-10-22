"use client";

import Image from "next/image";

export default function ScrollTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="rounded-sm"
      aria-label="Scroll to top"
    >
      <Image
        src="/image/arrowUp.png"
        alt="arrowUp"
        width={29}
        height={29}
        className="rounded-sm cursor-pointer"
      />
    </button>
  );
}
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  className?: string;
};

export default function Logo({ className = "" }: Props) {
  return (
    <div className={`${className}`}>
      <Link href="/" className="flex items-center gap-2 sm:gap-3">
        <div className="relative w-10 h-14 sm:w-[77px] sm:h-[109px]">
          <Image
            src="/image/mainLogo.png"
            alt="logo"
            fill
            sizes="(max-width: 640px) 40px, 77px"
            className="object-contain"
            priority
          />
        </div>

        <div className="leading-tight">
          <b className="text-base sm:text-xl text-black">مای پراپ</b>
          <div className="text-[9px] sm:text-[10px] text-gray-500">
            معتبرترین سایت پراپ ایرانی
          </div>
        </div>
      </Link>
    </div>
  );
}
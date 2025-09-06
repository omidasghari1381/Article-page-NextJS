import Image from "next/image";
import Link from "next/link";
import React from "react";


function Logo({ className = "" }){  return (
    <div className={` ${className}`}>
      <Link href="/" className="flex items-center gap-3">
        <Image src="/image/mainLogo.png" alt="logo" width={77.02} height={109} />
        <div className="leading-4">
          <b className=" text-black text-xl">مای پراپ</b>
          <div className="text-[10px] text-gray-500">
            معتبرترین سایت پراپ ایرانی
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Logo;

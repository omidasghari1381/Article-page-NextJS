import Image from "next/image";
import React from "react";

function page() {
  return (
    <div className="flex">
      <div className="bg-[#FAFAFA] h-[1026.540771484375px] w-full">
        <Image
          src="/svg/sign-in.svg"
          alt="sign-in"
          height={543.69775390625}
          width={543.69775390625}
        />
      </div>
      <div className=" flex  h-[1026.540771484375px] w-[826.4285888671906px]">
        <div className="top-[56px] left-[124px] flex items-center justify-end inset-l-32 inset-t-14">
          <span className="text-base font-medium text-[#3B3F3E]">
            صفحه اصلی
          </span>
          <div className="flex border-[#BFC1C0] border-2 rounded-lg h-[34.00000381469739px] w-[34.00000381469739px] justify-center items-center">
            <Image
              src="/svg/ArrowRight.svg"
              alt="sign-in"
              height={16}
              width={16}
              className=""
            />
          </div>
        </div>
        <div>
          <div className="w-[60px] h-[60px] bg-[#19C9A4] rounded-[14px] flex justify-center items-center drop-shadow-signin drop-shadow-green">
            <Image
              src="/image/mainLogo.png"
              alt="sign-in"
              height={38.96553421020508}
              width={33.92672348022461}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;

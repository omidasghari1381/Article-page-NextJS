"use client";

import Image from "next/image";
import Logo from "./Logo";
import DD from "./Dd";

export default function Footer() {
  return (
    <footer className="bg-white gap-2.5 w-full border-[#EAEAEA] border auto-rows-auto px-20">
      <div className="flex justify-between items-center ">
        <Logo className="" />
        <span className="text-black-text  text-base h-[56px] w-[1018px]">
          با زیرساختی سریع، پلتفرمی امن، و تحلیل‌هایی مبتنی بر داده‌های لحظه‌ای،
          ما به تو کمک می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر تحلیل کنی و
          هوشمندانه‌تر معامله کنی.کمک می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر
          تحلیل کنی و هوشمندانه‌تر معامله کنی.
        </span>
      </div>
      <div className="w-[1255px] h-px bg-[#E6E9EE] mx-auto my-8" />{" "}
      <div className="flex justify-between ">
        <div className="items-center block text-black-footer mr-5 font-semibold text-sm">
          <h3 className="text-base font-bold py-1">دسترسی های سریع</h3>
          <ul className="space-y-4  text-base font-medium py-6">
            <li>
              <a href="/">صفحه اصلی</a>
            </li>
            <li>
              <a href="/prop">پراپ تریدینگ</a>
            </li>
            <li>
              <a href="/plans">پلن‌ها</a>
            </li>
            <li>
              <a href="/faq">همکاری با ما</a>
            </li>
            <li>
              <a href="/faq">بروکر ها</a>
            </li>
            <li>
              <a href="/rules">قوانین و مقررات</a>
            </li>
          </ul>
        </div>
        <div className="items-center block text-black-footer mr-5">
          <h3 className="text-base py-1 font-bold">لینک های مفید</h3>
          <ul className="space-y-4  text-base font-medium py-6">
            <li>
              <a href="/">تماس با ما</a>
            </li>
            <li>
              <a href="/prop">درباره ما</a>
            </li>
            <li>
              <a href="/plans">قوانین و مقررات</a>
            </li>
            <li>
              <a href="/faq">سوالات متداول</a>
            </li>
          </ul>
        </div>
        <div className="text-[#2E3232] flex ">
          <div className="h-7 justify-between flex">
            <Image
              src="/svg/arrow.svg"
              alt="broker1"
              width={22}
              height={23}
              className="bg-[#EAEDED] "
            />{" "}
            <h3>برخی از آموزش ها</h3>
            <Image
              src="/svg/arrow.svg"
              alt="broker1"
              width={8}
              height={8}
              className="bg-[#EAEDED] "
            />
          </div>
          <div></div>
        </div>
        <div className="text-[#2E3232] ">
          <div className="flex gap-5 mb-3 mr-3.5">
            <h3 className="text-xs font-bold">
              دارای مجوز از لگولاتوری های معتبر
            </h3>
            <Image
              src="/svg/questionMark.svg"
              alt="question mark"
              width={12}
              height={12}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="">
              <Image
                src="/svg/ASIC.svg"
                alt="broker1"
                width={73.34781646728516}
                height={73.34781646728516}
                className="rounded-full justify-center items-center border-2 border-[#D2D2D2]"
              />
            </div>
            <Image
              src="/image/FSA.png"
              alt="broker2"
              width={73.34781646728516}
              height={73.34781646728516}
              className="rounded-full justify-center items-center border-2 border-[#D2D2D2]"
            />
            <Image
              src="/image/FC.png"
              alt="broker3"
              width={73.34781646728516}
              height={73.34781646728516}
              className="rounded-full justify-center items-center border-2 border-[#D2D2D2]"
            />
          </div>
        </div>
      </div>
      <div className="w-[1255px] h-px bg-[#E6E9EE] mx-auto my-8" />{" "}
      <div className="flex justify-between items-center">
        <div className=" flex text-black-footer justify-between items-center">
          <ul className="my-2">
            <li className="mb-4 flex">
              <div className="flex justify-between items-center">
                <a className="font-bold text-sm ">مرکز تماس مشتریان</a>
              </div>
            </li>
            <li className="mb-1 flex ">
              <a className="font-bold text-sm mt-3 mb-2.5">
                {" "}
                به صورت شبانه روزی پشتیبان شما هستیم
              </a>
            </li>
            <li className="mb-1 flex left-0">
              <a className="font-semibold text-xs mt-3 mb-2.5">
                {" "}
                رضایت مشتری برای ما در اولویت است
              </a>
            </li>
          </ul>
        </div>
        <div className="flex text-black-footer text-left">
          <ul className="ml-99 justify-end">
            <li>
              <div className="font-semibold text-sm flex justify-end">
                <a className="ml-5 ">۰۲۱-۹۱۰۱۴۰۴۹</a>
                <Image
                  src="/svg/Phone.svg"
                  alt="broker1"
                  width={22}
                  height={23}
                />
              </div>
            </li>
            <li>
              <div className="text-sm font-semibold flex justify-end">
                <a className="ml-5 pt-2.5">MyProp@gmail.com</a>{" "}
                <Image
                  src="/svg/Group.svg"
                  alt="broker1"
                  width={22}
                  height={23}
                />{" "}
              </div>
            </li>
            <li>
              {" "}
              <div className=" text-sm font-semibold flex justify-end">
                <a className="ml-5 pt-2.5">
                  میدان توحید ، خیابان امیرلو ، خیابان طوسی ، پلاک 100 ، واحد 3
                </a>
                <Image
                  src="/svg/location.svg"
                  alt="broker1"
                  width={22}
                  height={23}
                />{" "}
              </div>
            </li>
          </ul>
        </div>
        <div className="flex justify-between gap-2.5">
          <div>
            <div className="flex bg-[#19CCA7] h-[62px] w-[62px] rounded items-center justify-center mb-4">
              {" "}
              <Image
                src="/image/insta.png"
                alt="instagram "
                width={33}
                height={33}
              />
            </div>
            <span className="text-[#0E1515] justify-center flex ">
              اینستاگرام
            </span>
          </div>
          <div className="">
            <div className="flex bg-[#19CCA7] h-[62px] w-[62px] rounded items-center justify-center  mb-4">
              {" "}
              <Image
                src="/image/whatsapp.png"
                alt="whatsapp"
                width={33}
                height={33}
              />
            </div>
            <span className="text-[#0E1515] justify-center flex">واتس آپ</span>
          </div>
          <div>
            <div className="flex bg-[#19CCA7] h-[62px] w-[62px] rounded items-center justify-center mb-4">
              {" "}
              <Image
                src="/image/youtube.png"
                alt="youtube"
                width={33}
                height={33}
              />
            </div>
            <span className="text-[#0E1515] justify-center flex">یوتیوب</span>
          </div>
          <div>
            <div className="flex bg-[#19CCA7] h-[62px] w-[62px] rounded items-center justify-center mb-4">
              {" "}
              <Image
                src="/image/telegram.png"
                alt="telegram"
                width={33}
                height={33}
              />
            </div>
            <span className="text-[#0E1515] justify-center flex">تلگرام</span>
          </div>
        </div>
      </div>
      <DD
        className=" flex  rounded-lg justify-between border-2 border-gray"
        title="Risk Warning"
        childClassName="absolute top-[110%] right-0 rounded border-gray-200 bg-white p-2 
                   invisible opacity-0 group-open:visible group-open:opacity-100 transition "
        titleClassName="text-black"
        children={
          "Trading financial instruments, including but not limited to forex, commodities, indices, and cryptocurrencies, involves a high level of risk and may not be suitable for all investors.Leveraged trading can result in significant gains as well as substantial losses. You should carefully consider your investment objectives, level of experience, and risk appetite before engaging in any financial activity.Past performance is not indicative of future results.It is possible to lose all or more than your initial investment.You should not invest money that you cannot afford to lose.Myprop Ltd does not provide any personalized investment advice or guarantees of profit.Please ensure that you fully understand the risks involved and seek independent financial advice if necessary.Trading with Myprop Ltd is subject to local regulations, and services may not be available in certain jurisdictions."
        }
      ></DD>
      <DD
        className=" flex  rounded-lg justify-between border-2 border-gray h-[86]"
        title="Jurisdiction Disclaimer"
        childClassName="text-black "
        titleClassName="text-yellow"
        children={
          "Trading financial instruments, including but not limited to forex, commodities, indices, and cryptocurrencies, involves a high level of risk and may not be suitable for all investors.Leveraged trading can result in significant gains as well as substantial losses. You should carefully consider your investment objectives, level of experience, and risk appetite before engaging in any financial activity.Past performance is not indicative of future results.It is possible to lose all or more than your initial investment.You should not invest money that you cannot afford to lose.Myprop Ltd does not provide any personalized investment advice or guarantees of profit.Please ensure that you fully understand the risks involved and seek independent financial advice if necessary.Trading with Myprop Ltd is subject to local regulations, and services may not be available in certain jurisdictions."
        }
      />
      <div className="flex text-black-footer text-sm justify-between my-10 items-center">
        <div className="flex gap-3 items-center">
          <Image
            src="/image/arrowUp.png"
            alt="arrowUp"
            width={29}
            height={29}
            className="rounded-sm"
          />
          <span>تمامی حقوق برای این وب سایت محفوظ است</span>
        </div>
        <span>طراحی و توسعه توسط‌ مای پراپ </span>
      </div>
    </footer>
  );
}

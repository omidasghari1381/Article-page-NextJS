"use client";
import Image from "next/image";
import Logo from "./Logo";
import React, { useMemo, useState } from "react";
import Link from "next/link";

type AccordionCardProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  image?: string;
  icon?: React.ReactNode;
};

type Item = { id: string | number; title: string; href: string };
type Props = {
  title?: string;
  items?: Item[];
  pageSize?: number;
  className?: string;
  prevIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
};

export default function Footer() {
  return (
    <footer
      className="bg-white gap-2.5 w-full border-[#EAEAEA] border auto-rows-auto px-20 py-16"
      dir="rtl"
    >
      <TopIntro />
      <Divider />
      <div className="flex justify-between ">
        <QuickLinks />
        <UsefulLinks />
        <TrainingsSliderList />
        <Licenses />
      </div>
      <Divider />
      <div className="flex justify-between items-center mb-8">
        <ContactCenterCopy />
        <ContactInfoCopy />
        <SocialsBlock />
      </div>
      <AccordionCard title="Risk Warning" defaultOpen image="/svg/warning.svg">
        <p>
          Trading financial instruments, including but not limited to forex,
          commodities, indices, and cryptocurrencies, involves a high level of
          risk and may not be suitable for all investors.Leveraged trading can
          result in significant gains as well as substantial losses. You should
          carefully consider your investment objectives, level of experience,
          and risk appetite before engaging in any financial activity.Past
          performance is not indicative of future results.It is possible to lose
          all or more than your initial investment.You should not invest money
          that you cannot afford to lose.Myprop Ltd does not provide any
          personalized investment advice or guarantees of profit.Please ensure
          that you fully understand the risks involved and seek independent
          financial advice if necessary.Trading with Myprop Ltd is subject to
          local regulations, and services may not be available in certain
          jurisdictions.{" "}
        </p>
      </AccordionCard>
      <AccordionCard
        title="Jurisdiction Disclaimer"
        className="mt-3 "
        image="/svg/disclaimer.svg"
      >
        The information, products, and services provided on this website are
        intended for use only in jurisdictions where they may lawfully be
        offered. By accessing or using this website, you agree that your use
        complies with all applicable laws and regulations in your jurisdiction.
        [Company/Website Name] makes no representation that the content is
        appropriate, legal, or available for use in all locations. Users who
        access the website from outside [Country/State] do so at their own
        initiative and are responsible for compliance with their local laws. Any
        legal disputes arising from the use of this website shall be governed
        exclusively by the laws of [Specify Country/State], and you agree to
        submit to the exclusive jurisdiction of the courts located in [City,
        Country/State].{" "}
      </AccordionCard>
      <BottomBar />
    </footer>
  );
}

function TopIntro() {
  return (
    <>
      <div className="flex justify-between items-center ">
        <Logo className="" />
        <span className="text-black-text  text-base h-[56px] w-[1018px]">
          با زیرساختی سریع، پلتفرمی امن، و تحلیل‌هایی مبتنی بر داده‌های لحظه‌ای،
          ما به تو کمک می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر تحلیل کنی و
          هوشمندانه‌تر معامله کنی.کمک می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر
          تحلیل کنی و هوشمندانه‌تر معامله کنی.
        </span>
      </div>
    </>
  );
}

function Divider() {
  return <div className="w-[1255px] h-px bg-[#E6E9EE] mx-auto my-8" />;
}

function QuickLinks() {
  return (
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
  );
}

function UsefulLinks() {
  return (
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
  );
}

function MiniEducationHeader() {
  return (
    <div className="text-[#2E3232] flex ">
      <div className="h-7 justify-between flex">
        <Image
          src="/svg/arrow.svg"
          alt="broker1"
          width={22}
          height={23}
          className="bg-[#EAEDED] "
        />
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
  );
}

function Licenses() {
  return (
    <div className="text-[#2E3232] ">
      <div className="flex gap-5 mb-6 mr-3.5">
        <h3 className="text-xs font-bold">دارای مجوز از لگولاتوری های معتبر</h3>
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
  );
}

function ContactCenterCopy() {
  return (
    <div className=" flex text-black-footer justify-between items-center">
      <ul className="">
        <li className=" flex">
          <div className="flex justify-between items-center">
            <a className="font-bold text-sm ">مرکز تماس مشتریان</a>
          </div>
        </li>
        <li className=" flex pt-2.5">
          <a className="font-bold text-sm ">
            {" "}
            به صورت شبانه روزی پشتیبان شما هستیم
          </a>
        </li>
        <li className=" flex left-0 pt-2.5">
          <a className="font-semibold text-xs mt-3 mb-2.5">
            {" "}
            رضایت مشتری برای ما در اولویت است
          </a>
        </li>
      </ul>
    </div>
  );
}

function ContactInfoCopy() {
  return (
    <div className="flex text-black-footer text-left">
      <ul className="ml-99 justify-end">
        <li>
          <div className="font-semibold text-sm flex justify-end">
            <a className="ml-5 ">۰۲۱-۹۱۰۱۴۰۴۹</a>
            <Image src="/svg/Phone.svg" alt="broker1" width={22} height={23} />
          </div>
        </li>
        <li>
          <div className="text-sm font-semibold flex justify-end">
            <a className="ml-5 pt-2.5">MyProp@gmail.com</a>
            <Image src="/svg/Group.svg" alt="broker1" width={22} height={23} />
          </div>
        </li>
        <li>
          <div className=" text-sm font-semibold flex justify-end">
            <a className="ml-5 pt-2.5">
              میدان توحید ، خیابان امیرلو ، خیابان طوسی ، پلاک 100 ، واحد 3
            </a>
            <Image
              src="/svg/location.svg"
              alt="broker1"
              width={22}
              height={23}
            />
          </div>
        </li>
      </ul>
    </div>
  );
}

function SocialsBlock() {
  return (
    <div className="flex justify-between gap-2.5">
      <div>
        <div className="flex bg-[#19CCA7] h-[62px] w/[62px] w-[62px] rounded items-center justify-center mb-4">
          <Image
            src="/image/insta.png"
            alt="instagram"
            width={33}
            height={33}
          />
        </div>
        <span className="text-[#0E1515] justify-center flex ">اینستاگرام</span>
      </div>
      <div className="">
        <div className="flex bg-[#19CCA7] h-[62px] w-[62px] rounded items-center justify-center  mb-4">
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
  );
}

function BottomBar() {
  return (
    <div className="flex text-black-footer text-sm justify-between my-10 items-center">
      <div className="flex gap-3 items-center">
        <Image
          src="/image/arrowUp.png"
          alt="arrowUp"
          width={29}
          height={29}
          className="rounded-sm cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <span>تمامی حقوق برای این وب سایت محفوظ است</span>
      </div>
      <span>طراحی و توسعه توسط‌ مای پراپ </span>
    </div>
  );
}

function AccordionCard({
  title,
  children,
  defaultOpen = false,
  className = "",
  headerClassName = "",
  image = "",
  icon,
}: AccordionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
      dir="rtl"
    >
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 ${headerClassName}`}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center w-[36.775817871093786px] h-[36.775817871093786px] rounded-xl bg-[#F5F5F5]
                     hover:bg-slate-100 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 transition-transform duration-400 ease-in-out ${
              open ? "rotate-180" : "rotate-0"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-slate-900">
          <h4 className="text-sm sm:text-base font-semibold">{title}</h4>

          {icon ?? (
            <Image
              src={image}
              alt="arrowUp"
              width={30}
              height={30}
              className="rounded-sm"
            />
          )}
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className="px-7 pb-5 pt-0 text-sm leading-7 text-[#3B3F3F]"
            dir="ltr"
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrainingsSliderList({
  title = "برخی آموزش‌ها",
  items,
  pageSize = 4,
  className = "",
  prevIcon,
  nextIcon,
}: Props) {
  const data = useMemo<Item[]>(
    () =>
      items && items.length
        ? items
        : [
            {
              id: 1,
              title:
                "نحوه دریافت سرمایه از وب‌سایت مای پراپ با سرعت و تمام جزئیات",
              href: "#",
            },
            { id: 2, title: "آموزش انجام چالش‌های پراپ‌تریدینگ", href: "#" },
            {
              id: 3,
              title: "بهترین روش‌های مدیریت ریسک در معاملات",
              href: "#",
            },
            { id: 4, title: "آموزش سریع درخواست همکاری", href: "#" },
            { id: 5, title: "راهنمای افتتاح حساب معاملاتی", href: "#" },
            { id: 6, title: "اشتباهات رایج تریدرهای تازه‌کار", href: "#" },
            { id: 7, title: "ساخت استراتژی شخصی قدم‌به‌قدم", href: "#" },
            { id: 8, title: "روانشناسی معامله‌گری در عمل", href: "#" },
          ],
    [items]
  );

  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const start = page * pageSize;
  const visible = data.slice(start, start + pageSize);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <section
      className={`${className} w-[587.0379028320312px] h-[202.34327697753906px]`}
      dir="ltr"
    >
      <div className="relative flex items-center justify-center mb-4">
        <button
          onClick={() => canPrev && setPage((p) => p - 1)}
          className="absolute right-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
          disabled={!canPrev}
          aria-label="قبلی"
        >
          {prevIcon ?? (
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
        <h3 className="text-sm font-semibold text-[#0E1515] text-left">
          {title}
        </h3>
        <button
          onClick={() => canNext && setPage((p) => p + 1)}
          className="absolute left-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
          disabled={!canNext}
          aria-label="بعدی"
        >
          {nextIcon ?? (
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
      <ul className="space-y-4 text-base font-semibold mt-10">
        {visible.map((it) => (
          <li key={it.id} className="flex justify-between gap-3 ">
            <Link href={it.href} aria-label="مشاهده آموزش" className="shrink-0">
              <Image
                src="/svg/Arrowleft.svg"
                alt="arrow"
                width={16.048629760742188}
                height={16.048629760742188}
                className="ml-1.5"
              />
            </Link>
            <Link
              href={it.href}
              className="text-sm text-[#0E1515] hover:text-emerald-600 transition-colors leading-7"
            >
              {it.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

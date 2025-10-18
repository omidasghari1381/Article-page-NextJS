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
    <footer className="bg-skin-bg text-skin-base w-full border border-skin-border px-4 sm:px-6 lg:px-20 py-8 lg:py-16">
      <div className="mx-auto max-w-screen-2xl">
        <TopIntro />
        <Divider />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr_1fr_587px_auto] lg:items-start">
          <QuickLinks />
          <UsefulLinks />
          <TrainingsSliderList />
          <Licenses />
        </div>
        <Divider />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
          <ContactCenterCopy />
          <ContactInfoCopy />
          <SocialsBlock />
        </div>
        <AccordionCard
          title="Risk Warning"
          defaultOpen
          image="/svg/warning.svg"
        >
          <p className="text-sm leading-7 text-skin-muted">
            Trading financial instruments, including but not limited to forex,
            commodities, indices, and cryptocurrencies, involves a high level of
            risk and may not be suitable for all investors. Leveraged trading
            can result in significant gains as well as substantial losses. You
            should carefully consider your investment objectives, level of
            experience, and risk appetite before engaging in any financial
            activity. Past performance is not indicative of future results. It
            is possible to lose all or more than your initial investment. You
            should not invest money that you cannot afford to lose. Myprop Ltd
            does not provide any personalized investment advice or guarantees of
            profit. Please ensure that you fully understand the risks involved
            and seek independent financial advice if necessary. Trading with
            Myprop Ltd is subject to local regulations, and services may not be
            available in certain jurisdictions.
          </p>
        </AccordionCard>
        <AccordionCard
          title="Jurisdiction Disclaimer"
          className="mt-3"
          image="/svg/disclaimer.svg"
        >
          <p className="text-sm leading-7 text-skin-muted">
            The information, products, and services provided on this website are
            intended for use only in jurisdictions where they may lawfully be
            offered. By accessing or using this website, you agree that your use
            complies with all applicable laws and regulations in your
            jurisdiction. [Company/Website Name] makes no representation that
            the content is appropriate, legal, or available for use in all
            locations. Users who access the website from outside [Country/State]
            do so at their own initiative and are responsible for compliance
            with their local laws. Any legal disputes arising from the use of
            this website shall be governed exclusively by the laws of [Specify
            Country/State], and you agree to submit to the exclusive
            jurisdiction of the courts located in [City, Country/State].
          </p>
        </AccordionCard>
        <BottomBar />
      </div>
    </footer>
  );
}

function TopIntro() {
  return (
    <div className="flex flex-col gap-4 items-start justify-between lg:flex-row lg:items-center">
      <Logo className="shrink-0" />
      <span className="text-skin-base text-sm sm:text-base lg:h-[56px] w-full lg:mx-11">
        با زیرساختی سریع، پلتفرمی امن، و تحلیل‌هایی مبتنی بر داده‌های لحظه‌ای،
        ما به تو کمک می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر تحلیل کنی و
        هوشمندانه‌تر معامله کنی. کمک می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر
        تحلیل کنی و هوشمندانه‌تر معامله کنی.
      </span>
    </div>
  );
}

function Divider() {
  return <div className="w-full h-px bg-skin-divider mx-auto my-8" />;
}

function QuickLinks() {
  return (
    <div className="text-skin-base font-semibold text-sm flex justify-center">
      <ul className="space-y-4 text-base font-medium text-center md:text-right">
        <h3 className="text-base font-bold py-1 text-skin-heading">
          دسترسی های سریع
        </h3>
        <li>
          <Link className="hover:text-skin-accent transition" href="/">
            صفحه اصلی
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            پراپ تریدینگ
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            پلن‌ها
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            همکاری با ما
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            بروکر ها
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            قوانین و مقررات
          </Link>
        </li>
      </ul>
    </div>
  );
}

function UsefulLinks() {
  return (
    <div className="text-skin-base flex justify-center">
      <ul className="space-y-4 text-base font-medium text-center md:text-left">
        <h3 className="text-base py-1 font-bold text-skin-heading">
          لینک های مفید
        </h3>
        <li>
          <Link className="hover:text-skin-accent transition" href="/">
            تماس با ما
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/prop">
            درباره ما
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/plans">
            قوانین و مقررات
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            سوالات متداول
          </Link>
        </li>
      </ul>
    </div>
  );
}

function MiniEducationHeader() {
  return (
    <div className="text-skin-base flex">
      <div className="h-7 flex items-center gap-2">
        <Image
          src="/svg/arrow.svg"
          alt="broker1"
          width={22}
          height={23}
          className="bg-skin-card"
        />
        <h3>برخی از آموزش ها</h3>
        <Image
          src="/svg/arrow.svg"
          alt="broker1"
          width={8}
          height={8}
          className="bg-skin-card"
        />
      </div>
    </div>
  );
}

function Licenses() {
  return (
    <div className="text-skin-base">
      <div className="flex items-center gap-3 lg:gap-5 mb-6 mr-0 lg:mr-3.5 justify-center md:justify-start">
        <h3 className="text-xs font-bold text-skin-heading">
          دارای مجوز از لگولاتوری های معتبر
        </h3>
        <Image
          src="/svg/questionMark.svg"
          alt="question mark"
          width={12}
          height={12}
        />
      </div>
      <div className="flex items-center gap-2 justify-center md:justify-start">
        <Image
          src="/svg/ASIC.svg"
          alt="broker1"
          width={73.35}
          height={73.35}
          className="rounded-full border-2 border-skin-border bg-white"
        />
        <Image
          src="/image/FSA.png"
          alt="broker2"
          width={73.35}
          height={73.35}
          className="rounded-full border-2 border-skin-border bg-white"
        />
        <Image
          src="/image/FC.png"
          alt="broker3"
          width={73.35}
          height={73.35}
          className="rounded-full border-2 border-skin-border"
        />
      </div>
    </div>
  );
}

function ContactCenterCopy() {
  return (
    <div className="text-skin-base">
      <ul>
        <li className="flex">
          <span className="font-bold text-sm text-skin-heading">
            مرکز تماس مشتریان
          </span>
        </li>
        <li className="flex pt-2.5">
          <span className="font-bold text-sm">
            به صورت شبانه روزی پشتیبان شما هستیم
          </span>
        </li>
        <li className="flex pt-2.5">
          <span className="font-semibold text-xs mt-3 mb-2.5 text-skin-muted">
            رضایت مشتری برای ما در اولویت است
          </span>
        </li>
      </ul>
    </div>
  );
}

function ContactInfoCopy() {
  return (
    <div className="text-skin-base text-left">
      <ul className="ml-0 lg:ml-[99px]">
        <li>
          <div className="font-semibold text-sm flex justify-end items-center gap-2">
            <span>۰۲۱-۹۱۰۱۴۰۴۹</span>
            <Image src="/svg/Phone.svg" alt="phone" width={22} height={23} />
          </div>
        </li>
        <li className="mt-2.5">
          <div className="text-sm font-semibold flex justify-end items-center gap-2">
            <span>MyProp@gmail.com</span>
            <Image src="/svg/Group.svg" alt="email" width={22} height={23} />
          </div>
        </li>
        <li className="mt-2.5">
          <div className="text-sm font-semibold flex justify-end items-center gap-2">
            <span>
              میدان توحید ، خیابان امیرلو ، خیابان طوسی ، پلاک 100 ، واحد 3
            </span>
            <Image
              src="/svg/location.svg"
              alt="location"
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
    <div className="flex justify-center gap-4">
      {[
        { src: "/image/insta.png", label: "اینستاگرام" },
        { src: "/image/whatsapp.png", label: "واتس آپ" },
        { src: "/image/youtube.png", label: "یوتیوب" },
        { src: "/image/telegram.png", label: "تلگرام" },
      ].map((s, i) => (
        <div key={i} className="text-center">
          <div className="flex h-[56px] w-[56px] lg:h-[62px] lg:w-[62px] bg-[#19CCA7] rounded items-center justify-center mb-2 lg:mb-4">
            <Image src={s.src} alt={s.label} width={33} height={33} />
          </div>
          <span className="text-[#0E1515] dark:text-white text-xs lg:text-sm flex justify-center">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function BottomBar() {
  return (
    <div className="my-10 flex flex-col gap-4 text-skin-base text-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
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
      <span className="text-center lg:text-right">
        طراحی و توسعه توسط‌ مای پراپ
      </span>
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
      className={`rounded-2xl border border-skin-border bg-skin-card shadow-sm ${className}`}
      dir="rtl"
    >
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 ${headerClassName}`}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-skin-bg hover:bg-skin-card/60 border border-skin-border transition-colors"
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
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-skin-heading">
          <h4 className="text-sm sm:text-base font-semibold">{title}</h4>
          {icon ?? (
            <Image
              src={image}
              alt="icon"
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
            className="px-4 sm:px-6 lg:px-7 pb-5 pt-0 text-skin-base"
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
      className={`${className} w-full lg:w-[587.0379px] lg:h-[202.3433px]`}
      dir="ltr"
    >
      <div className="relative flex items-center justify-center mb-4">
        <button
          onClick={() => canPrev && setPage((p) => p - 1)}
          className="absolute right-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-skin-card hover:bg-skin-card/70 border border-skin-border disabled:opacity-40"
          disabled={!canPrev}
          aria-label="قبلی"
        >
          {prevIcon ?? (
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-skin-base"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
        <h3 className="text-sm font-semibold text-skin-heading text-left">
          {title}
        </h3>
        <button
          onClick={() => canNext && setPage((p) => p + 1)}
          className="absolute left-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-skin-card hover:bg-skin-card/70 border border-skin-border disabled:opacity-40"
          disabled={!canNext}
          aria-label="بعدی"
        >
          {nextIcon ?? (
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-skin-base"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base font-semibold mt-6 sm:mt-10">
        {visible.map((it) => (
          <li key={it.id} className="flex justify-between gap-3">
            <Link href={it.href} aria-label="مشاهده آموزش" className="shrink-0">
              <Image
                src="/svg/Arrowleft.svg"
                alt="arrow"
                width={16.05}
                height={16.05}
                className="ml-1.5"
              />
            </Link>
            <Link
              href={it.href}
              className="text-skin-base hover:text-skin-accent transition-colors leading-7"
            >
              {it.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

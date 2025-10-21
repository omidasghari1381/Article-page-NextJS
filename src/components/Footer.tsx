"use client";
import Image from "next/image";
import Logo from "./Logo";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

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

type FooterTexts = {
  top_intro: string;
  quick_links_title: string;
  quick_links: {
    home: string;
    prop: string;
    plans: string;
    careers: string;
    brokers: string;
    rules: string;
  };
  useful_links_title: string;
  useful_links: {
    contact: string;
    about: string;
    policy: string;
    faq: string;
  };
  licenses_title: string;
  contact_center: {
    title: string;
    support: string;
    note: string;
  };
  contact_info: {
    phone: string;
    email: string;
    address: string;
  };
  socials: {
    instagram: string;
    whatsapp: string;
    youtube: string;
    telegram: string;
  };
  bottom_bar: {
    rights: string;
    dev: string;
  };
  warnings: {
    risk_title: string;
    risk_text: string;
    jurisdiction_title: string;
    jurisdiction_text: string;
  };
  trainings: {
    title: string;
    items: Record<string, string>;
  };
};

export default function Footer() {
  const { t } = useTranslation("footer");
  const texts: FooterTexts = {
    top_intro: t("top_intro"),
    quick_links_title: t("quick_links_title"),
    quick_links: {
      home: t("quick_links.home"),
      prop: t("quick_links.prop"),
      plans: t("quick_links.plans"),
      careers: t("quick_links.careers"),
      brokers: t("quick_links.brokers"),
      rules: t("quick_links.rules"),
    },
    useful_links_title: t("useful_links_title"),
    useful_links: {
      contact: t("useful_links.contact"),
      about: t("useful_links.about"),
      policy: t("useful_links.policy"),
      faq: t("useful_links.faq"),
    },
    licenses_title: t("licenses_title"),
    contact_center: {
      title: t("contact_center.title"),
      support: t("contact_center.support"),
      note: t("contact_center.note"),
    },
    contact_info: {
      phone: t("contact_info.phone"),
      email: t("contact_info.email"),
      address: t("contact_info.address"),
    },
    socials: {
      instagram: t("socials.instagram"),
      whatsapp: t("socials.whatsapp"),
      youtube: t("socials.youtube"),
      telegram: t("socials.telegram"),
    },
    bottom_bar: {
      rights: t("bottom_bar.rights"),
      dev: t("bottom_bar.dev"),
    },
    warnings: {
      risk_title: t("warnings.risk_title"),
      risk_text: t("warnings.risk_text"),
      jurisdiction_title: t("warnings.jurisdiction_title"),
      jurisdiction_text: t("warnings.jurisdiction_text"),
    },
    trainings: {
      title: t("trainings.title"),
      items: {
        "1": t("trainings.items.1"),
        "2": t("trainings.items.2"),
        "3": t("trainings.items.3"),
        "4": t("trainings.items.4"),
        "5": t("trainings.items.5"),
        "6": t("trainings.items.6"),
        "7": t("trainings.items.7"),
        "8": t("trainings.items.8"),
      },
    },
  };

  return (
    <footer className="bg-skin-bg text-skin-base w-full border border-skin-border px-4 sm:px-6 lg:px-20 py-8 lg:py-16">
      <div className="mx-auto max-w-screen-2xl">
        <TopIntro texts={texts} />
        <Divider />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr_1fr_587px_auto] lg:items-start">
          <QuickLinks texts={texts} />
          <UsefulLinks texts={texts} />
          <TrainingsSliderList texts={texts} />
          <Licenses texts={texts} />
        </div>
        <Divider />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
          <ContactCenterCopy texts={texts} />
          <ContactInfoCopy texts={texts} />
          <SocialsBlock texts={texts} />
        </div>
        <AccordionCard
          title={texts.warnings.risk_title}
          defaultOpen
          image="/svg/warning.svg"
        >
          <p className="text-sm leading-7 text-skin-muted">
            {texts.warnings.risk_text}
          </p>
        </AccordionCard>
        <AccordionCard
          title={texts.warnings.jurisdiction_title}
          className="mt-3"
          image="/svg/disclaimer.svg"
        >
          <p className="text-sm leading-7 text-skin-muted">
            {texts.warnings.jurisdiction_text}
          </p>
        </AccordionCard>
        <BottomBar texts={texts} />
      </div>
    </footer>
  );
}

function TopIntro({ texts }: { texts: FooterTexts }) {
  return (
    <div className="flex flex-col gap-4 items-start justify-between lg:flex-row lg:items-center">
      <Logo className="shrink-0" />
      <span className="text-skin-base text-sm sm:text-base lg:h-[56px] w-full lg:mx-11">
        {texts.top_intro}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="w-full h-px bg-skin-divider mx-auto my-8" />;
}

function QuickLinks({ texts }: { texts: FooterTexts }) {
  return (
    <div className="text-skin-base font-semibold text-sm flex justify-center">
      <ul className="space-y-4 text-base font-medium text-center md:text-right">
        <h3 className="text-base font-bold py-1 text-skin-heading">
          {texts.quick_links_title}
        </h3>
        <li>
          <Link className="hover:text-skin-accent transition" href="/">
            {texts.quick_links.home}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {texts.quick_links.prop}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {texts.quick_links.plans}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {texts.quick_links.careers}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {texts.quick_links.brokers}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {texts.quick_links.rules}
          </Link>
        </li>
      </ul>
    </div>
  );
}

function UsefulLinks({ texts }: { texts: FooterTexts }) {
  return (
    <div className="text-skin-base flex justify-center">
      <ul className="space-y-4 text-base font-medium text-center md:text-left">
        <h3 className="text-base py-1 font-bold text-skin-heading">
          {texts.useful_links_title}
        </h3>
        <li>
          <Link className="hover:text-skin-accent transition" href="/">
            {texts.useful_links.contact}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/prop">
            {texts.useful_links.about}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/plans">
            {texts.useful_links.policy}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {texts.useful_links.faq}
          </Link>
        </li>
      </ul>
    </div>
  );
}

function MiniEducationHeader({ texts }: { texts: FooterTexts }) {
  return (
    <div className="text-skin-base flex">
      <div className="h-7 flex items-center gap-2">
        <Image
          src="/svg/arrow.svg"
          alt="arrow"
          width={22}
          height={23}
          className="bg-skin-card dark:invert"
        />
        <h3>{texts.trainings.title}</h3>
        <Image
          src="/svg/arrow.svg"
          alt="arrow"
          width={8}
          height={8}
          className="bg-skin-card dark:invert"
        />
      </div>
    </div>
  );
}

function Licenses({ texts }: { texts: FooterTexts }) {
  return (
    <div className="text-skin-base">
      <div className="flex items-center gap-3 lg:gap-5 mb-6 mr-0 lg:mr-3.5 justify-center md:justify-start">
        <h3 className="text-xs font-bold text-skin-heading">
          {texts.licenses_title}
        </h3>
        <Image
          src="/svg/questionMark.svg"
          alt="question mark"
          width={12}
          height={12}
          className="dark:invert"
        />
      </div>
      <div className="flex items-center gap-2 justify-center md:justify-start">
        <Image
          src="/svg/ASIC.svg"
          alt="ASIC"
          width={73.35}
          height={73.35}
          className="rounded-full border-2 border-skin-border bg-white"
        />
        <Image
          src="/image/FSA.png"
          alt="FSA"
          width={73.35}
          height={73.35}
          className="rounded-full border-2 border-skin-border bg-white"
        />
        <Image
          src="/image/FC.png"
          alt="FC"
          width={73.35}
          height={73.35}
          className="rounded-full border-2 border-skin-border"
        />
      </div>
    </div>
  );
}

function ContactCenterCopy({ texts }: { texts: FooterTexts }) {
  return (
    <div className="text-skin-base">
      <ul>
        <li className="flex">
          <span className="font-bold text-sm text-skin-heading">
            {texts.contact_center.title}
          </span>
        </li>
        <li className="flex pt-2.5">
          <span className="font-bold text-sm">
            {texts.contact_center.support}
          </span>
        </li>
        <li className="flex pt-2.5">
          <span className="font-semibold text-xs mt-3 mb-2.5 text-skin-muted">
            {texts.contact_center.note}
          </span>
        </li>
      </ul>
    </div>
  );
}

function ContactInfoCopy({ texts }: { texts: FooterTexts }) {
  return (
    <div className="text-skin-base text-left">
      <ul className="ml-0 lg:ml-[99px]">
        <li>
          <div className="font-semibold text-sm flex justify-end items-center gap-2">
            <span>{texts.contact_info.phone}</span>
            <Image
              src="/svg/Phone.svg"
              alt="phone"
              width={22}
              height={23}
              className="dark:invert"
            />
          </div>
        </li>
        <li className="mt-2.5">
          <div className="text-sm font-semibold flex justify-end items-center gap-2">
            <span>{texts.contact_info.email}</span>
            <Image
              src="/svg/Group.svg"
              alt="email"
              width={22}
              height={23}
              className="dark:invert"
            />
          </div>
        </li>
        <li className="mt-2.5">
          <div className="text-sm font-semibold flex justify-end items-center gap-2">
            <span>{texts.contact_info.address}</span>
            <Image
              src="/svg/location.svg"
              alt="location"
              width={22}
              height={23}
              className="dark:invert"
            />
          </div>
        </li>
      </ul>
    </div>
  );
}

function SocialsBlock({ texts }: { texts: FooterTexts }) {
  const socials = [
    { src: "/image/insta.png", label: texts.socials.instagram },
    { src: "/image/whatsapp.png", label: texts.socials.whatsapp },
    { src: "/image/youtube.png", label: texts.socials.youtube },
    { src: "/image/telegram.png", label: texts.socials.telegram },
  ];
  return (
    <div className="flex justify-center gap-4">
      {socials.map((s, i) => (
        <div key={i} className="text-center">
          <div className="flex h-[56px] w-[56px] lg:h-[62px] lg:w-[62px] bg-[#19CCA7] rounded items-center justify-center mb-2 lg:mb-4">
            <Image src={s.src} alt={String(s.label)} width={33} height={33} />
          </div>
          <span className="text-[#0E1515] dark:text-white text-xs lg:text-sm flex justify-center">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function BottomBar({ texts }: { texts: FooterTexts }) {
  return (
    <div className="my-10 flex flex-col items-center gap-4 text-skin-base text-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center">
        <Image
          src="/image/arrowUp.png"
          alt="arrowUp"
          width={29}
          height={29}
          className="rounded-sm cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <span className="text-center lg:text-right">
          {texts.bottom_bar.rights}
        </span>
      </div>
      <span className="text-center lg:text-right">{texts.bottom_bar.dev}</span>
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
  texts,
  title,
  items,
  pageSize = 4,
  className = "",
  prevIcon,
  nextIcon,
}: Props & { texts: FooterTexts }) {
  const resolvedTitle = title ?? texts.trainings.title;
  const defaultItems: Item[] = [
    { id: 1, title: texts.trainings.items["1"], href: "#" },
    { id: 2, title: texts.trainings.items["2"], href: "#" },
    { id: 3, title: texts.trainings.items["3"], href: "#" },
    { id: 4, title: texts.trainings.items["4"], href: "#" },
    { id: 5, title: texts.trainings.items["5"], href: "#" },
    { id: 6, title: texts.trainings.items["6"], href: "#" },
    { id: 7, title: texts.trainings.items["7"], href: "#" },
    { id: 8, title: texts.trainings.items["8"], href: "#" },
  ];

  const data = useMemo<Item[]>(
    () => (items && items.length ? items : defaultItems),
    [items, defaultItems]
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
          {resolvedTitle}
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
          <li key={it.id} className="flex justify-between gap-3 text-right">
            <Link href={it.href} aria-label="مشاهده آموزش" className="shrink-0">
              <Image
                src="/svg/Arrowleft.svg"
                alt="arrow"
                width={16.05}
                height={16.05}
                className="ml-1.5 dark:invert"
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

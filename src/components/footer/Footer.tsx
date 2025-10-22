import "server-only";
import Image from "next/image";
import Link from "next/link";

import ScrollTopButton from "./ScrollTopButtonClient";
import Logo from "../Logo";

import { getServerT } from "@/lib/i18n/get-server-t";

import { ArticleService } from "@/server/modules/articles/services/article.service";
import AccordionCard from "./AccordionCardClient";
import TrainingsSliderList from "./TrainingsSliderListClient";

type Lang = "fa" | "en";

const dash = (v: any) => {
  if (v == null) return "-";
  const s = String(v).trim();
  return s.length ? s : "-";
};

export default async function Footer({ lang }: { lang: Lang }) {
  const t = await getServerT(lang, "footer");
  const tt = (k: string) => dash(t(k));

  const artSvc = new ArticleService();
  const { items: arts } = await artSvc.listArticles({
    variant: "lite",
    pageSize: 8,
    sort: { by: "createdAt", dir: "DESC" },
  });

  const trainingItems =
    Array.isArray(arts) && arts.length
      ? arts.map((a: any) => ({
          id: a?.id ?? Math.random(),
          title: dash(a?.title),
          href: `/articles/${a?.id ?? ""}`,
        }))
      : [];

  return (
    <footer className="bg-skin-bg text-skin-base w-full border border-skin-border px-4 sm:px-6 lg:px-20 py-8 lg:py-16">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-4 items-start justify-between lg:flex-row lg:items-center">
          <Logo className="shrink-0" />
          <span className="text-skin-base text-sm sm:text-base lg:h-[56px] w-full lg:mx-11">
            {tt("top_intro")}
          </span>
        </div>

        <Divider />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr_1fr_587px_auto] lg:items-start">
          <QuickLinks tt={tt} />
          <UsefulLinks tt={tt} />
          <TrainingsSliderList title={tt("trainings.title")} items={trainingItems} pageSize={4} />
          <Licenses tt={tt} />
        </div>

        <Divider />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
          <ContactCenterCopy tt={tt} />
          <ContactInfoCopy tt={tt} />
          <SocialsBlock tt={tt} />
        </div>

        <AccordionCard title={tt("warnings.risk_title")} defaultOpen image="/svg/warning.svg">
          <p className="text-sm leading-7 text-skin-muted">
            {tt("warnings.risk_text")}
          </p>
        </AccordionCard>

        <AccordionCard title={tt("warnings.jurisdiction_title")} className="mt-3" image="/svg/disclaimer.svg">
          <p className="text-sm leading-7 text-skin-muted">
            {tt("warnings.jurisdiction_text")}
          </p>
        </AccordionCard>

        <div className="my-10 flex flex-col items-center gap-4 text-skin-base text-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center">
            <ScrollTopButton />
            <span className="text-center lg:text-right">
              {tt("bottom_bar.rights")}
            </span>
          </div>
          <span className="text-center lg:text-right">
            {tt("bottom_bar.dev")}
          </span>
        </div>
      </div>
    </footer>
  );
}

function Divider() {
  return <div className="w-full h-px bg-skin-divider mx-auto my-8" />;
}

function QuickLinks({ tt }: { tt: (k: string) => string }) {
  return (
    <div className="text-skin-base font-semibold text-sm flex justify-center">
      <ul className="space-y-4 text-base font-medium text-center md:text-right">
        <h3 className="text-base font-bold py-1 text-skin-heading">
          {tt("quick_links_title")}
        </h3>
        <li>
          <Link className="hover:text-skin-accent transition" href="/">
            {tt("quick_links.home")}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {tt("quick_links.prop")}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {tt("quick_links.plans")}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {tt("quick_links.careers")}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {tt("quick_links.brokers")}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {tt("quick_links.rules")}
          </Link>
        </li>
      </ul>
    </div>
  );
}

function UsefulLinks({ tt }: { tt: (k: string) => string }) {
  return (
    <div className="text-skin-base flex justify-center">
      <ul className="space-y-4 text-base font-medium text-center md:text-left">
        <h3 className="text-base py-1 font-bold text-skin-heading">
          {tt("useful_links_title")}
        </h3>
        <li>
          <Link className="hover:text-skin-accent transition" href="/">
            {tt("useful_links.contact")}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/prop">
            {tt("useful_links.about")}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/plans">
            {tt("useful_links.policy")}
          </Link>
        </li>
        <li>
          <Link className="hover:text-skin-accent transition" href="/faq">
            {tt("useful_links.faq")}
          </Link>
        </li>
      </ul>
    </div>
  );
}

function Licenses({ tt }: { tt: (k: string) => string }) {
  return (
    <div className="text-skin-base">
      <div className="flex items-center gap-3 lg:gap-5 mb-6 mr-0 lg:mr-3.5 justify-center md:justify-start">
        <h3 className="text-xs font-bold text-skin-heading">
          {tt("licenses_title")}
        </h3>
        <Image src="/svg/questionMark.svg" alt="question mark" width={12} height={12} className="dark:invert" />
      </div>
      <div className="flex items-center gap-2 justify-center md:justify-start">
        <Image src="/svg/ASIC.svg" alt="ASIC" width={73.35} height={73.35} className="rounded-full border-2 border-skin-border bg-white" />
        <Image src="/image/FSA.png" alt="FSA" width={73.35} height={73.35} className="rounded-full border-2 border-skin-border bg-white" />
        <Image src="/image/FC.png" alt="FC" width={73.35} height={73.35} className="rounded-full border-2 border-skin-border" />
      </div>
    </div>
  );
}

function ContactCenterCopy({ tt }: { tt: (k: string) => string }) {
  return (
    <div className="text-skin-base">
      <ul>
        <li className="flex">
          <span className="font-bold text-sm text-skin-heading">
            {tt("contact_center.title")}
          </span>
        </li>
        <li className="flex pt-2.5">
          <span className="font-bold text-sm">
            {tt("contact_center.support")}
          </span>
        </li>
        <li className="flex pt-2.5">
          <span className="font-semibold text-xs mt-3 mb-2.5 text-skin-muted">
            {tt("contact_center.note")}
          </span>
        </li>
      </ul>
    </div>
  );
}

function ContactInfoCopy({ tt }: { tt: (k: string) => string }) {
  return (
    <div className="text-skin-base text-left">
      <ul className="ml-0 lg:ml-[99px]">
        <li>
          <div className="font-semibold text-sm flex justify-end items-center gap-2">
            <span>{tt("contact_info.phone")}</span>
            <Image src="/svg/Phone.svg" alt="phone" width={22} height={23} className="dark:invert" />
          </div>
        </li>
        <li className="mt-2.5">
          <div className="text-sm font-semibold flex justify-end items-center gap-2">
            <span>{tt("contact_info.email")}</span>
            <Image src="/svg/Group.svg" alt="email" width={22} height={23} className="dark:invert" />
          </div>
        </li>
        <li className="mt-2.5">
          <div className="text-sm font-semibold flex justify-end items-center gap-2">
            <span>{tt("contact_info.address")}</span>
            <Image src="/svg/location.svg" alt="location" width={22} height={23} className="dark:invert" />
          </div>
        </li>
      </ul>
    </div>
  );
}

function SocialsBlock({ tt }: { tt: (k: string) => string }) {
  const socials = [
    { src: "/image/insta.png", label: tt("socials.instagram") },
    { src: "/image/whatsapp.png", label: tt("socials.whatsapp") },
    { src: "/image/youtube.png", label: tt("socials.youtube") },
    { src: "/image/telegram.png", label: tt("socials.telegram") },
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
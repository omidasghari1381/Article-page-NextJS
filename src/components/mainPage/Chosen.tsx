"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { articleCategoryEnum } from "@/server/modules/articles/enums/articleCategory.enum";
import { timeAgoFa } from "@/app/utils/date";

type Lang = "fa" | "en";

type AuthorDTO = { id: string; firstName: string; lastName: string } | null;
type CategoryLite = { id: string; name: string; slug?: string };
type ArticleLite = {
  id: string;
  title: string;
  subject: string | null;
  createdAt: string;
  viewCount: number;
  thumbnail: string | null;
  readingPeriod: number;
  author?: AuthorDTO;
  categories?: CategoryLite[];
};

export default function Chosen({
  article,
  categories,
  lang,
}: {
  article: ArticleLite | null;
  categories: articleCategoryEnum[];
  lang: Lang;
}) {
  const { t } = useTranslation(["article", "common"]);
  const [selected, setSelected] = useState<articleCategoryEnum | null>(null);

  const baseBtn =
    "text-sm font-semibold px-4 py-2 rounded-md border transition whitespace-nowrap duration-200";
  const active =
    "bg-[#1B1B1B] text-white border-transparent dark:bg-white dark:text-[#1B1B1B]";
  const inactive =
    "bg-transparent text-skin-base border-skin-border hover:bg-skin-card/60 dark:hover:bg-skin-card/80";

  return (
    <section className="text-skin-base">
      <div className="flex items-center gap-3">
        <Image
          src="/svg/Rectangle.svg"
          alt={t("home:chosen.badge_alt")}
          width={8}
          height={36}
          className="dark:invert"
        />
        <h3 className="text-xl font-semibold text-skin-heading">
          {t("chosen.title")}
        </h3>
      </div>

      <div className="my-5 flex gap-2 overflow-x-auto no-scrollbar sm:flex-wrap sm:overflow-visible">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className={`${baseBtn} ${selected === null ? active : inactive}`}
        >
          {t("chosen.all")}
        </button>

        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setSelected(cat)}
            className={`${baseBtn} ${selected === cat ? active : inactive}`}
          >
            {String(cat)}
          </button>
        ))}
      </div>

      <ArticleCard article={article} lang={lang} />
    </section>
  );
}

function ArticleCard({ article }: { article: ArticleLite | null; lang: Lang }) {
  const { t } = useTranslation(["article","common"]);
  const href = article?.id ? `/articles/${article.id}` : "#";

  return (
    <Link
      href={href}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
      aria-disabled={!article?.id}
    >
      <div className="relative w-full sm:w-48 md:w-56 aspect-[16/9] sm:aspect-[16/10]">
        <Image
          src={article?.thumbnail ?? "/image/a.png"}
          alt={article?.subject ?? article?.title ?? "thumbnail"}
          fill
          className="rounded-md object-cover"
          sizes="(max-width: 640px) 100vw, 220px"
        />
      </div>

      <div className="flex-1">
        <h4 className="text-base sm:text-lg font-semibold text-skin-heading line-clamp-2">
          {article?.subject ?? article?.title ?? "—"}
        </h4>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-skin-muted">
          <div className="flex items-center gap-2">
            <Image
              src={"/svg/calender.svg"}
              alt="calender"
              width={20}
              height={20}
              className="dark:invert"
            />
            <span>
              {article?.createdAt ? timeAgoFa(article.createdAt) : "—"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Image
              src={"/svg/eye.svg"}
              alt="eye"
              width={18}
              height={14}
              className="dark:invert"
            />
            <span>
              {t("common:view", {
                count: article?.viewCount ?? 0,
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

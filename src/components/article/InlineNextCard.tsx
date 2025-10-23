import Image from "next/image";
import { timeAgoFa } from "@/app/utils/date";
import { getServerT } from "@/lib/i18n/get-server-t";
import type { Lang } from "@/lib/i18n/settings";

type Author = { id: string; firstName: string; lastName: string };

export default async function InlineNextCard({
  author,
  createdAt,
  subject,
  readingPeriod,
  className = "",
  lang,
}: {
  author?: Author | null;
  createdAt?: string | null;
  subject?: string | null;
  readingPeriod?: number | string | null;
  className?: string;
  lang: Lang;
}) {
  const t = await getServerT(lang, "article");

  const n =
    typeof readingPeriod === "string"
      ? Number(readingPeriod)
      : readingPeriod ?? 0;
  const readingText =
    !n || Number.isNaN(n) || n <= 1
      ? t("hero.minutes_one")
      : t("hero.minutes_many", { n });

  const fullName = author
    ? `${author.firstName} ${author.lastName}`
    : "—";

  return (
    <div
      className={`w-full rounded-xl border border-[#E4E4E4] dark:border-skin-border p-5 
                  bg-white dark:bg-skin-card flex flex-col justify-between 
                  h-auto lg:h-[163.5px] transition-colors ${className}`}
    >
      <div className="flex items-center text-[#3B3F3F] dark:text-skin-base mb-3">
        <Image
          src="/image/author.png"
          alt={t("inline.author_alt")}
          width={33}
          height={33}
          className="object-cover rounded-full ml-3"
        />
        <span className="text-xs font-medium">
          {t("inline.written_by")}
        </span>
        <span className="text-xs font-medium ml-1">{fullName}</span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 lg:truncate my-3">
          {subject || "—"}
        </h4>

        <div className="flex flex-wrap gap-3">
          <div
            className="text-xs rounded-sm font-medium text-black dark:text-white 
                          bg-[#E4E4E43B] dark:bg-skin-border/30 h-8 px-2 flex items-center gap-2 transition-colors"
          >
            <Image
              src="/svg/time.svg"
              alt={t("hero.minutes_alt")}
              width={14.38}
              height={14.38}
              className="dark:invert"
            />
            <span className="whitespace-nowrap">{readingText}</span>
          </div>

          <div
            className="text-xs rounded-sm font-medium text-black dark:text-white 
                          bg-[#E4E4E43B] dark:bg-skin-border/30 h-8 px-2 flex items-center gap-2 transition-colors"
          >
            <Image
              src="/svg/calender.svg"
              alt={t("chosen.date_alt")}
              width={14.38}
              height={14.38}
              className="dark:invert"
            />
            <span className="whitespace-nowrap">
              {createdAt ? timeAgoFa(createdAt) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
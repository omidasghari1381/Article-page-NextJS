"use client";

import Image from "next/image";
import { useState } from "react";
import { articleCategoryEnum } from "@/server/modules/articles/enums/articleCategory.enum";
import { timeAgoFa } from "@/app/utils/date";

/** هماهنگ با ArticleLite صفحه اصلی */
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
}: {
  article: ArticleLite | null;
  categories: articleCategoryEnum[];
}) {
  const [selected, setSelected] = useState<articleCategoryEnum | null>(null);

  const baseBtn =
    "text-sm font-semibold px-4 py-2 rounded-md border transition whitespace-nowrap";
  const active =
    "text-white bg-gradient-to-r from-[#111414] to-[#272F2F] border-transparent";
  const inactive = "text-black border-[#D7D7D7]";

  return (
    <section>
      <div className="flex items-center gap-3">
        <Image src="/svg/Rectangle.svg" alt="thumb" width={8} height={36} />
        <h3 className="text-xl font-semibold text-[#1C2121]">انتخاب سردبیر</h3>
      </div>

      <div className="my-5 flex gap-2 overflow-x-auto no-scrollbar sm:flex-wrap sm:overflow-visible">
        <button
          onClick={() => setSelected(null)}
          className={`${baseBtn} ${selected === null ? active : inactive}`}
        >
          همه
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`${baseBtn} ${selected === cat ? active : inactive}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <ArticleCard article={article} />
    </section>
  );
}

function ArticleCard({ article }: { article: ArticleLite | null }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
      <div className="relative w-full sm:w-48 md:w-56 aspect-[16/9] sm:aspect-[16/10]">
        <Image
          src={article?.thumbnail ?? "/image/a.png"}
          alt={article?.subject ?? article?.title ?? "thumb"}
          fill
          className="rounded-md object-cover"
          sizes="(max-width: 640px) 100vw, 220px"
        />
      </div>
      <div className="flex-1">
        <h4 className="text-base sm:text-lg font-semibold text-[#1C2121] line-clamp-2">
          {article?.subject ?? article?.title ?? "—"}
        </h4>
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[#373A41]">
          <div className="flex items-center gap-2">
            <Image src={"/svg/calender.svg"} alt="date" width={20} height={20} />
            <span>{article?.createdAt ? timeAgoFa(article.createdAt) : "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src={"/svg/eye.svg"} alt="views" width={18} height={14} />
            <span>بازدید {article?.viewCount ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
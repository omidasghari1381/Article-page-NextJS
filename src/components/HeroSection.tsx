"use client";
import { timeAgoFa } from "@/app/utils/date";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

type Article = {
  id: string;
  title: string;
  subject: string;
  category: string;
  viewCount: number;
  thumbnail: string | null;
  Introduction: string | null;
  author: { id: string; firstName: string; lastName: string };
  createdAt: string;
};

type Latest = {
  thumbnail: string | null;
  viewCount: number;
  subject: string;
  createdAt: string;
};

export default function HeroSection({
  article,
  items,
}: {
  article: Article | null;
  items: Latest[] | null;
}) {
  console.log(items);

  const router = useRouter();
  const handleRedirect = () => {
    if (article?.id) router.push(`/article/${article.id}`);
  };

  return (
    <section className="text-white w-full">
      {/* Hero */}
      <div className="relative bg-black mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch overflow-hidden rounded-xl">
        {/* متن سمت راست/چپ */}
        <div className="relative flex flex-col justify-center space-y-4 md:space-y-6 py-8 md:py-10 z-10 order-2 md:order-1">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300">
            <Image src="/svg/write.svg" alt="نویسنده" width={22} height={22} />
            <span>{article?.author.firstName}</span>
            <span>{article?.author.lastName}</span>
            <span className="opacity-60">·</span>
            <Image
              src="/svg/whiteCalender.svg"
              alt="تاریخ"
              width={22}
              height={22}
            />
            <span>
              {article?.createdAt ? timeAgoFa(article.createdAt) : "—"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed">
            {article?.title ?? "—"}
            <br />
            <span className="font-normal text-gray-300">
              {article?.subject ?? ""}
            </span>
          </h1>

          <div className="flex w-full sm:w-auto">
            <button
              className="w-full sm:w-auto bg-[#19CCA7] hover:bg-[#15b697] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 sm:px-6 py-3 rounded-lg font-medium transition"
              onClick={handleRedirect}
              disabled={!article?.id}
            >
              ← مطالعه مقاله
            </button>
          </div>
        </div>

        {/* تصویر بک‌گراند/کناری */}
        <div className="relative min-h-[220px] sm:min-h-[300px] md:min-h-[420px] lg:min-h-[480px] order-1 md:order-2 rounded-xl overflow-hidden">
          {/* گرین/نویز و گرادیانت */}
          <div className="absolute inset-0 z-[1]">
            <div className="absolute inset-0 bg-gradient-to-l md:bg-gradient-to-l from-[#000A08]/70 md:from-[#000A08] to-transparent" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "url('/Image/noise.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "auto",
              }}
            />
          </div>

          {/* تصویر */}
          <Image
            src={article?.thumbnail ?? "/Image/hero1.jpg"}
            alt={article?.title ?? "Hero"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw,
                   (max-width: 1024px) 50vw,
                   50vw"
            priority
          />
        </div>
      </div>

      {/* لیست آخرین‌ها */}
      <div
        className="
          mx-auto mt-6 sm:mt-8 lg:mt-10
          px-4 sm:px-6 lg:px-8
        "
      >
        <div
          className="
            bg-white/10 backdrop-blur-xl rounded-xl
            p-4 sm:p-5 md:p-6
            lg:-translate-y-10
          "
        >
          {/* روی موبایل: اسلایدر افقی؛ از md به بالا: گرید */}
          <div className="mx-auto p-6  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6  -translate-y-20 h-[303px] w-[1280px] backdrop-blur-[100px] rounded-lg justify-center">
            <div className="md:col-span-full md:hidden">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mb-2 align-middle">
                {items?.map((item, idx) => (
                  <article
                    key={`${item.createdAt}-${idx}`}
                    className="min-w-[260px] max-w-[260px] snap-start bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                  >
                    <div className="relative w-full h-40">
                      <Image
                        src={item.thumbnail ?? "/Image/placeholder.jpg"}
                        alt={item.subject}
                        fill
                        className="object-cover"
                        sizes="260px"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-2">
                        {item.subject}
                      </h3>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>
                          {item.createdAt ? timeAgoFa(item.createdAt) : "—"}
                        </span>
                        <span>بازدید {item.viewCount}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {items?.map((item, idx) => (
              <article
                key={`md-${item.createdAt}-${idx}`}
                className="hidden md:block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                <div className="relative w-full h-40 md:h-44 lg:h-48">
                  <Image
                    src={item.thumbnail ?? "/Image/placeholder.jpg"}
                    alt={item.subject}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-800 line-clamp-2">
                    {item.subject}
                  </h3>
                  <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
                    <span>
                      {item.createdAt ? timeAgoFa(item.createdAt) : "—"}
                    </span>
                    <span>بازدید {item.viewCount}</span>
                  </div>
                </div>
              </article>
            ))}

            {/* اگر آیتمی نبود */}
            {!items?.length && (
              <div className="col-span-full text-center text-sm text-gray-200 py-8">
                محتوایی برای نمایش وجود ندارد.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

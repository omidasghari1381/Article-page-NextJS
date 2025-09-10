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
  const router = useRouter();
  const handleRedirect = () => {
    router.push(`/article/${article?.id}`);
  };
  return (
    <section className=" text-white w-full">
      <div className="relative bg-black h-[479px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center overflow-hidden">
        <div className="relative flex flex-col items-start space-y-6 pr-20 z-10">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Image
              src="/svg/write.svg"
              alt="note"
              width={21.375280380249023}
              height={21.375280380249023}
            />
            <span>{article?.author.firstName}</span>
            <span>{article?.author.lastName}</span>
            <span>·</span>
            <Image
              src="/svg/whiteCalender.svg"
              alt="note"
              width={21.375280380249023}
              height={21.375280380249023}
            />
            <span>{article?.createdAt && timeAgoFa(article?.createdAt)}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold">
            {article?.title} <br />
            <span className="font-normal text-gray-300">
              {article?.subject}{" "}
            </span>
          </h1>

          <button
            className="bg-[#19CCA7] hover:bg-[#15b697] text-white px-6 py-3 rounded-lg font-medium transition"
            onClick={handleRedirect}
          >
            ← مطالعه مقاله
          </button>
        </div>

        <div className="relative ">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-l from-[#000A08] to-[#000A08]/0" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/Image/noise.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "auto",
              }}
            />
          </div>
          <img
            src="/Image/hero1.jpg"
            alt="Trading App"
            className="h-[479px] w-[853.13px] rounded-lg shadow-lg object-cover"
          />
        </div>
      </div>

      <div className="mx-auto p-6  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6  -translate-y-20 h-[303px] w-[1280px] backdrop-blur-[70px] rounded-lg ">
        {items?.map((item, idx) => (
          <div
            key={`${item.createdAt}-${idx}`}
            className="bg-white  rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={item.thumbnail ?? "/Image/placeholder.jpg"}
              alt="Article"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-base font-bold text-gray-800 ">
                {item.subject}{" "}
              </h3>
              <div className="flex items-center justify-items-start gap-6 mt-3 text-xs text-gray-500">
                <span>{item.createdAt && timeAgoFa(item?.createdAt)}</span>
                <span>بازدید {item.viewCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

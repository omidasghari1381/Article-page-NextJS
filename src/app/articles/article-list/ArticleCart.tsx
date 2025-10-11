"use client";

import Image from "next/image";
import Link from "next/link";
import { timeAgoFa } from "@/app/utils/date";
import { useState } from "react";

type ArticleCardProps = {
  id: string;
  title: string;
  subject: string | null;
  createdAt: string;
  category: { id: string; name: string } | null;
  author: { id: string; firstName: string; lastName: string } | null;
  thumbnail: string | null;
  readingPeriod: number;
};

export default function ArticleCard({
  article,
}: {
  article: ArticleCardProps;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="relative flex flex-col sm:flex-row bg-white border rounded-xl overflow-hidden hover:shadow-md transition">
      {/* تصویر → لینک به صفحه مقاله */}
      <Link
        href={`/articles/${article.id}`}
        prefetch
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-56 h-48 sm:h-auto relative flex-shrink-0 block"
      >
        <Image
          src={article.thumbnail || "/image/default-thumb.jpg"}
          alt={article.title}
          fill
          className={`object-cover transition-opacity ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImgLoaded(true)}
          priority={false}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
      </Link>

      {/* بدنه کارت */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-black line-clamp-2 mb-1">
            {article.title}
          </h2>
          <p className="text-gray-600 text-sm line-clamp-2">
            {article.subject ?? "—"}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-3">
          {article.category && (
            <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700">
              {article.category.name}
            </span>
          )}
          {article.author && (
            <span>
              👤 {article.author.firstName} {article.author.lastName}
            </span>
          )}
          <span>🕒 {article.readingPeriod} دقیقه مطالعه</span>
          <span>📅 {timeAgoFa(article.createdAt)}</span>
        </div>
      </div>

      {/* دکمه ویرایش - دسکتاپ */}
      <div className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2">
        <Link
          href={`/articles/editor/${article.id}`}
          className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50 transition text-sm"
        >
          ویرایش
        </Link>
      </div>

      {/* موبایل */}
      <div className="flex sm:hidden justify-end p-3 border-t">
        <Link
          href={`/articles/editor/${article.id}`}
          className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50 transition text-sm"
        >
          ویرایش
        </Link>
      </div>
    </div>
  );
}

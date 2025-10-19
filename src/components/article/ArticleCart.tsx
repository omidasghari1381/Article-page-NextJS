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

export default function ArticleCard({ article }: { article: ArticleCardProps }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="relative flex flex-col sm:flex-row bg-skin-card border border-skin-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
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
          className={`object-cover transition-opacity ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
          priority={false}
        />
        {!imgLoaded && <div className="absolute inset-0 bg-skin-border/40 animate-pulse" />}
      </Link>

      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-skin-heading line-clamp-2 mb-1">
            {article.title}
          </h2>
          <p className="text-skin-muted text-sm line-clamp-2">{article.subject ?? "—"}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-skin-muted mt-3">
          {article.category && (
            <span className="bg-skin-border/30 px-2 py-1 rounded-md text-skin-base">
              {article.category.name}
            </span>
          )}
          {article.author && (
            <span>👤 {article.author.firstName} {article.author.lastName}</span>
          )}
          <span>🕒 {article.readingPeriod} دقیقه مطالعه</span>
          <span>📅 {timeAgoFa(article.createdAt)}</span>
        </div>
      </div>

      <div className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2">
        <Link
          href={`/admin/articles/editor/${article.id}`}
          className="px-3 py-1.5 rounded-lg border border-skin-border text-skin-base hover:bg-skin-card/60 transition-colors text-sm"
        >
          ویرایش
        </Link>
      </div>

      <div className="flex sm:hidden justify-end p-3 border-t border-skin-border">
        <Link
          href={`/admin/articles/editor/${article.id}`}
          className="px-3 py-1.5 rounded-lg border border-skin-border text-skin-base hover:bg-skin-card/60 transition-colors text-sm"
        >
          ویرایش
        </Link>
      </div>
    </div>
  );
}
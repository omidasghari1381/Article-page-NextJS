"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

type ArticleDetail = {
  id: string;
  title: string;
  subject: string;
  thumbnail: string | null;
  category: string;
  readingPeriod: string;
  viewCount: number;
  author: { firstName: string; lastName: string };
  mainText: string;
};

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/articles/inner-article/${id}`);
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error("خطا در گرفتن مقاله:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-gray-500">
        در حال بارگذاری...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-red-500">
        مقاله پیدا نشد
      </div>
    );
  }

  // ✅ پاکسازی درست: از article.mainText استفاده کن
  const safeHtml = DOMPurify.sanitize(article.mainText, {
    ALLOWED_ATTR: ["href", "src", "alt"],
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {article.thumbnail && (
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full max-h-[400px] object-cover rounded-xl mb-6"
        />
      )}

      <h1 className="text-3xl font-bold text-slate-900 mb-3">
        {article.title}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {article.category} • {article.readingPeriod} • 👁{" "}
        {(article.viewCount ?? 0).toLocaleString("fa-IR")} بازدید
      </p>

      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
          {article.author?.firstName?.[0] ?? "?"}
        </div>
        <span className="text-gray-800 text-sm">
          {article.author
            ? `${article.author.firstName} ${article.author.lastName}`
            : "نویسنده ناشناس"}
        </span>
      </div>

      {/* اینجا متن مقاله رو با HTML امن رندر می‌کنیم */}
      <div
        className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </main>
  );
}

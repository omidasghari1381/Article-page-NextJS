// app/article/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import SidebarLatest from "@/components/SidebarLatest";
import SummaryDropdown from "@/components/summery";
import { timeAgoFa } from "@/app/utils/date";
import HeroCard from "@/components/article/HeroCard";
import ArticleBody from "@/components/article/ArticleBody";
import InlineNextCard from "@/components/article/InlineNextCard";
import Thumbnail, { Thumbnaill } from "@/components/article/Thumbnail";
import RelatedArticles from "@/components/article/RelatedArticles";
import CommentsBlock from "@/components/article/CommentsBlock";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { absolute } from "@/app/utils/base-url";

type Author = { id: string; firstName: string; lastName: string };

type ArticleDetail = {
  id: string;
  title: string;
  subject: string;
  category: string;
  readingPeriod: string;
  viewCount: number;
  thumbnail: string | null;
  Introduction: string | null;
  quotes: string | null;
  mainText: string;
  secondryText: string;
  author: Author;
  createdAt: string;
  summery: string[];
};

type LiteArticle = {
  id: string;
  title: string;
  createdAt: string;
  category: string;
  author: Author;
  thumbnail: string | null;
  readingPeriod: string;
};

type LikeArticle = {
  id: string;
  subject: string;
  createdAt: string;
  readingPeriod: string;
  author: Author;
  category: string;
  thumbnail: string | null;
};

type CommentWithReplies = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: Author;
  like: number;
  dislike: number;
  replies?: {
    id: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    user: Author;
  }[];
};

async function getArticle(id: string): Promise<ArticleDetail | null> {
  const res = await fetch(absolute(`/api/articles/${encodeURIComponent(id)}`), {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getLatest(): Promise<LiteArticle[]> {
  const res = await fetch(absolute(`/api/articles?perPage=4`), {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.items ?? [];
}

async function getRelated(
  category: string,
  excludeId: string
): Promise<LikeArticle | null> {
  const res = await fetch(
    absolute(
      `/api/articles?perPage=4&category=${encodeURIComponent(category)}`
    ),
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const items: LikeArticle[] = Array.isArray(data?.items) ? data.items : [];
  return items.find((x) => x.id !== excludeId) ?? null;
}

async function getComments(
  articleId: string
): Promise<{ items: CommentWithReplies[]; total: number }> {
  const res = await fetch(
    absolute(
      `/api/articles/${encodeURIComponent(
        articleId
      )}/comments?skip=0&take=10&withReplies=1`
    ),
    { cache: "no-store" }
  );
  if (!res.ok) return { items: [], total: 0 };
  const data = await res.json();
  return { items: data?.data ?? [], total: data?.total ?? 0 };
}

export default async function Page({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  if (!article) {
    // می‌تونی اینجا notFound() هم بزنی
    return (
      <main className="px-7 py-10">
        <h1 className="text-xl font-bold">مقاله پیدا نشد</h1>
      </main>
    );
  }

  const [latest, related, commentsRes, session] = await Promise.all([
    getLatest(),
    getRelated(article.category, article.id),
    getComments(article.id),
    getServerSession(authOptions),
  ]);

  // نقش ادمین (سمت سرور)
  const role = (session?.user as any)?.role;
  const isAdmin = role === "admin";

  return (
    <main className="px-7 sm:px-6 lg:px- py-6 mx-auto ">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/" },
          { label: article.category || "—", href: "/" },
          { label: article.title || "..." },
        ]}
      />

      <div className="hidden lg:grid lg:grid-cols-13 gap-2 mt-6">
        <section className="lg:col-span-9 space-y-8">
          <div>
            <HeroCard
              title={article.title}
              subject={article.subject}
              introduction={article.Introduction}
              thumbnail={article.thumbnail}
              readingPeriod={article.readingPeriod}
              viewCount={article.viewCount}
              category={article.category}
              summery={article.summery}
            />

            <ArticleBody
              mainText={article.mainText}
              quotes={article.quotes}
              secondryText={article.secondryText}
            />

            <div className="flex items-start gap-4 my-6">
              <Thumbnaill
                thumbnail={article.thumbnail}
                category={article.category}
              />
              <InlineNextCard
                author={article.author}
                createdAt={article.createdAt}
                subject={article.subject}
                readingPeriod={article.readingPeriod}
              />
            </div>
          </div>
        </section>

        <aside className="lg:col-span-3 space-y-9 ">
          <SidebarLatest posts={latest} />
        </aside>
      </div>

      {/* بلاک نظرات: جزیره‌ی کلاینتی با داده‌ی اولیه */}
      <CommentsBlock
        initialComments={commentsRes.items}
        articleId={article.id}
        initialTotal={commentsRes.total}
      />

      <RelatedArticles post={related} />

      {isAdmin ? (
        <div className="mt-10 flex justify-end">
          <Link
            href={`/article/editor/new-article/${encodeURIComponent(
              article.id
            )}`}
            className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
          >
            ویرایش این مقاله
          </Link>
        </div>
      ) : null}

      <Divider />
    </main>
  );
}

function Divider() {
  return (
    <div className="w-full h-0.5 bg-gray-200 relative my-20">
      <div className="absolute right-0 top-0 h-0.5 bg-emerald-400 w-1/3"></div>
    </div>
  );
}

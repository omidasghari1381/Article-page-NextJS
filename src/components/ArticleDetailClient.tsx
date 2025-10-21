"use client";

import Breadcrumb from "@/components/Breadcrumb";
import RepliesAccordion from "@/components/reply";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { timeAgoFa } from "@/app/utils/date";
import AddComment from "@/components/AddComment";
import { SessionProvider, useSession } from "next-auth/react";
import SummeryDropdown from "./Summery";
import SidebarLatest from "./mainPage/SidebarLatest";

type Author = { id: string; firstName: string; lastName: string };

type ArticleDetailDTO = {
  id: string;
  title: string;
  subject: string;
  category: string; // فقط برای نمایش
  categorySlug?: string | null; // برای related
  readingPeriod: number; // ← عدد
  viewCount: number;
  thumbnail: string | null;
  Introduction: string | null;
  quotes: string | null;
  mainText: string;
  secondryText: string; // ← از secondaryText مپ شده
  author: Author;
  createdAt: string;
  summery: string[]; // ← از summery مپ شده
};

type LiteArticle = {
  id: string;
  title: string;
  createdAt: string;
  category: string; // نام
  author: Author;
  thumbnail: string | null;
  readingPeriod: number; // ← عدد
};

type LikeArticle = {
  id: string;
  subject: string;
  createdAt: string;
  readingPeriod: number; // ← عدد
  author: Author;
  category: string; // نام
  thumbnail: string | null;
};

type Reply = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: Author;
};

type CommentWithReplies = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: Author;
  like: number;
  dislike: number;
  replies?: Reply[];
};

export default function ArticleDetailClient({
  initialArticle,
}: {
  initialArticle: ArticleDetailDTO;
}) {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [article, setArticle] = useState<ArticleDetailDTO | null>(
    initialArticle
  );
  const [latest, setLatest] = useState<LiteArticle[]>([]);
  const [related, setRelated] = useState<LikeArticle | null>(null);
  const [loading, setLoading] = useState(false);

  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    setCommentsLoading(true);
    try {
      const { data } = await axios.get(
        `/api/articles/${encodeURIComponent(id)}/comments`,
        { params: { skip: 0, take: 10, withReplies: 1 } }
      );
      setComments(data?.data || []);
      setCommentsTotal(data?.total || 0);
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancel = false;
    const source = axios.CancelToken.source();

    (async () => {
      try {
        setLoading(true);

        // چون در server page فچ اولیه داریم، اینجا فقط برای همگام‌سازی (اختیاری)
        const { data: a } = await axios.get<ArticleDetailDTO>(
          `/api/articles/${encodeURIComponent(id)}`,
          { cancelToken: source.token }
        );
        if (!cancel) setArticle(mapApiArticleToClient(a));

        const { data: l } = await axios.get<{ items: LiteArticle[] }>(
          `/api/articles`,
          { params: { perPage: 4 }, cancelToken: source.token }
        );
        if (!cancel) setLatest(mapLatest(l.items || []));

        if (a?.categorySlug || initialArticle?.categorySlug) {
          const catSlug = a?.categorySlug ?? initialArticle?.categorySlug;
          const { data: r } = await axios.get<{ items: LikeArticle[] }>(
            `/api/articles`,
            {
              params: { perPage: 4, categorySlug: catSlug },
              cancelToken: source.token,
            }
          );
          const items = Array.isArray((r as any).items)
            ? (r.items as LikeArticle[])
            : [];
          const firstOther = items.find((x) => x.id !== a.id) || null;

          if (!cancel) setRelated(mapRelated(firstOther));
        }

        if (!cancel) await fetchComments();
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("axios error:", err);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
      source.cancel("route changed");
    };
  }, [id, fetchComments, initialArticle?.categorySlug]);

  const A = article;
  return (
    <SessionProvider>
      <main className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-6">
        <Breadcrumb
          items={[
            { label: "مای پراپ", href: "/" },
            { label: "مقالات", href: "/" },
            { label: A?.category || "—", href: "/" },
            { label: A?.title || "..." },
          ]}
        />

        {/* Layout: ستون‌ها روی موبایل یکی می‌شوند */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* ستون مقاله */}
          <section className="lg:col-span-9 space-y-8">
            <div>
              <HeroCard
                title={A?.title}
                subject={A?.subject}
                introduction={A?.Introduction}
                thumbnail={A?.thumbnail}
                readingPeriod={A ? formatReading(A.readingPeriod) : "—"}
                viewCount={A?.viewCount}
                category={A?.category}
                summery={A?.summery}
              />

              <ArticleBody
                mainText={A?.mainText}
                quotes={A?.quotes}
                secondryText={A?.secondryText}
              />

              <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 my-6">
                <Thumbnaill
                  thumbnail={A?.thumbnail}
                  category={A?.category}
                  className="w-full md:w-72 h-44 md:h-40"
                />
                <InlineNextCard
                  author={A?.author}
                  createdAt={A?.createdAt}
                  subject={A?.subject}
                  readingPeriod={A ? formatReading(A.readingPeriod) : "—"}
                />
              </div>
            </div>
          </section>

          {/* محبوب‌ترین مقالات: روی موبایل زیر مقاله، روی دسکتاپ ستون راست */}
          <aside className="lg:col-span-3 order-last lg:order-none space-y-6">
            <SidebarLatest
              posts={latest.map((p) => ({
                ...p,
                readingPeriod: formatReading(p.readingPeriod) as unknown as any,
              }))}
            />
          </aside>
        </div>

        <div>
          <CommentsBlock
            comments={comments}
            articleId={A?.id}
            loading={commentsLoading}
            onSubmitted={fetchComments}
          />
          <RelatedArticles
            post={
              related
                ? {
                    ...related,
                    readingPeriod: formatReading(
                      related.readingPeriod
                    ) as unknown as any,
                  }
                : null
            }
          />
        </div>

        <AdminEditButton articleId={A?.id} />

        <Divider />
      </main>
    </SessionProvider>
  );
}

// —— مپ‌پرهای کوچک —— //
function mapApiArticleToClient(a: any): ArticleDetailDTO {
  return {
    id: a.id,
    title: a.title ?? "",
    subject: a.subject ?? "",
    category: a.category?.name ?? a.category ?? "",
    categorySlug: a.category?.slug ?? a.categorySlug ?? null,

    readingPeriod: Number(a.readingPeriod ?? 0),
    viewCount: Number(a.viewCount ?? 0),

    // تصاویر و متن‌ها
    thumbnail: a.thumbnail ?? null,
    Introduction: a.introduction ?? a.Introduction ?? null,
    quotes: a.quotes ?? null,
    mainText: a.mainText ?? "",
    // 👇 این مهمه: secondaryText ← secondryText
    secondryText: a.secondryText ?? a.secondaryText ?? "",

    // نویسنده
    author: a.author
      ? {
          id: a.author.id,
          firstName: a.author.firstName ?? "",
          lastName: a.author.lastName ?? "",
        }
      : { id: "", firstName: "", lastName: "" },

    createdAt: a.createdAt ?? "",
    // 👇 summery ← summery
    summery: Array.isArray(a.summery)
      ? a.summery
      : Array.isArray(a.summery)
      ? a.summery
      : [],
  };
}

function mapLatest(items: LiteArticle[]): LiteArticle[] {
  return items.map((x) => ({
    ...x,
    readingPeriod: Number(x.readingPeriod || 0),
  }));
}

function mapRelated(item: LikeArticle | null): LikeArticle | null {
  if (!item) return null;
  return { ...item, readingPeriod: Number(item.readingPeriod || 0) };
}

function formatReading(minutes?: number) {
  if (typeof minutes !== "number") return "—";
  return `${minutes} دقیقه`;
}

// —— UI (ریسپانسیو شده) —— //

function Divider() {
  return (
    <div className="w-full h-0.5 bg-gray-200 relative my-16 sm:my-20">
      <div className="absolute right-0 top-0 h-0.5 bg-emerald-400 w-1/2 sm:w-1/3"></div>
    </div>
  );
}

type HeroCardProps = {
  title?: string;
  subject?: string;
  introduction?: string | null;
  quotes?: string | null;
  thumbnail?: string | null;
  readingPeriod?: string; // UI قبلی
  viewCount?: number;
  category?: string | null;
  summery?: string[];
};

function HeroCard({
  title,
  introduction,
  thumbnail,
  viewCount,
  readingPeriod,
  subject,
  category,
  summery,
}: HeroCardProps) {
  const items = (
    summery && summery.length ? summery : ["چکیده ۱", "چکیده ۲", "چکیده ۳"]
  ).map((t, i) => ({
    id: i + 1,
    text: t,
  }));

  return (
    <article className="overflow-hidden">
      {title ? (
        <h3 className="mt-2 sm:mt-3 text-base sm:text-lg font-medium leading-8 sm:leading-9 text-slate-900">
          {title}
        </h3>
      ) : null}

      <h1 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold leading-8 sm:leading-9 text-slate-900">
        {subject || "—"}
      </h1>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 my-3 text-xs sm:text-sm text-[#2E3232]">
          <Image src="/svg/time.svg" alt="time" width={24} height={24} />
          <span>{readingPeriod || "—"}</span>
          <span className="hidden sm:inline">,</span>
          <Image src="/svg/eye.svg" alt="views" width={18} height={14} />
          <span>{(viewCount ?? 0).toLocaleString("fa-IR")} بازدید</span>
        </div>

        <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-xl overflow-hidden">
          <Thumbnail thumbnail={thumbnail} category={category ?? "—"} />
        </div>
      </div>

      {introduction ? (
        <div className="my-6">
          <p className="mt-3 text-[#4A5054] text-base sm:text-lg leading-7">
            {introduction}
          </p>
        </div>
      ) : null}

      <SummeryDropdown title="خلاصه آنچه در مقاله می‌خوانیم" items={items} />
    </article>
  );
}

type ThumbnailProps = {
  thumbnail?: string | null;
  category?: string | null;
  className?: string;
};

function Thumbnail({ thumbnail, category, className }: ThumbnailProps) {
  const src = thumbnail && thumbnail.trim().length ? thumbnail : "/image/a.png";

  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      <Image src={src} alt="cover" fill className="object-cover" />
      <Image
        src="/svg/Rectangle3.svg"
        alt="cover"
        width={146}
        height={47}
        className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10 text-white text-xs px-3 py-1.5 rounded-sm"
      />
      <span className="absolute bottom-4 right-12 z-10 text-xs sm:text-base font-semibold">
        {category || "—"}
      </span>
    </div>
  );
}

function ArticleBody({
  quotes,
  mainText,
  secondryText,
}: {
  quotes?: string | null;
  mainText?: string | null;
  secondryText?: string | null;
}) {
  return (
    <div className="bg-white space-y-6 leading-8 text-base sm:text-lg text-slate-700">
      <p className="my-6 whitespace-pre-line">{mainText || ""}</p>

      {quotes ? (
        <div className="border border-[#EBEBEB] rounded-md px-4 sm:px-6 ">
          <Image
            src="/svg/Frame.svg"
            alt="cover"
            width={33}
            height={33}
            className="my-3 sm:my-5 w-6 h-6 sm:w-8 sm:h-8"
          />
          <p className="mx-2 sm:mx-4 text-base sm:text-lg font-bold text-[#1C2121]">
            {quotes}
          </p>
          <Image
            src="/svg/Frame.svg"
            alt="cover"
            width={33}
            height={33}
            className="block my-3 sm:my-5 mr-auto rotate-180 w-6 h-6 sm:w-8 sm:h-8"
          />
        </div>
      ) : null}

      <p className="mt-6 sm:mt-10 whitespace-pre-line">{secondryText || ""}</p>
    </div>
  );
}

type InlineNextCardProps = {
  author?: Author | null;
  createdAt?: string | null;
  subject?: string | null;
  readingPeriod?: string | null;
};

function InlineNextCard({
  author,
  createdAt,
  subject,
  readingPeriod,
}: InlineNextCardProps) {
  const fullName = author ? `${author.firstName} ${author.lastName}` : "—";
  return (
    <div className="flex-1 w-full rounded-md border border-[#E4E4E4] p-4 sm:p-5">
      <div className="flex items-center text-[#3B3F3F] mb-3 sm:mb-5 ">
        <Image
          src="/image/author.png"
          alt="next"
          width={34}
          height={34}
          className="object-cover rounded-full ml-3"
        />
        <span className="text-xs font-medium ">نوشته شده توسط </span>
        <span className="text-xs font-medium ml-1">{fullName}</span>
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate mb-2 sm:mb-4">
          {subject} {" "}
        </h4>

        <div className="flex flex-wrap gap-2 sm:gap-4">
          <div className="mt-1 text-xs rounded-sm font-medium text-black bg-[#E4E4E43B] h-8 px-2 flex items-center gap-2">
            <Image src="/svg/time.svg" alt="time" width={14} height={14} />
            <span className="whitespace-nowrap">{readingPeriod} </span>
          </div>

          <div className="mt-1 text-xs rounded-sm font-medium text-black bg-[#E4E4E43B] h-8 px-2 flex items-center gap-2">
            <Image src="/svg/calender.svg" alt="time" width={14} height={14} />
            <span className="whitespace-nowrap">
              {createdAt ? timeAgoFa(createdAt) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Thumbnaill({ thumbnail, category, className }: ThumbnailProps) {
  const src = thumbnail && thumbnail.trim().length ? thumbnail : "/image/a.png";

  return (
    <div className={`relative rounded-xl overflow-hidden ${className ?? "w-full h-44"}`}>
      <Image src={src} alt="cover" fill className="object-cover" />
      <Image
        src="/svg/Rectangle3.svg"
        alt="badge"
        width={92}
        height={30}
        className="absolute bottom-2 right-2 pointer-events-none"
      />
      <span className="absolute bottom-3.5 right-5 z-10 text-xs font-semibold">
        {category || "—"}
      </span>
    </div>
  );
}

function CommentsBlock({
  comments,
  articleId,
  loading,
  onSubmitted,
}: {
  comments: CommentWithReplies[];
  articleId: string | undefined;
  loading: boolean;
  onSubmitted: () => void;
}) {
  return (
    <div className="rounded-md bg-white border border-slate-200 p-4 sm:p-6 md:p-8 mt-10">
      <section>
        <div className="flex items-center gap-2 sm:gap-3">
          <Image src="/svg/Rectangle2.svg" alt="thumb" width={6} height={31} />
          <Image src="/svg/comment.svg" alt="thumb" width={20} height={20} />
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
            نظرات کاربران
          </h3>
        </div>

        <AddComment articleId={articleId} onSubmitted={onSubmitted} />
      </section>

      {loading ? (
        <div className="mt-6 text-sm text-slate-500">در حال بارگیری نظرات…</div>
      ) : (
        <div className="mt-6 space-y-5">
          {comments.map((c) => (
            <CommentItem key={c.id} c={c} onSubmitted={onSubmitted} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  c,
  onSubmitted,
}: {
  c: CommentWithReplies;
  onSubmitted: () => void;
}) {
  const authorName =
    [c.user?.firstName, c.user?.lastName].filter(Boolean).join(" ") || "—";
  const when = c.createdAt ? timeAgoFa(c.createdAt) : "—";

  return (
    <article className="rounded-2xl border border-slate-200 p-4 shadow-xs bg-[#FBFBFB]">
      <div className="gap-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex gap-3 items-center">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-slate-200 bg-slate-100">
              <Image
                src={"/image/guy2.png"}
                alt={authorName}
                width={46}
                height={46}
                className="object-cover"
              />
            </div>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm">
              <span className="font-semibold text-base text-slate-900">
                {authorName}
              </span>
              <span className="hidden sm:inline text-slate-400">,</span>
              <Image
                src={"/svg/CalendarM.svg"}
                alt="date"
                width={20}
                height={20}
                className="object-cover rounded-sm"
              />
              <span className="text-[#1C2121] text-sm font-medium">{when}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="w-10 h-10 rounded-md flex justify-center items-center hover:bg-slate-100">
              <Image src={"/svg/dislike.svg"} alt="dislike" width={18} height={17} />
            </button>
            <button className="w-10 h-10 rounded-md bg-[#E8FAF6] flex justify-center items-center">
              <Image src={"/svg/like.svg"} alt="like" width={18} height={17} />
            </button>
            <button
              onClick={async () => {
                try {
                  await axios.post(`/api/comments/${c.id}/replies`, {
                    userId: c.user.id,
                    text: "این یک پاسخ تستی است",
                  });
                  onSubmitted();
                } catch (e) {
                  console.error("خطا در ثبت ریپلای:", e);
                }
              }}
              className="h-10 px-4 rounded-md flex justify-center items-center bg-[#E8FAF6]"
            >
              <span className="text-[#19CCA7] text-sm sm:text-base">پاسخ</span>
              <Image src={"/svg/reply.svg"} alt="reply" width={18} height={17} className="ml-1" />
            </button>
          </div>
        </div>

        <p className="mt-3 text-[16px] sm:text-[18px] font-semibold leading-7 text-[#3B3F3F]">
          {c.text}
        </p>

        {c.replies && c.replies.length > 0 ? (
          <div className="mt-3">
            <RepliesAccordion
              commentId={c.id}
              defaultOpen={false}
              className="mt-2"
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function RelatedArticles({ post }: { post: LikeArticle | null }) {
  if (!post) return null;
  return (
    <section className="mt-14">
      <div className="flex items-center mb-6 gap-3 sm:gap-4 ">
        <Image src="/svg/Rectangle2.svg" alt="thumb" width={6} height={31} />
        <h3 className="font-bold text-xl sm:text-2xl text-[#2E3232] whitespace-nowrap mt-1 sm:mt-2">
          مقالات مشابه
        </h3>
      </div>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 w-full">
          <Thumbnaill
            thumbnail={post.thumbnail}
            category={post.category}
            className="w-full md:w-72 h-44 md:h-40"
          />
          <InlineNextCard
            author={post.author}
            createdAt={post.createdAt}
            subject={post.subject}
            readingPeriod={formatReading(post.readingPeriod)}
          />
        </div>
      </div>
    </section>
  );
}

function AdminEditButton({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const { data: session, status } = useSession() as any;

  const role = session?.user?.role; // فرض: role در session هست

  if (status !== "authenticated" || role !== "admin" || !articleId) return null;

  return (
    <div className="mt-10 flex justify-end">
      <button
        onClick={() =>
          router.push(
            `/article/editor/new-article/${encodeURIComponent(articleId)}`
          )
        }
        className="px-4 sm:px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
      >
        ویرایش این مقاله
      </button>
    </div>
  );
}

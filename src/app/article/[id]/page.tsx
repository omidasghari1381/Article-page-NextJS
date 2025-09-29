"use client";

import Breadcrumb from "@/components/Breadcrumb";
import RepliesAccordion from "@/components/reply";
import SummaryDropdown from "@/components/summery";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { timeAgoFa } from "@/app/utils/date";
import AddComment from "@/components/AddComment";
import { SessionProvider } from "next-auth/react";
import SidebarLatest from "@/components/SidebarLatest";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  author: { id: string; firstName: string; lastName: string };
  createdAt: string;
  summery: string[];
};

type LiteArticle = {
  id: string;
  title: string;
  createdAt: string;
  category: string;
  author: { id: string; firstName: string; lastName: string };
  thumbnail: string | null;
  readingPeriod: string;
};

type LikeArticle = {
  id: string;
  subject: string;
  createdAt: string;
  readingPeriod: string;
  author: { id: string; firstName: string; lastName: string };
  category: string;
  thumbnail: string | null;
};

type Author = { id: string; firstName: string; lastName: string };

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

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [latest, setLatest] = useState<LiteArticle[]>([]);
  const [related, setRelated] = useState<LikeArticle | null>(null);
  const [loading, setLoading] = useState(true);

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

        const { data: a } = await axios.get<ArticleDetail>(
          `/api/articles/${encodeURIComponent(id)}`,
          { cancelToken: source.token }
        );
        if (!cancel) setArticle(a);

        const { data: l } = await axios.get<{ items: LiteArticle[] }>(
          `/api/articles`,
          { params: { perPage: 4 }, cancelToken: source.token }
        );
        if (!cancel) setLatest(l.items || []);

        if (a?.category) {
          const { data: r } = await axios.get<{ items: LikeArticle[] }>(
            `/api/articles`,
            {
              params: { perPage: 4, category: a.category },
              cancelToken: source.token,
            }
          );
          const items = Array.isArray((r as any).items)
            ? (r.items as LikeArticle[])
            : [];
          const firstOther = items.find((x) => x.id !== a.id) || null;

          if (!cancel) setRelated(firstOther);
        }

        if (!cancel) await fetchComments();
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("axios error:", err);
        }
      } finally {
        if (!cancel) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancel = true;
      source.cancel("route changed");
    };
  }, [id, fetchComments]);

  const A = article;

  return (
    <SessionProvider>
      <main className="px-7 sm:px-6 lg:px- py-6 mx-auto ">
        <Breadcrumb
          items={[
            { label: "مای پراپ", href: "/" },
            { label: "مقالات", href: "/" },
            { label: A?.category || "—", href: "/" },
            { label: A?.title || "..." },
          ]}
        />

        <div className="hidden lg:grid lg:grid-cols-13 gap-2 mt-6">
          <section className="lg:col-span-9 space-y-8">
            <div>
              <HeroCard
                title={A?.title}
                subject={A?.subject}
                introduction={A?.Introduction}
                thumbnail={A?.thumbnail}
                readingPeriod={A?.readingPeriod}
                viewCount={A?.viewCount}
                category={A?.category}
                summery={A?.summery}
              />

              <ArticleBody
                mainText={A?.mainText}
                quotes={A?.quotes}
                secondryText={A?.secondryText}
              />

              <div className="flex items-start gap-4 my-6">
                <Thumbnaill thumbnail={A?.thumbnail} category={A?.category} />
                <InlineNextCard
                  author={A?.author}
                  createdAt={A?.createdAt}
                  subject={A?.subject}
                  readingPeriod={A?.readingPeriod}
                />
              </div>
            </div>
          </section>

          <aside className="lg:col-span-3 space-y-9 ">
            <SidebarLatest posts={latest} />
          </aside>
        </div>

        <div>
          <CommentsBlock
            comments={comments}
            articleId={A?.id}
            loading={commentsLoading}
            onSubmitted={fetchComments}
          />
          <RelatedArticles post={related} />
        </div>
        <AdminEditButton articleId={A?.id} />

        <Divider />
      </main>
    </SessionProvider>
  );
}

// —————————————————————————————————————————
// Components
// —————————————————————————————————————————

function Divider() {
  return (
    <div className="w-full h-0.5 bg-gray-200 relative my-20">
      <div className="absolute right-0 top-0 h-0.5 bg-emerald-400 w-1/3"></div>
    </div>
  );
}

type HeroCardProps = {
  title?: string;
  subject?: string;
  introduction?: string | null;
  quotes?: string | null;
  thumbnail?: string | null;
  readingPeriod?: string;
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
  ).map((t, i) => ({ id: i + 1, text: t }));

  return (
    <article className="overflow-hidden">
      {title ? (
        <h3 className="my-3 text-base font-medium leading-9 text-slate-900">
          {title}
        </h3>
      ) : null}

      <h1 className="my-3 text-2xl font-bold leading-9 text-slate-900">
        {subject || "—"}
      </h1>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-3 my-3 text-xs text-[#2E3232]">
          <Image src="/svg/time.svg" alt="time" width={24} height={24} />
          <span>{readingPeriod || "—"}</span>
          <span>,</span>
          <Image src="/svg/eye.svg" alt="views" width={18} height={14} />
          <span>{(viewCount ?? 0).toLocaleString("fa-IR")} بازدید</span>
        </div>

        <div className="relative h-72 sm:h-96">
          <Thumbnail thumbnail={thumbnail} category={category ?? "—"} />
        </div>
      </div>

      {introduction ? (
        <div className="my-6">
          <p className="mt-3 text-[#4A5054] text-lg leading-7">
            {introduction}
          </p>
        </div>
      ) : null}

      <SummaryDropdown title="خلاصه آنچه در مقاله می‌خوانیم" items={items} />
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
    <div className={`relative h-72 sm:h-96 ${className ?? ""}`}>
      <Image src={src} alt="cover" fill className="object-cover rounded-xl" />
      <Image
        src="/svg/Rectangle3.svg"
        alt="cover"
        width={145.64}
        height={46.74}
        className="absolute bottom-4 right-4 z-10 text-white text-xs px-3 py-1.5 rounded-sm"
      />
      <span className="absolute bottom-[30px] right-11 z-10 text-base font-semibold">
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
    <div className=" bg-white  space-y-6 leading-8 text-lg text-slate-700">
      <p className="my-6">{mainText || ""}</p>

      {quotes ? (
        <div className="border border-[#EBEBEB] px-6 ">
          <Image
            src="/svg/Frame.svg"
            alt="cover"
            width={32.57}
            height={32.57}
            className="my-5"
          />
          <p className="mx-4 text-lg font-bold text-[#1C2121]">{quotes}</p>
          <Image
            src="/svg/Frame.svg"
            alt="cover"
            width={32.57}
            height={32.57}
            className="block my-5 mr-auto rotate-180"
          />
        </div>
      ) : null}

      <p className="mt-10">{secondryText || ""}</p>
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
    <div className="flex-1 w-[555.1796264648438px] rounded-sm h-[163.46401977539062px] border border-[#E4E4E4] px-5 ">
      <div className="flex items-center text-[#3B3F3F] my-5 ">
        <Image
          src="/image/author.png"
          alt="next"
          width={33.36}
          height={33.36}
          className="object-cover rounded-full ml-3"
        />
        <span className="text-xs font-medium ">نوشته شده توسط </span>
        <span className="text-xs font-medium">{fullName}</span>
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-slate-900 text-base truncate my-4">
          {subject}{" "}
        </h4>

        <div className="flex gap-4">
          <div className="mt-1 text-xs rounded-sm font-medium text-black  bg-[#E4E4E43B] w-[97.59px] h-[32.24px] flex items-center gap-2 my-4 px-2">
            <Image
              src="/svg/time.svg"
              alt="time"
              width={14.38}
              height={14.38}
            />
            <span className="whitespace-nowrap">{readingPeriod} </span>
          </div>

          <div className="mt-1 text-xs rounded-sm font-medium text-black  bg-[#E4E4E43B] w-[97.59px] h-[32.24px] flex items-center gap-2 my-4 px-2">
            <Image
              src="/svg/calender.svg"
              alt="time"
              width={14.38}
              height={14.38}
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

function Thumbnaill({ thumbnail, category, className }: ThumbnailProps) {
  const src = thumbnail && thumbnail.trim().length ? thumbnail : "/image/a.png";

  return (
    <div
      className={
        "relative h-[163.5px] w-[291.14px] shrink-0 " + (className ?? "")
      }
    >
      <Image src={src} alt="cover" fill className="object-cover rounded-xl" />
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
    <div className="rounded-sm bg-white border border-slate-200 p-5 sm:p-8 ">
      <section>
        <div className="flex items-center gap-3">
          <Image
            src="/svg/Rectangle2.svg"
            alt="thumb"
            width={5.73}
            height={31.11}
          />
          <Image
            src="/svg/comment.svg"
            alt="thumb"
            width={20.36}
            height={20.36}
          />
          <h3 className="font-extrabold text-lg text-slate-900">
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
      <div className=" gap-3">
        <div className="flex justify-between items-center ">
          <div className="flex gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-slate-200 bg-slate-100">
              <Image
                src={"/image/guy2.png"}
                alt={authorName}
                width={45.58}
                height={45.58}
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-base text-slate-900">
                {authorName}
              </span>
              <span className="text-slate-400">,</span>
              <Image
                src={"/svg/CalendarM.svg"}
                alt="date"
                width={20.36}
                height={20.36}
                className="object-cover rounded-sm"
              />
              <span className="text-[#1C2121] text-sm font-medium">{when}</span>
            </div>
          </div>
          <div className=" flex justify-between items-center gap-3">
            <button className="w-[42.67px] h-[42.67px] rounded-md flex justify-center items-center">
              <Image
                src={"/svg/dislike.svg"}
                alt="dislike"
                width={18.13}
                height={17.07}
                className="object-cover rounded-sm"
              />
            </button>
            <button className="w-[42.67px] h-[42.67px] rounded-md bg-[#E8FAF6] flex justify-center items-center">
              <Image
                src={"/svg/like.svg"}
                alt="like"
                width={18.13}
                height={17.07}
                className="object-cover rounded-sm"
              />
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
              className="h-[42.67px] w-[84.27px] rounded-md flex justify-center items-center bg-[#E8FAF6]"
            >
              <span className="text-[#19CCA7] text-base">پاسخ</span>
              <Image
                src={"/svg/reply.svg"}
                alt="reply"
                width={18.13}
                height={17.07}
                className="object-cover rounded-sm"
              />
            </button>
          </div>
        </div>

        <p className="mt-1 text-[18px] font-semibold leading-7  text-[#3B3F3F]">
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
      <div className="flex items-center mb-6 gap-4 ">
        <Image
          src="/svg/Rectangle2.svg"
          alt="thumb"
          width={5.73}
          height={31.11}
        />
        <h3 className="font-bold text-2xl text-[#2E3232] whitespace-nowrap mt-2">
          مقالات مشابه
        </h3>
      </div>
      <div className="space-y-6">
        <div className="flex items-start gap-4 w-[864px]">
          <Thumbnaill thumbnail={post.thumbnail} category={post.category} />
          <InlineNextCard
            author={post.author}
            createdAt={post.createdAt}
            subject={post.subject}
            readingPeriod={post.readingPeriod}
          />
        </div>
      </div>
    </section>
  );
}

function AdminEditButton({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // فرض: نقش داخل session.user.role آمده است
  const role = (session?.user as any)?.role;

  if (status !== "authenticated" || role !== "admin" || !articleId) return null;

  return (
    <div className="mt-10 flex justify-end">
      <button
        onClick={() =>
          router.push(
            `/article/editor/new-article/${encodeURIComponent(articleId)}`
          )
        }
        className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
      >
        ویرایش این مقاله
      </button>
    </div>
  );
}

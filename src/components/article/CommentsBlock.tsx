"use client";
import Image from "next/image";
import axios from "axios";
import { useCallback, useState } from "react";
import { timeAgoFa } from "@/app/utils/date";
import AddComment from "@/components/AddComment";
import RepliesAccordion from "@/components/reply";
import { SessionProvider } from "next-auth/react";

type Author = { id: string; firstName: string; lastName: string };

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

export default function CommentsBlock({
  initialComments,
  articleId,
  initialTotal,
}: {
  initialComments: CommentWithReplies[];
  articleId: string;
  initialTotal: number;
}) {
  return (
    <SessionProvider>
      <CommentsInner
        initialComments={initialComments}
        articleId={articleId}
        initialTotal={initialTotal}
      />
    </SessionProvider>
  );
}

function CommentsInner({
  initialComments,
  articleId,
  initialTotal, 
}: {
  initialComments: CommentWithReplies[];
  articleId: string;
  initialTotal: number;
}) {
  const [comments, setComments] = useState<CommentWithReplies[]>(initialComments);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/articles/${encodeURIComponent(articleId)}/comments`,
        { params: { skip: 0, take: 10, withReplies: 1 } }
      );
      setComments(data?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  return (
    <div className="rounded-sm bg-white border border-slate-200 p-4 sm:p-6 md:p-8">
      <section>
        <div className="flex items-center gap-3">
          <Image src="/svg/Rectangle2.svg" alt="thumb" width={6} height={32} />
          <Image src="/svg/comment.svg" alt="thumb" width={21} height={21} />
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900">نظرات کاربران</h3>
        </div>

        <AddComment articleId={articleId} onSubmitted={fetchComments} />
      </section>

      {loading ? (
        <div className="mt-6 text-sm text-slate-500">در حال بارگیری نظرات…</div>
      ) : (
        <div className="mt-6 space-y-4 md:space-y-5">
          {comments.map((c) => (
            <CommentItem key={c.id} c={c} onSubmitted={fetchComments} />
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
    <article className="rounded-2xl border border-slate-200 p-3 sm:p-4 md:p-5 shadow-xs bg-[#FBFBFB]" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-1 ring-slate-200 bg-slate-100 shrink-0">
            <Image
              src={"/image/guy2.png"}
              alt={authorName}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-[13px] sm:text-sm text-[#1C2121] min-w-0">
            <span className="font-semibold text-[15px] sm:text-base truncate text-slate-900">
              {authorName}
            </span>
            <span className="hidden sm:inline text-slate-400">,</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Image src={"/svg/CalendarM.svg"} alt="date" width={20} height={20} className="object-cover rounded-sm" />
              <span className="text-xs sm:text-sm font-medium">{when}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mt-1 md:mt-0">
          <button
            className="w-10 h-10 sm:w-[42.67px] sm:h-[42.67px] rounded-md flex justify-center items-center active:scale-95 transition"
            aria-label="dislike"
          >
            <Image src={"/svg/dislike.svg"} alt="dislike" width={18} height={17} />
          </button>
          <button
            className="w-10 h-10 sm:w-[42.67px] sm:h-[42.67px] rounded-md bg-[#E8FAF6] flex justify-center items-center active:scale-95 transition"
            aria-label="like"
          >
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
            className="h-10 sm:h-[42.67px] px-3 sm:w-[84.27px] rounded-md flex justify-center items-center bg-[#E8FAF6] gap-1.5 active:scale-95 transition"
          >
            <span className="hidden md:inline text-[#19CCA7] text-base">پاسخ</span>
            <Image src={"/svg/reply.svg"} alt="reply" width={18} height={17} />
          </button>
        </div>
      </div>

      <p className="mt-3 text-[15px] sm:text-[17px] md:text-[18px] font-semibold leading-7 text-[#3B3F3F] break-words">
        {c.text}
      </p>

      {c.replies?.length ? (
        <div className="mt-3">
          <RepliesAccordion commentId={c.id} defaultOpen={false} className="mt-2" />
        </div>
      ) : null}
    </article>
  );
}

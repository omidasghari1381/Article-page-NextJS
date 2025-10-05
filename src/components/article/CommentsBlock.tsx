"use client";

import Image from "next/image";
import axios from "axios";
import { useCallback, useState } from "react";
import { timeAgoFa } from "@/app/utils/date";
import AddComment from "@/components/AddComment";
import RepliesAccordion from "@/components/reply";
import { SessionProvider } from "next-auth/react";

/* ---------- Types ---------- */
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

/* ---------- Public wrapper (with local SessionProvider) ---------- */
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

/* ---------- Inner client component (original logic) ---------- */
function CommentsInner({
  initialComments,
  articleId,
  initialTotal, // اگر بعداً لازم شد (pagination/نمایش تعداد)، آماده‌ست
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
    <div className="rounded-sm bg-white border border-slate-200 p-5 sm:p-8 ">
      <section>
        <div className="flex items-center gap-3">
          <Image src="/svg/Rectangle2.svg" alt="thumb" width={5.73} height={31.11} />
          <Image src="/svg/comment.svg" alt="thumb" width={20.36} height={20.36} />
          <h3 className="font-extrabold text-lg text-slate-900">نظرات کاربران</h3>
        </div>

        <AddComment articleId={articleId} onSubmitted={fetchComments} />
      </section>

      {loading ? (
        <div className="mt-6 text-sm text-slate-500">در حال بارگیری نظرات…</div>
      ) : (
        <div className="mt-6 space-y-5">
          {comments.map((c) => (
            <CommentItem key={c.id} c={c} onSubmitted={fetchComments} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Item ---------- */
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
          <div className="flex justify-between items-center gap-3">
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

        <p className="mt-1 text-[18px] font-semibold leading-7 text-[#3B3F3F]">
          {c.text}
        </p>

        {c.replies?.length ? (
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

"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";

type AddCommentProps = {
  articleId?: string;
  onSubmitted?: () => void;
};

export default function AddComment({
  articleId,
  onSubmitted,
}: AddCommentProps) {
  const { data: session, status } = useSession();
  const isAuth = status === "authenticated";
  const userId = (session?.user as any)?.id as string | undefined;
  const accessToken = (session as any)?.accessToken as string | undefined;

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!articleId) return;
    if (!text.trim()) return;
    if (!isAuth || !userId) return alert("ابتدا وارد شوید!");

    try {
      setLoading(true);
      await axios.post(
        `/api/articles/${encodeURIComponent(articleId)}/comments`,
        { text, userId },
        {}
      );

      setText("");
      onSubmitted?.();
    } catch (err) {
      console.error("خطا در ارسال کامنت:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="border bg-[#F5F5F5] h-[69.8px] w-full border-[#DADADA] my-9 px-4 flex justify-between items-center rounded-lg">
        <span className="text-sm font-medium text-[#171717]">
          برای ثبت نظر خود وارد شوید.
        </span>
        <button
          onClick={() => signIn()}
          className="bg-[#19CCA7] text-white flex items-center justify-center w-[137px] h-[51px] rounded-md gap-1 text-sm"
        >
          ورود و ثبت نام
          <Image src="/svg/userWrite.svg" alt="thumb" width={20} height={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="border bg-[#F5F5F5] w-full border-[#DADADA] my-9 p-4 flex flex-col gap-3 rounded-lg text-black">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="نظر خود را بنویسید..."
        className="w-full h-18 sm:h-28 p-2 rounded-md border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#19CCA7]"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim() || !articleId}
          className="bg-[#19CCA7] text-white px-6 py-2 rounded-md text-sm disabled:opacity-50  hover:cursor-pointer"
        >
          {loading ? "در حال ارسال..." : "ارسال نظر"}
        </button>
      </div>
    </div>
  );
}

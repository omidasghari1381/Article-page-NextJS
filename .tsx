"use client";

import { SessionProvider } from "next-auth/react";
// ... بقیه importها همون قبلی

export default function CommentsBlock({
  initialComments,
  articleId,
  initialTotal,
}: {
  initialComments: CommentWithReplies[];
  articleId: string;
  initialTotal: number;
}) {
  // ⬇️ فقط این یک لایه اضافه شد
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

// بقیه‌ی لاجیک قبلیت رو به یک کامپوننت داخلی منتقل کن:
function CommentsInner({
  initialComments,
  articleId,
  initialTotal,
}: {
  initialComments: CommentWithReplies[];
  articleId: string;
  initialTotal: number;
}) {
  // ... همون state و axios و رندرِ قبلی‌ات
}

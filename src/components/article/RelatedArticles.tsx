// components/article/RelatedArticles.tsx
import Image from "next/image";
import InlineNextCard from "./InlineNextCard";
import { Thumbnaill } from "./Thumbnail";

type Author = { id: string; firstName: string; lastName: string };
type LikeArticle = {
  id: string;
  subject: string;
  createdAt: string;
  readingPeriod: string;
  author: Author;
  category: string;
  thumbnail: string | null;
};

export default function RelatedArticles({ post }: { post: LikeArticle | null }) {
  if (!post) return null;
  return (
    <section className="mt-14">
      <div className="flex items-center mb-6 gap-4 ">
        <Image src="/svg/Rectangle2.svg" alt="thumb" width={5.73} height={31.11} />
        <h3 className="font-bold text-2xl text-[#2E3232] whitespace-nowrap mt-2">مقالات مشابه</h3>
      </div>
      <div className="space-y-6">
        <div className="flex items-start gap-4 w-[864px]">
          <Thumbnaill thumbnail={post.thumbnail} category={post.category} />
          <InlineNextCard author={post.author} createdAt={post.createdAt} subject={post.subject} readingPeriod={post.readingPeriod} />
        </div>
      </div>
    </section>
  );
}

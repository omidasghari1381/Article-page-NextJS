import Image from "next/image";
import InlineNextCard from "./InlineNextCard";
import Thumbnail from "./Thumbnail"; // default

type Author = { id: string; firstName: string; lastName: string };

// مدل‌هایی که ممکنه از API بگیریم:
type CategoryLike =
  | string
  | { name?: string | null; slug?: string | null }
  | null
  | undefined;

type LatestItem = {
  id?: string;
  title?: string;
  createdAt?: string;
  category?: CategoryLike;
  author?: Author;
  thumbnail?: string | null;
  readingPeriod?: number | string | null;
};

type LikeArticle = {
  id: string;
  subject?: string | null;
  createdAt: string;
  readingPeriod?: number | string | null;
  author: Author;
  category?: CategoryLike;
  thumbnail: string | null;
};

function getCategoryName(c?: CategoryLike, fallback?: string) {
  if (!c && fallback) return fallback;
  if (typeof c === "string") return c;
  if (c && typeof c === "object") return c.name ?? fallback ?? "";
  return fallback ?? "";
}

export default function RelatedArticles({
  post,
  fallbackCategory,
}: {
  post: LikeArticle | LatestItem | null;
  fallbackCategory?: string; // ← از بیرون هم می‌تونیم بدیم
}) {
  if (!post) return null;

  // نرمال‌سازی
  const subject =
    (post as LikeArticle).subject ??
    (post as LatestItem).title ??
    "—";

  const createdAt =
    (post as LikeArticle).createdAt ??
    (post as LatestItem).createdAt ??
    "";

  const author =
    (post as LikeArticle).author ??
    (post as LatestItem).author ??
    undefined;

  const categoryName = getCategoryName(
    (post as LikeArticle).category ?? (post as LatestItem).category,
    fallbackCategory
  );

  const thumbnail =
    (post as LikeArticle).thumbnail ??
    (post as LatestItem).thumbnail ??
    null;

  const readingPeriod =
    (post as LikeArticle).readingPeriod ??
    (post as LatestItem).readingPeriod ??
    null;

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
        <div className="flex items-start gap-4 w-full">
          <Thumbnail thumbnail={thumbnail ?? undefined} category={categoryName} />
          <InlineNextCard
            author={author}
            createdAt={createdAt}
            subject={subject}
            readingPeriod={readingPeriod} // خودش فرمت می‌کنه («یک دقیقه»/«N دقیقه»)
          />
        </div>
      </div>
    </section>
  );
}

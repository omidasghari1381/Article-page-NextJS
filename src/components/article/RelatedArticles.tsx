import Image from "next/image";
import InlineNextCard from "./InlineNextCard";
import { SideImage } from "./Thumbnail";

type Author = { id: string; firstName: string; lastName: string };

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
  fallbackCategory?: string;
}) {
  if (!post) return null;

  const subject =
    (post as LikeArticle).subject ?? (post as LatestItem).title ?? "—";
  const createdAt =
    (post as LikeArticle).createdAt ?? (post as LatestItem).createdAt ?? "";
  const author =
    (post as LikeArticle).author ?? (post as LatestItem).author ?? undefined;
  const categoryName = getCategoryName(
    (post as LikeArticle).category ?? (post as LatestItem).category,
    fallbackCategory
  );
  const thumbnail =
    (post as LikeArticle).thumbnail ?? (post as LatestItem).thumbnail ?? null;
  const readingPeriod =
    (post as LikeArticle).readingPeriod ??
    (post as LatestItem).readingPeriod ??
    null;

  return (
    <section className="mt-14">
      <div className="flex items-center mb-6 gap-4">
        <Image
          src="/svg/Rectangle2.svg"
          alt="thumb"
          width={5.73}
          height={31.11}
        />
        <h3 className="font-bold text-2xl text-[#2E3232] whitespace-nowrap mt-2 dark:text-skin-base">
          مقالات مشابه
        </h3>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-stretch w-full">
        <SideImage
          thumbnail={thumbnail ?? undefined}
          category={categoryName}
          mobileAspectClass="aspect-[16/9]"
          desktopSizeClass="lg:aspect-auto lg:h-[163.5px] lg:w-[291.14px]"
          rounded="rounded-xl"
          badgeClass="bottom-2 right-2 sm:bottom-2 sm:right-2"
          categoryTextClass="bottom-2.5 right-4 sm:bottom-2.5 sm:right-4 text-xs"
        />{" "}
        <InlineNextCard
          author={author}
          createdAt={createdAt}
          subject={subject}
          readingPeriod={readingPeriod}
          className="flex-1"
        />
      </div>
    </section>
  );
}

import Image from "next/image";
import { timeAgoFa } from "@/app/utils/date";
import Link from "next/link";

export type ArticleLite = {
  id: string;
  title: string;
  subject: string | null;
  createdAt: string;
  viewCount: number;
  thumbnail: string | null;
  readingPeriod: number;
  author?: { id: string; firstName: string; lastName: string } | null;
  categories?: string | null;
};

const articleHref = (a?: Pick<ArticleLite, "id"> | null) =>
  a?.id ? `/articles/${a.id}` : "#";

export default async function LatestArticle({ items }: { items?: ArticleLite[] }) {
  const data = items ?? [];
  return (
    <section>
      <div className="flex items-center gap-3 py-6">
        <Image src="/svg/Rectangle.svg" alt="thumb" width={8} height={36} />
        <h3 className="text-xl font-semibold text-[#1C2121] dark:text-white">آخرین مقالات</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {data.slice(0, 4).map((item) => (
          <LateArticle key={item.id} item={item} />
        ))}
        {!data.length && (
          <>
            <LateArticlePlaceholder />
            <LateArticlePlaceholder />
            <LateArticlePlaceholder />
            <LateArticlePlaceholder />
          </>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button className="px-6 sm:px-8 h-12 bg-[#19CCA7] rounded-md flex items-center gap-2 text-white">
          <Image src={"/svg/whiteEye.svg"} alt="more" width={24} height={19} />
          <span className="text-base font-medium">مشاهده همه مقالات</span>
        </button>
      </div>
    </section>
  );
}

function LateArticle({ item }: { item: ArticleLite }) {
  const catName = item.categories ?? "—";
  const articleUrl = `/articles/${item.id}`;

  return (
    <Link href={articleUrl} className="block mb-2 hover:opacity-90 transition">
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={item.thumbnail ?? "/image/chart.png"}
          alt={item.title}
          fill
          className="rounded-md object-cover"
          sizes="(max-width: 640px) 100vw, 50vw"
          priority={false}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/svg/arrowLeftBlack.svg"
              alt="badge"
              width={108}
              height={34}
              className="block rounded-sm dark:invert"
              priority
            />
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold dark:text-black">
              {catName}
            </span>
          </div>

          <span className="text-[#373A41] dark:text-skin-muted text-sm sm:text-base font-medium">
            {item.createdAt ? timeAgoFa(item.createdAt) : "—"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* eye.svg تک‌رنگ → mask + bg تا با تم هماهنگ شه */}
          <span
            className="inline-block w-[18px] h-[14px] bg-[#373A41] dark:bg-white
                       [mask:url('/svg/eye.svg')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
            aria-hidden
          />
          <span className="text-sm text-[#373A41] dark:text-skin-muted">
            بازدید {item.viewCount}
          </span>
        </div>
      </div>

      <p className="mt-2 text-base sm:text-lg text-[#121212] dark:text-white font-bold line-clamp-2">
        {item.title}
      </p>
      <p className="text-sm sm:text-base font-normal text-[#121212] dark:text-skin-base mt-3 line-clamp-3">
        {item.subject ?? ""}
      </p>
    </Link>
  );
}

function LateArticlePlaceholder() {
  return (
    <article className="mb-2">
      <div className="relative w-full aspect-[16/9]">
        <Image src="/image/chart.png" alt="thumb" fill className="rounded-md object-cover" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/svg/arrowLeftBlack.svg"
              alt="badge"
              width={108}
              height={34}
              className="block rounded-sm dark:invert"
              priority
            />
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
              —
            </span>
          </div>
          <span className="text-[#373A41] dark:text-skin-muted text-sm sm:text-base font-medium">—</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-block w-[18px] h-[14px] bg-[#373A41] dark:bg-white
                       [mask:url('/svg/eye.svg')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
            aria-hidden
          />
          <span className="text-sm text-[#373A41] dark:text-skin-muted">بازدید 0</span>
        </div>
      </div>

      <p className="mt-2 text-base sm:text-lg text-[#121212] dark:text-white font-bold line-clamp-2">—</p>
      <p className="text-sm sm:text-base font-normal text-[#121212] dark:text-skin-base mt-3 line-clamp-3">—</p>
    </article>
  );
}
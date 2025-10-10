// components/mainPage/LatestArticle.tsx
import Image from "next/image";
import { absolute } from "@/app/utils/base-url";
import { timeAgoFa } from "@/app/utils/date";

// --- Types (هماهنگ با app/page.tsx) ---
type AuthorDTO = { id: string; firstName: string; lastName: string } | null;
type CategoryLite = { id: string; name: string; slug?: string };
type ArticleLite = {
  id: string;
  title: string;
  subject: string | null;
  createdAt: string; // ISO
  viewCount: number;
  thumbnail: string | null;
  readingPeriod: number;
  author?: AuthorDTO;
  categories?: CategoryLite[];
};

// --- SSR fetch (fallback وقتی props ندادیم) ---
async function fetchLatest(): Promise<ArticleLite[]> {
  const res = await fetch(
    absolute("/api/articles?perPage=4&sortBy=createdAt&sortDir=DESC"),
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { items: ArticleLite[]; total?: number };
  return Array.isArray(data.items) ? data.items : [];
}

export default async function LatestArticle({
  items,
}: {
  // اگر از صفحه اصلی چیزی پاس داده نشد، خودش SSR فچ می‌کند
  items?: ArticleLite[];
}) {
  const data = items ?? (await fetchLatest());

  return (
    <section>
      <div className="flex items-center gap-3 py-6">
        <Image src="/svg/Rectangle.svg" alt="thumb" width={8} height={36} />
        <h3 className="text-xl font-semibold text-[#1C2121]">آخرین مقالات</h3>
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
  const catName = item.categories?.[0]?.name ?? "—";
  return (
    <article className="mb-2">
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
              className="block rounded-sm"
              priority
            />
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
              {catName}
            </span>
          </div>
          <span className="text-[#373A41] text-sm sm:text-base font-medium">
            {item.createdAt ? timeAgoFa(item.createdAt) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Image src={"/svg/eye.svg"} alt="views" width={18} height={14} />
          <span className="text-sm text-[#373A41]">بازدید {item.viewCount}</span>
        </div>
      </div>

      <p className="mt-2 text-base sm:text-lg text-[#121212] font-bold line-clamp-2">
        {item.title}
      </p>
      <p className="text-sm sm:text-base font-normal text-[#121212] mt-3 line-clamp-3">
        {item.subject ?? ""}
      </p>
    </article>
  );
}

// Placeholder برای وقتی دیتا تهی است (استایل دست‌نخورده)
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
              className="block rounded-sm"
              priority
            />
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
              — 
            </span>
          </div>
          <span className="text-[#373A41] text-sm sm:text-base font-medium">—</span>
        </div>
        <div className="flex items-center gap-2">
          <Image src={"/svg/eye.svg"} alt="views" width={18} height={14} />
          <span className="text-sm text-[#373A41]">بازدید 0</span>
        </div>
      </div>

      <p className="mt-2 text-base sm:text-lg text-[#121212] font-bold line-clamp-2">—</p>
      <p className="text-sm sm:text-base font-normal text-[#121212] mt-3 line-clamp-3">
        —
      </p>
    </article>
  );
}
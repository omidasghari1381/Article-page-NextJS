// components/mainPage/Educational.tsx
import Image from "next/image";
import { timeAgoFa } from "@/app/utils/date";

export type ArticleLite = {
  id: string;
  title: string;
  subject: string | null;
  createdAt: string; // ISO
  viewCount: number;
  thumbnail: string | null;
  readingPeriod: number;
};

export default function Educational({ items }: { items: ArticleLite[] }) {
  const main = items?.[0] ?? null;
  const rest = (items ?? []).slice(1, 5); // حداکثر ۴ تای بعدی

  return (
    <section>
      <div className="flex items-center gap-3">
        <Image src="/svg/Rectangle.svg" alt="thumb" width={8} height={36} />
        <h3 className="text-xl font-semibold text-[#1C2121]">مقالات آموزشی</h3>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[540px]">
        <div className="relative rounded-md overflow-hidden aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto lg:h-full">
          <button
            className="absolute top-3 right-3 z-10 w-11 h-11 bg-gradient-to-r from-[#111414] to-[#272F2F] flex items-center justify-center rounded-md"
            aria-label="اشتراک‌گذاری"
          >
            <Image src="/svg/share.svg" alt="share" width={26} height={26} />
          </button>

          <Image
            src={main?.thumbnail?.trim() || "/image/a.png"}
            alt={main ? (main.subject || main.title) : "cover"}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />

          <div className="absolute bottom-3 right-3 left-3">
            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-white">
              <div className="flex items-center gap-2">
                <Image src={"/svg/whiteCalender.svg"} alt="date" width={22} height={22} />
                <span>{main ? timeAgoFa(main.createdAt) : "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src={"/svg/whiteEye.svg"} alt="views" width={20} height={16} />
                <span>{main ? `${main.viewCount} بازدید` : "—"}</span>
              </div>
            </div>
            <h1 className="mt-2 text-white font-semibold line-clamp-2">
              {main ? (main.subject || main.title) : "—"}
            </h1>
          </div>
        </div>

        {/* --- چهار کارت کوچک --- */}
        <div className="grid grid-rows-2 gap-6 lg:h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rest.slice(0, 2).map((it) => (
              <SmallCard key={it.id} item={it} />
            ))}
            {/* اگر کمتر از ۲ مورد بود، جای خالی پر نشود */}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rest.slice(2, 4).map((it) => (
              <SmallCard key={it.id} item={it} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SmallCard({ item }: { item: ArticleLite }) {
  const title = item.subject || item.title;
  const cover = item.thumbnail?.trim() || "/image/a.png";

  return (
    <div className="relative rounded-md overflow-hidden h-[220px] lg:h-full">
      <Image src={cover} alt={title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 25vw" />
      <div className="absolute bottom-3 right-3 left-3">
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white">
          <div className="flex items-center gap-2">
            <Image src={"/svg/whiteCalender.svg"} alt="date" width={20} height={20} />
            <span>{timeAgoFa(item.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src={"/svg/whiteEye.svg"} alt="views" width={18} height={14} />
            <span>{item.viewCount} بازدید</span>
          </div>
        </div>
        <h2 className="mt-2 text-white font-semibold line-clamp-2">{title}</h2>
      </div>
    </div>
  );
}

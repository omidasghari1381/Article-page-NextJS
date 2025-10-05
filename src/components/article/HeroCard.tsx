// components/article/HeroCard.tsx
import Image from "next/image";
import SummaryDropdown from "@/components/summery";

type Props = {
  title?: string;
  subject?: string;
  introduction?: string | null;
  quotes?: string | null;
  thumbnail?: string | null;
  readingPeriod?: string;
  viewCount?: number;
  category?: string | null;
  summery?: string[];
};

export default function HeroCard({
  title,
  introduction,
  thumbnail,
  viewCount,
  readingPeriod,
  subject,
  category,
  summery,
}: Props) {
  const items = (summery?.length ? summery : ["چکیده ۱", "چکیده ۲", "چکیده ۳"]).map((t, i) => ({
    id: i + 1,
    text: t,
  }));

  return (
    <article className="overflow-hidden">
      {title ? <h3 className="my-3 text-base font-medium leading-9 text-slate-900">{title}</h3> : null}

      <h1 className="my-3 text-2xl font-bold leading-9 text-slate-900">{subject || "—"}</h1>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-3 my-3 text-xs text-[#2E3232]">
          <Image src="/svg/time.svg" alt="time" width={24} height={24} />
          <span>{readingPeriod || "—"}</span>
          <span>,</span>
          <Image src="/svg/eye.svg" alt="views" width={18} height={14} />
          <span>{(viewCount ?? 0).toLocaleString("fa-IR")} بازدید</span>
        </div>

        <div className="relative h-72 sm:h-96">
          <Thumbnail thumbnail={thumbnail} category={category ?? "—"} />
        </div>
      </div>

      {introduction ? (
        <div className="my-6">
          <p className="mt-3 text-[#4A5054] text-lg leading-7">{introduction}</p>
        </div>
      ) : null}

      <SummaryDropdown title="خلاصه آنچه در مقاله می‌خوانیم" items={items} />
    </article>
  );
}

function Thumbnail({ thumbnail, category }: { thumbnail?: string | null; category?: string | null }) {
  const src = thumbnail?.trim().length ? thumbnail! : "/image/a.png";
  return (
    <div className="relative h-72 sm:h-96">
      <Image src={src} alt="cover" fill className="object-cover rounded-xl" />
      <Image
        src="/svg/Rectangle3.svg"
        alt="cover"
        width={145.64}
        height={46.74}
        className="absolute bottom-4 right-4 z-10 text-white text-xs px-3 py-1.5 rounded-sm"
      />
      <span className="absolute bottom-[30px] right-11 z-10 text-base font-semibold">{category || "—"}</span>
    </div>
  );
}

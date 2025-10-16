// components/article/HeroCard.tsx
import Image from "next/image";
import SummeryDropdown from "../Summery";

type Props = {
  title?: string;
  subject?: string | null;
  introduction?: string | null;
  quotes?: string | null;
  thumbnail?: string | null;
  readingPeriod?: number | string | null;
  viewCount?: number;
  category?: string | null;
  summery?: string[];
};

function formatMinutes(v?: number | string | null) {
  const n = typeof v === "string" ? Number(v) : v ?? 0;
  if (!n || Number.isNaN(n) || n <= 1) return "یک دقیقه";
  const faNum = n.toLocaleString("fa-IR");
  return `${faNum} دقیقه`;
}

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
  const items = (
    summery?.length ? summery : ["چکیده ۱", "چکیده ۲", "چکیده ۳"]
  ).map((t, i) => ({
    id: i + 1,
    text: t,
  }));

  return (
    <article className="overflow-hidden">
      {title ? (
        <h3 className="my-3 text-base font-medium leading-9 text-slate-900">
          {title}
        </h3>
      ) : null}

      <h1 className="my-3 text-2xl font-bold leading-9 text-slate-900">
        {subject || "—"}
      </h1>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-3 my-3 text-xs text-[#2E3232]">
          <Image src="/svg/time.svg" alt="time" width={24} height={24} />
          <span>{formatMinutes(readingPeriod)}</span>
          <span>,</span>
          <Image src="/svg/eye.svg" alt="views" width={18} height={14} />
          <span>{(viewCount ?? 0).toLocaleString("fa-IR")} بازدید</span>
        </div>

        <Thumbnail thumbnail={thumbnail} category={category ?? "—"} />
      </div>

      {introduction ? (
        <div className="my-6">
          <p className="mt-3 text-[#4A5054] text-lg leading-7">
            {introduction}
          </p>
        </div>
      ) : null}

      <SummeryDropdown title="خلاصه آنچه در مقاله می‌خوانیم" items={items} />
    </article>
  );
}

function Thumbnail({
  thumbnail,
  category,
}: {
  thumbnail?: string | null;
  category?: string | null;
}) {
  const src = thumbnail?.trim().length ? thumbnail! : "/image/a.png";

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={src}
          alt="cover"
          fill
          className="object-cover"
          sizes="100vw"
        />

        <Image
          src="/svg/Rectangle3.svg"
          alt=""
          width={146}
          height={47}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 w-[96px] h-[32px] sm:w-[145.64px] sm:h-[46.74px]"
        />
        <span className="absolute bottom-5 right-7 sm:bottom-7 sm:right-11 z-10 text-xs sm:text-base font-semibold ">
          {category || "—"}
        </span>
      </div>
    </div>
  );
}

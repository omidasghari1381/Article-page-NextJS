import Image from "next/image";
import { timeAgoFa } from "@/app/utils/date";

type Author = { id: string; firstName: string; lastName: string };

// تبدیل عدد به متن نمایش
function formatMinutes(v?: number | string | null) {
  const n = typeof v === "string" ? Number(v) : (v ?? 0);
  if (!n || Number.isNaN(n) || n <= 1) return "یک دقیقه";
  return `${n} دقیقه`;
}

export default function InlineNextCard({
  author,
  createdAt,
  subject,
  readingPeriod,
}: {
  author?: Author | null;
  createdAt?: string | null;
  subject?: string | null;
  readingPeriod?: number | string | null; // ← حالا عدد/رشته/نـال
}) {
  const fullName = author ? `${author.firstName} ${author.lastName}` : "—";
  return (
    <div className="w-full max-w-full rounded-sm h-[163.46px] border border-[#E4E4E4] px-5">
      <div className="flex items-center text-[#3B3F3F] my-5 ">
        <Image src="/image/author.png" alt="next" width={33.36} height={33.36} className="object-cover rounded-full ml-3" />
        <span className="text-xs font-medium ">نوشته شده توسط </span>
        <span className="text-xs font-medium ml-1">{fullName}</span>
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-slate-900 text-base truncate my-4">{subject || "—"}</h4>

        <div className="flex gap-4">
          <div className="mt-1 text-xs rounded-sm font-medium text-black bg-[#E4E4E43B] w-[97.59px] h-[32.24px] flex items-center gap-2 my-4 px-2">
            <Image src="/svg/time.svg" alt="time" width={14.38} height={14.38} />
            <span className="whitespace-nowrap">{formatMinutes(readingPeriod)}</span>
          </div>

          <div className="mt-1 text-xs rounded-sm font-medium text-black bg-[#E4E4E43B] w-[120px] h-[32.24px] flex items-center gap-2 my-4 px-2">
            <Image src="/svg/calender.svg" alt="time" width={14.38} height={14.38} />
            <span className="whitespace-nowrap">{createdAt ? timeAgoFa(createdAt) : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

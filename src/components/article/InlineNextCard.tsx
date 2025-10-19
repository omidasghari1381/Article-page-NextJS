import Image from "next/image";
import { timeAgoFa } from "@/app/utils/date";

type Author = { id: string; firstName: string; lastName: string };

function formatMinutes(v?: number | string | null) {
  const n = typeof v === "string" ? Number(v) : v ?? 0;
  if (!n || Number.isNaN(n) || n <= 1) return "یک دقیقه";
  return `${n} دقیقه`;
}

export default function InlineNextCard({
  author,
  createdAt,
  subject,
  readingPeriod,
  className = "",
}: {
  author?: Author | null;
  createdAt?: string | null;
  subject?: string | null;
  readingPeriod?: number | string | null;
  className?: string;
}) {
  const fullName = author ? `${author.firstName} ${author.lastName}` : "—";

  return (
    <div
      className={`w-full rounded-xl border border-[#E4E4E4] dark:border-skin-border p-5 
                  bg-white dark:bg-skin-card flex flex-col justify-between 
                  h-auto lg:h-[163.5px] transition-colors ${className}`}
    >
      <div className="flex items-center text-[#3B3F3F] dark:text-skin-base mb-3">
        <Image
          src="/image/author.png"
          alt="next"
          width={33}
          height={33}
          className="object-cover rounded-full ml-3"
        />
        <span className="text-xs font-medium">نوشته شده توسط </span>
        <span className="text-xs font-medium ml-1">{fullName}</span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 lg:truncate my-3">
          {subject || "—"}
        </h4>

        <div className="flex flex-wrap gap-3">
          <div
            className="text-xs rounded-sm font-medium text-black dark:text-white 
                          bg-[#E4E4E43B] dark:bg-skin-border/30 h-8 px-2 flex items-center gap-2 transition-colors"
          >
            <Image
              src="/svg/time.svg"
              alt="time"
              width={14.38}
              height={14.38}
              className="dark:invert"
            />
            <span className="whitespace-nowrap">
              {formatMinutes(readingPeriod)}
            </span>
          </div>

          <div
            className="text-xs rounded-sm font-medium text-black dark:text-white 
                          bg-[#E4E4E43B] dark:bg-skin-border/30 h-8 px-2 flex items-center gap-2 transition-colors"
          >
            <Image
              src="/svg/calender.svg"
              alt="time"
              width={14.38}
              height={14.38}
              className="dark:invert"
            />
            <span className="whitespace-nowrap">
              {createdAt ? timeAgoFa(createdAt) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

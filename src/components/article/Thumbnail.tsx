// components/article/Thumbnail.tsx
import Image from "next/image";

export type ThumbnailProps = {
  thumbnail?: string | null;
  category?: string | null;
  className?: string;
};

export default function Thumbnail({ thumbnail, category, className }: ThumbnailProps) {
  const src = thumbnail?.trim().length ? thumbnail! : "/image/a.png";
  return (
    <div className={`relative h-72 sm:h-96 ${className ?? ""}`}>
      <Image src={src} alt="cover" fill className="object-cover rounded-xl" />
      <Image
        src="/svg/Rectangle3.svg"
        alt="cover"
        width={145.64}
        height={46.74}
        className="absolute bottom-4 right-4 z-10"
      />
      <span className="absolute bottom-[30px] right-11 z-10 text-base font-semibold">{category || "—"}</span>
    </div>
  );
}

export function Thumbnaill({ thumbnail, category, className }: ThumbnailProps) {
  const src = thumbnail?.trim().length ? thumbnail! : "/image/a.png";
  return (
    <div className={"relative h-[163.5px] w-[291.14px] shrink-0 " + (className ?? "")}>
      <Image src={src} alt="cover" fill className="object-cover rounded-xl" />
      <Image src="/svg/Rectangle3.svg" alt="badge" width={92} height={30} className="absolute bottom-2 right-2 pointer-events-none" />
      <span className="absolute bottom-3.5 right-5 z-10 text-xs font-semibold">{category || "—"}</span>
    </div>
  );
}

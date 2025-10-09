// components/article/Thumbnail.tsx
import Image from "next/image";

// Small helper to concat classes safely
const cx = (...a: Array<string | false | undefined | null>) => a.filter(Boolean).join(" ");

export type ThumbnailProps = {
  thumbnail?: string | null;
  category?: string | null;
  /** Extra classes appended to container */
  className?: string;
};

// ===== Configurable (Large) Thumbnail =====
export type LargeThumbnailProps = ThumbnailProps & {
  /** Override heights per breakpoint (Tailwind classes) */
  heights?: {
    base?: string; // e.g. "h-48"
    sm?: string;   // e.g. "sm:h-72"
    md?: string;   // e.g. "md:h-96"
    lg?: string;   // e.g. "lg:h-[420px]"
    xl?: string;   // optional
  };
  /** Corner radius classes (responsive allowed) */
  rounded?: string; // e.g. "rounded-xl sm:rounded-2xl"
  /** Show category badge chip */
  showBadge?: boolean;
  /** Override badge box classes (position/size) */
  badgeClass?: string;
  /** Override category text classes/position */
  categoryTextClass?: string;
};

// === Large thumbnail (hero-like) ===
export default function Thumbnail({
  thumbnail,
  category,
  className,
  heights,
  rounded,
  showBadge = true,
  badgeClass,
  categoryTextClass,
}: LargeThumbnailProps) {
  const src = thumbnail?.trim().length ? thumbnail! : "/image/a.png";

  const heightClasses = cx(
    heights?.base ?? "h-48",
    heights?.sm ?? "sm:h-72",
    heights?.md ?? "md:h-96",
    heights?.lg,
    heights?.xl,
  );

  const radius = rounded ?? "rounded-xl sm:rounded-2xl";

  return (
    <div className={cx("relative w-full", heightClasses, className)}>
      <Image src={src} alt="cover" fill className={cx("object-cover", radius)} />

      {showBadge && (
        <>
          <Image
            src="/svg/Rectangle3.svg"
            alt="badge"
            width={146}
            height={47}
            className={cx(
              // default badge sizing + placement
              "absolute z-10 w-[96px] h-[32px] sm:w-[145.64px] sm:h-[46.74px]",
              "bottom-2 right-2 sm:bottom-4 sm:right-4",
              badgeClass,
            )}
          />
          <span
            className={cx(
              "absolute z-10 text-xs sm:text-base font-semibold",
              "bottom-3 right-4 sm:bottom-[30px] sm:right-11",
              categoryTextClass,
            )}
          >
            {category || "—"}
          </span>
        </>
      )}
    </div>
  );
}

// ===== Configurable (Small) Thumbnail used in related cards =====
export type SmallThumbnailProps = ThumbnailProps & {
  /** Mobile aspect ratio (Tailwind aspect) e.g. "aspect-[16/9]" */
  mobileAspectClass?: string;
  /** Desktop size classes (Tailwind) e.g. "sm:aspect-auto sm:h-[163.5px] sm:w-[291.14px]" */
  desktopSizeClass?: string;
  /** Corner radius classes */
  rounded?: string;
  /** Show category badge chip */
  showBadge?: boolean;
  /** Override badge and text classes */
  badgeClass?: string;
  categoryTextClass?: string;
};

export function SideImage({
  thumbnail,
  category,
  className,
  mobileAspectClass = "aspect-[16/9]",
  desktopSizeClass = "sm:aspect-auto sm:h-[163.5px] sm:w-[291.14px]",
  rounded = "rounded-xl",
  showBadge = true,
  badgeClass,
  categoryTextClass,
}: SmallThumbnailProps) {
  const src = thumbnail?.trim().length ? thumbnail! : "/image/a.png";
  return (
    <div
      className={cx(
        "relative w-full shrink-0",
        mobileAspectClass,
        desktopSizeClass,
        className,
      )}
    >
      <Image src={src} alt="cover" fill className={cx("object-cover", rounded)} />

      {showBadge && (
        <>
          <Image
            src="/svg/Rectangle3.svg"
            alt="badge"
            width={92}
            height={30}
            className={cx(
              "absolute pointer-events-none",
              // default responsive badge size/position
              "w-[72px] h-[24px] sm:w-[92px] sm:h-[30px]",
              "bottom-2 right-2",
              badgeClass,
            )}
          />
          <span
            className={cx(
              "absolute z-10 font-semibold",
              "text-[10px] sm:text-xs",
              "bottom-2.5 right-4",
              categoryTextClass,
            )}
          >
            {category || "—"}
          </span>
        </>
      )}
    </div>
  );
}

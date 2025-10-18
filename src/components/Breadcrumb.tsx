import Link from "next/link";

/** Types */
export type Crumb = { label: string; href?: string };
type EllipsisItem = { ellipsis: true };
type DisplayItem = Crumb | EllipsisItem;

const isEllipsisItem = (x: DisplayItem): x is EllipsisItem =>
  (x as any).ellipsis === true;
const isCrumb = (x: DisplayItem): x is Crumb => !isEllipsisItem(x);


function computeDesktopItems(items: Crumb[]): DisplayItem[] {
  const total = items.length;
  if (total <= 4) return items;
  return [items[0], items[1], { ellipsis: true }, items[total - 1]];
}

// موبایل: فقط اول + ... + آخر
function computeMobileItems(items: Crumb[]): DisplayItem[] {
  const total = items.length;
  if (total <= 3) return items;
  return [items[0], { ellipsis: true }, items[total - 1]];
}

/** Render helpers */
function renderTrail(displayItems: DisplayItem[], separator?: React.ReactNode) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
      {displayItems.map((item, i) => {
        const isLast = i === displayItems.length - 1;

        return (
          <li key={i} className="flex items-center gap-1 sm:gap-2">
            {isEllipsisItem(item) ? (
              // فقط سه‌نقطه‌ی ساده (بدون منو)
              <span className="text-slate-400" aria-hidden="true">…</span>
            ) : item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-emerald-600 transition-colors text-[13px] sm:text-sm text-[#757878]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  "text-[13px] sm:text-sm " +
                  (isLast ? "text-slate-900 font-medium" : "text-[#757878]")
                }
              >
                {item.label}
              </span>
            )}

            {/* جداکننده */}
            {!isLast && isCrumb(item) && (
              <span className="mx-1" aria-hidden="true">
                {separator ?? <span className="text-slate-400" dir="ltr">&lt;</span>}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Component */
export default function Breadcrumb({
  items,
  separator,
  className,
}: {
  items: Crumb[];
  separator?: React.ReactNode;
  className?: string;
}) {
  const desktopItems = computeDesktopItems(items);
  const mobileItems = computeMobileItems(items);

  return (
    <nav
      aria-label="breadcrumb"
      className={["w-full select-none", className ?? ""].join(" ")} // تمام‌عرض موبایل
    >
      {/* موبایل: اول … آخر */}
      <div className="sm:hidden px-1 text-[#757878]">
        {renderTrail(mobileItems, separator)}
      </div>

      {/* دسکتاپ: اول دوم … آخر */}
      <div className="hidden sm:block px-1 text-[#757878]">
        {renderTrail(desktopItems, separator)}
      </div>
    </nav>
  );
}

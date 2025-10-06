import Link from "next/link";
import SummeryDropdown from "./Summery";

/** Types */
export type Crumb = { label: string; href?: string };
type EllipsisItem = { ellipsis: true };
type DisplayItem = Crumb | EllipsisItem;

type BreadcrumbProps = {
  items: Crumb[];
  separator?: React.ReactNode;
  maxVisible?: number; // دسکتاپ
  mobileMaxVisible?: number; // موبایل
  className?: string;
};

/** Type Guards */
function isEllipsisItem(x: DisplayItem): x is EllipsisItem {
  return (x as any).ellipsis === true;
}
function isCrumb(x: DisplayItem): x is Crumb {
  return !isEllipsisItem(x);
}

/** Compute helpers */  
function computeDesktopItems(
  items: Crumb[],
  maxVisible: number
): DisplayItem[] {
  const total = items.length;
  if (total <= maxVisible) return items;
  return [
    items[0],
    items[1],
    { ellipsis: true },
    items[total - 2],
    items[total - 1],
  ];
}
function computeMobileItems(
  items: Crumb[],
  mobileMaxVisible: number
): DisplayItem[] {
  const total = items.length;
  if (total <= mobileMaxVisible) return items;
  return [items[0], { ellipsis: true }, items[total - 1]];
}

/** Render helpers */
function EllipsisMenu({ items }: { items: Crumb[] }) {
  return (
    <details className="relative group">
      <SummeryDropdown
        aria-haspopup="menu"
        className="list-none inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 text-slate-500 cursor-pointer"
        title="نمایش مسیر کامل"
      >
        …
      </SummeryDropdown>
      <div
        role="menu"
        className="absolute top-[125%] right-0 min-w-40 bg-white border border-gray-200 shadow-md rounded-md p-2 z-20
                   invisible opacity-0 group-open:visible group-open:opacity-100 transition"
      >
        <div className="flex flex-col text-sm">
          {items.map((x, idx) =>
            x.href ? (
              <Link
                key={idx}
                href={x.href}
                className="px-2 py-1.5 rounded hover:bg-gray-100 text-[#2E3232]"
              >
                {x.label}
              </Link>
            ) : (
              <span key={idx} className="px-2 py-1.5 text-slate-700">
                {x.label}
              </span>
            )
          )}
        </div>
      </div>
    </details>
  );
}

function renderTrail(
  displayItems: DisplayItem[],
  allItems: Crumb[],
  separator?: React.ReactNode
) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
      {displayItems.map((item, i) => {
        const isLast = i === displayItems.length - 1;

        return (
          <li key={i} className="flex items-center gap-1 sm:gap-2">
            {isEllipsisItem(item) ? (
              <EllipsisMenu
                items={allItems.slice(1, Math.max(1, allItems.length - 1))}
              />
            ) : isCrumb(item) && item.href && !isLast ? (
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
                {isCrumb(item) ? item.label : "…"}
              </span>
            )}

            {/* جداکننده */}
            {!isLast && isCrumb(item) && (
              <span className="mx-1" aria-hidden="true">
                {separator ?? (
                  <span className="text-slate-400" dir="ltr">
                    &lt;
                  </span>
                )}
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
  maxVisible = 5,
  mobileMaxVisible = 3,
  className,
}: BreadcrumbProps) {
  const desktopItems = computeDesktopItems(items, maxVisible);
  const mobileItems = computeMobileItems(items, mobileMaxVisible);

  return (
    <nav
      aria-label="breadcrumb"
      className={
        "w-full overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-hide select-none " +
        (className ?? "")
      }
    >
      {/* موبایل */}
      <div className="sm:hidden px-1 text-[#757878]">
        {renderTrail(mobileItems, items, separator)}
      </div>

      {/* دسکتاپ */}
      <div className="hidden sm:block px-1 text-[#757878]">
        {renderTrail(desktopItems, items, separator)}
      </div>
    </nav>
  );
}

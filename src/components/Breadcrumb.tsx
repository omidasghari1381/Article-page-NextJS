import Link from "next/link";

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

function computeMobileItems(items: Crumb[]): DisplayItem[] {
  const total = items.length;
  if (total <= 3) return items;
  return [items[0], { ellipsis: true }, items[total - 1]];
}

function renderTrail(displayItems: DisplayItem[], separator?: React.ReactNode) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
      {displayItems.map((item, i) => {
        const isLast = i === displayItems.length - 1;

        return (
          <li key={i} className="flex items-center gap-1 sm:gap-2">
            {isEllipsisItem(item) ? (
              <span
                className="text-slate-400 dark:text-skin-divider"
                aria-hidden="true"
              >
                …
              </span>
            ) : item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-emerald-600 transition-colors text-[13px] sm:text-sm text-[#757878] dark:text-skin-muted"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  "text-[13px] sm:text-sm " +
                  (isLast
                    ? "text-slate-900 dark:text-white font-medium"
                    : "text-[#757878] dark:text-skin-muted")
                }
              >
                {item.label}
              </span>
            )}

            {!isLast && isCrumb(item) && (
              <span
                className="mx-1 text-slate-400 dark:text-skin-divider"
                aria-hidden="true"
              >
                {separator ?? <span dir="ltr">&lt;</span>}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

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
      className={["w-full select-none", className ?? ""].join(" ")}
    >
      <div className="sm:hidden px-1 text-[#757878] dark:text-skin-muted">
        {renderTrail(mobileItems, separator)}
      </div>

      <div className="hidden sm:block px-1 text-[#757878] dark:text-skin-muted">
        {renderTrail(desktopItems, separator)}
      </div>
    </nav>
  );
}

import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: Crumb[];
  separator?: React.ReactNode;
  maxVisible?: number;
};

export default function Breadcrumb({
  items,
  separator,
  maxVisible = 5,
}: BreadcrumbProps) {
  const total = items.length;
  let displayItems: (Crumb | { ellipsis: true })[] = items;

  if (total > maxVisible) {
    displayItems = [
      items[0],
      items[1],
      { ellipsis: true },
      items[total - 2],
      items[total - 1],
    ];
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-[#757878]">
      {displayItems.map((item, i) => {
        const isEllipsis = "ellipsis" in item;
        const isLast = i === displayItems.length - 1;

        return (
          <div key={i} className="flex items-center gap-2">
            {isEllipsis ? (
              <span className="text-slate-400">…</span>
            ) : item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-emerald-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-slate-900 font-medium" : ""}>
                {item.label}
              </span>
            )}

            {!isLast && !isEllipsis && (
              <span className="mx-1">
                {separator ?? (
                  <span className="text-slate-400" dir="ltr">
                    &lt;
                  </span>
                )}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

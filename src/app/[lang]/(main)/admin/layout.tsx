import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-skin-bg text-skin-base transition-colors duration-300">
      <input id="admin-drawer" type="checkbox" className="peer hidden" />

      <header className="md:hidden h-14 bg-white dark:bg-skin-card border-b border-skin-border flex items-center justify-between px-4 transition-colors">
        <label
          htmlFor="admin-drawer"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-skin-border/40 cursor-pointer transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="text-skin-base"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </label>
        <span className="font-bold text-skin-heading">منو</span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] h-[calc(100vh-56px)] md:h-screen gap-0 bg-white dark:bg-skin-bg transition-colors">
        <aside
          className={[
            "hidden md:flex md:static md:translate-x-0 md:opacity-100 md:visible md:top-0 md:h-screen md:z-10",
            "bg-white dark:bg-skin-card md:border-s md:border-skin-border border-l border-skin-border",
            "fixed top-14 bottom-0 right-0 z-40 w-[84%] max-w-[320px] p-4",
            "transition-all duration-300 translate-x-full opacity-0 invisible",
            "peer-checked:translate-x-0 peer-checked:opacity-100 peer-checked:visible",
            "flex-col shadow-sm md:shadow-none",
          ].join(" ")}
        >
          <nav>
            <SidebarLink href="/admin/users" label="کاربران" />
            <SidebarLink href="/admin/categories" label="کتگوری" />
            <SidebarLink href="/admin/articles" label="مقالات" />
            <SidebarLink href="/admin/media" label="رسانه" />
            <SidebarLink href="/admin/redirects" label="ریدایرکت" />
            <SidebarLink href="/admin/tags" label="تگ‌ها" />
            <SidebarLink href="/admin/faq/editor" label="سوالات پرکاربرد" />
            <SidebarLink href="/admin/langueges" label="زبان‌ها" />
          </nav>
        </aside>

        <main className="overflow-auto bg-white dark:bg-skin-bg transition-colors md:pl-10">
          <section className="rounded-none md:rounded-2xl bg-white dark:bg-skin-card border border-skin-border p-4 md:p-4 shadow-sm transition-colors md:mt-10">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex gap-2 px-3 h-14 items-center rounded border-b border-skin-border hover:bg-gray-100 dark:hover:bg-skin-border/40 text-skin-base transition-colors"
    >
      <span className="h-2 w-2 rounded-full bg-skin-border" aria-hidden />
      <span className="text-lg">{label}</span>
    </Link>
  );
}

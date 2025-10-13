import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1C2121]">
      <input id="admin-drawer" type="checkbox" className="peer hidden" />

      <header className="md:hidden h-14 bg-white border-b flex items-center justify-between px-4">
        <label
          htmlFor="admin-drawer"
          className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </label>
        <span className="font-bold">منو</span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] h-[calc(100vh-56px)] md:h-screen gap-0 bg-white">
        <aside
          className={[
            "hidden md:flex md:static md:translate-x-0 md:opacity-100 md:visible  md:top-0 md:h-screen md:z-10",
            "bg-white md:border-s md:border-gray-200 border-l",
            "fixed top-14 bottom-0 right-0 z-40 w-[84%] max-w-[320px] p-4",
            "transition-all duration-300 translate-x-full opacity-0 invisible",
            "peer-checked:translate-x-0 peer-checked:opacity-100 peer-checked:visible",
            "flex-col",
          ].join(" ")}
        >
          <nav className="">
            <SidebarLink href="/admin/users" label="کاربران" />
            <SidebarLink href="/admin/articles" label="مقالات" />
            <SidebarLink href="/admin/media" label="رسانه" />
            <SidebarLink href="/admin/redirects" label="ریدایرکت" />
            <SidebarLink href="/admin/tags" label="تگ ها" />
            <SidebarLink href="/admin/faq/editor" label="سوالات پرکاربرد" />
            <SidebarLink href="/admin/langueges" label="زبان ها" />
          </nav>
        </aside>

        <main className="overflow-auto bg-white p-0 md:pl-10">
          <section className="rounded-none md:rounded-2xl bg-white p-4 md:p-4">
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
      className="flex gap-1 px-3 h-14 items-center rounded hover:bg-gray-100 border-b border-gray-100"
    >
      <span className="h-2 w-2 rounded-full " aria-hidden />
      <span className="text-lg">{label}</span>
    </Link>
  );
}

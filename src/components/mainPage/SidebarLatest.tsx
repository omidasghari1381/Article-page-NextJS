import Link from "next/link";
import Image from "next/image";
import { cookies, headers } from "next/headers";
import { getServerT } from "@/lib/i18n/get-server-t";

type Author = { id: string; firstName: string; lastName: string };
type CategoryObj = { id: string; name: string; slug: string };
type CategoryLike = string | CategoryObj | CategoryObj[] | null | undefined;

type LatestItem = {
  id?: string;
  title?: string;
  createdAt?: string;
  categories?: CategoryLike;
  author?: Author | null;
  thumbnail?: string | null;
  readingPeriod?: number | string | null;
};

/** زبان را از prop/کوکی/هدر تشخیص می‌دهد و به "fa" | "en" محدود می‌کند */
async function resolveLang(passed?: "fa" | "en" | string): Promise<"fa" | "en"> {
  if (passed === "fa" || passed === "en") return passed;

  const c =
    (await cookies()).get("lang")?.value ||
    (await cookies()).get("NEXT_LOCALE")?.value ||
    (await cookies()).get("i18next")?.value;
  if (c === "fa" || c === "en") return c;

  const h = (await headers()).get("accept-language") || "";
  const primary = h.split(",")[0]?.split("-")[0];
  if (primary === "en") return "en";

  return "fa"; // پیش‌فرض امن
}

function getCategoryName(categories: CategoryLike): string | null {
  if (!categories) return null;
  if (typeof categories === "string") {
    const trimmed = categories.trim();
    return trimmed.length ? trimmed : null;
  }
  if (Array.isArray(categories)) {
    const first = categories[0];
    const name = first?.name?.trim();
    return name?.length ? name : null;
  }
  const name = categories.name?.trim();
  return name?.length ? name : null;
}

export default async function SidebarLatest({
  posts = [],
  lang,
}: {
  posts: LatestItem[];
  lang?: "fa" | "en" | string; // اختیاری؛ اگر ندهی از کوکی/هدر گرفته می‌شود
}) {
  const safeLang = resolveLang(lang);
  const t = await getServerT(await safeLang, "common");
  const title = t("sidebar.popular");
  const empty = t("sidebar.empty");

  return (
    <aside>
      <div className="flex items-center gap-3 px-2 sm:px-4 py-6">
        <Image
          src="/svg/Rectangle.svg"
          alt={t("alt.badge")}
          width={8}
          height={36}
          className="dark:invert"
        />
        <h3 className="text-lg sm:text-xl font-semibold text-[#1C2121] dark:text-white">
          {title}
        </h3>
      </div>

      <div className="px-2 sm:px-4 pb-4 space-y-6 sm:space-y-8">
        {posts.length ? (
          posts.map((p) => (
            <SidebarCard key={p.id ?? `${p.title}-${Math.random()}`} post={p} />
          ))
        ) : (
          <div className="text-sm text-gray-500 dark:text-skin-muted">
            {empty}
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarCard({ post }: { post: LatestItem }) {
  const categoryName = getCategoryName(post.categories);
  const articleUrl = post.id ? `/articles/${post.id}` : "#";

  return (
    <Link href={articleUrl} className="group block transition hover:opacity-95">
      <div className="relative w-full aspect-[16/10] sm:aspect-[3/2] rounded-md overflow-hidden">
        <Image
          src={post.thumbnail || "/image/hero1.jpg"}
          alt={post.title || "thumbnail"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        {categoryName && (
          <div className="absolute top-3 right-3">
            <div className="relative inline-block">
              <Image
                src="/svg/arrowLeftBlack.svg"
                alt="badge"
                width={108}
                height={35}
                className="block dark:invert"
                priority
              />
              <span className="dark:text-black absolute inset-0 left-3 flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold leading-none px-2">
                {categoryName}
              </span>
            </div>
          </div>
        )}
        <div className="absolute bottom-3 right-4 left-4 text-white">
          <h5 className="text-sm sm:text-base font-medium leading-7 line-clamp-2">
            {post.title || "—"}
          </h5>
        </div>
      </div>
    </Link>
  );
}
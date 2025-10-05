import Image from "next/image";

type LiteArticle = {
  id?: string;
  title?: string;
  createdAt?: string;
  category?: string;
  author?: { id: string; firstName: string; lastName: string };
  thumbnail?: string | null;
  readingPeriod?: string;
};

export default function SidebarLatest({ posts = [] }: { posts: LiteArticle[] }) {
  return (
    <aside>
      <div className="flex items-center gap-3 px-2 sm:px-4 py-6">
        <Image src="/svg/Rectangle.svg" alt="thumb" width={8} height={36} />
        <h3 className="text-lg sm:text-xl font-semibold text-[#1C2121]">
          محبوب‌ترین مقالات
        </h3>
      </div>

      <div className="px-2 sm:px-4 pb-4 space-y-6 sm:space-y-8">
        {posts.length ? (
          posts.map((p) => <SidebarCard key={p.id ?? Math.random()} post={p} />)
        ) : (
          <div className="text-sm text-gray-500">موردی برای نمایش نیست.</div>
        )}
      </div>
    </aside>
  );
}

function SidebarCard({ post }: { post: LiteArticle }) {
  return (
    <article className="group">
      <div className="relative w-full aspect-[16/10] sm:aspect-[3/2] rounded-md overflow-hidden">
        <Image
          src={post.thumbnail || "/image/hero1.jpg"}
          alt={post.title || "thumbnail"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw,
                 (max-width: 1024px) 50vw,
                 33vw"
          priority={false}
        />

        {/* گرادیانت خوانایی متن */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

        {/* بَج دسته‌بندی */}
        {post.category && (
          <div className="absolute top-3 right-3" dir="rtl">
            <div className="relative inline-block">
              <Image
                src="/svg/arrowLeftBlack.svg"
                alt="badge"
                width={108}
                height={35}
                className="block"
              />
              <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold leading-none px-2">
                {post.category}
              </span>
            </div>
          </div>
        )}

        {/* عنوان */}
        <div className="absolute bottom-3 right-4 left-4 text-white">
          <h5 className="text-sm sm:text-base font-medium leading-7 line-clamp-2">
            {post.title || "—"}
          </h5>
        </div>
      </div>
    </article>
  );
}

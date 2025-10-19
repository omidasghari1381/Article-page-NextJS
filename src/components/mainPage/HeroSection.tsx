import Image from "next/image";
import Link from "next/link";
import { timeAgoFa } from "@/app/utils/date";

type AuthorDTO = { id: string; firstName: string; lastName: string } | null;
type CategoryLite = { id: string; name: string; slug?: string };
type ArticleLite = {
  id: string;
  title: string;
  subject: string | null;
  createdAt: string;
  viewCount: number;
  thumbnail: string | null;
  readingPeriod: number;
  author?: AuthorDTO;
  categories?: CategoryLite[];
};

export default function HeroSection({
  article,
  items,
}: {
  article: ArticleLite | null;
  items: ArticleLite[] | null;
}) {
  const articleUrl = article?.id ? `/articles/${article.id}` : "#";

  return (
    <section className="w-full text-skin-base">
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch overflow-hidden rounded-xl bg-neutral-900 dark:bg-neutral-900">
        <div className="relative flex flex-col justify-center space-y-4 md:space-y-6 py-8 md:py-10 z-10 order-2 md:order-1">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-200">
            <Image src="/svg/write.svg" alt="نویسنده" width={22} height={22} className="dark:invert" />
            <span>{article?.author?.firstName ?? ""}</span>
            <span>{article?.author?.lastName ?? ""}</span>
            <span className="opacity-60">·</span>
            <Image src="/svg/whiteCalender.svg" alt="تاریخ" width={22} height={22} className="dark:invert" />
            <span>{article?.createdAt ? timeAgoFa(article.createdAt) : "—"}</span>
          </div>

          <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed">
            {article?.title ?? "—"}
            <br />
            <span className="font-normal text-slate-300">
              {article?.subject ?? ""}
            </span>
          </h1>

          <div className="flex w-full sm:w-auto">
            <Link
              href={articleUrl}
              className="w-full sm:w-auto bg-[#19CCA7] hover:bg-[#15b697] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 sm:px-6 py-3 rounded-lg font-medium transition-colors"
              aria-disabled={!article?.id}
            >
              ← مطالعه مقاله
            </Link>
          </div>
        </div>

        <div className="relative min-h-[220px] sm:min-h-[300px] md:min-h-[420px] lg:min-h-[480px] order-1 md:order-2 rounded-xl overflow-hidden">
          <div className="absolute inset-0 z-[1]">
            <div className="absolute inset-0 bg-gradient-to-l md:bg-gradient-to-l from-[#000A08]/70 md:from-[#000A08] to-transparent" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "url('/Image/noise.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "auto",
              }}
            />
          </div>

          <Image
            src={article?.thumbnail ?? "/Image/hero1.jpg"}
            alt={article?.title ?? "Hero"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
            priority
          />
        </div>
      </div>

      <div className="mx-auto mt-6 sm:mt-8 lg:mt-10 px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl p-4 sm:p-5 md:p-6 lg:-translate-y-10 bg-white/70 dark:bg-black/30 backdrop-blur-xl">
          <div className="mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 -translate-y-20 h-[303px] w-[1280px] rounded-lg justify-center bg-skin-card/80 dark:bg-skin-card/60 backdrop-blur-[100px]">
            <div className="md:col-span-full md:hidden">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mb-2 align-middle">
                {items?.map((item) => (
                  <Link
                    href={`/article/${item.id}`}
                    key={item.id}
                    className="min-w-[260px] max-w-[260px] snap-start bg-skin-card border border-skin-border rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="relative w-full h-40">
                      <Image
                        src={item.thumbnail ?? "/Image/placeholder.jpg"}
                        alt={item.subject ?? item.title}
                        fill
                        className="object-cover"
                        sizes="260px"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-skin-heading line-clamp-2">
                        {item.subject ?? item.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-3 text-xs text-skin-muted">
                        <span>{item.createdAt ? timeAgoFa(item.createdAt) : "—"}</span>
                        <span>بازدید {item.viewCount}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {items?.map((item) => (
              <Link
                href={`/articles/${item.id}`}
                key={`md-${item.id}`}
                className="hidden md:block bg-skin-card border border-skin-border rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="relative w-full h-40 md:h-44 lg:h-48">
                  <Image
                    src={item.thumbnail ?? "/Image/placeholder.jpg"}
                    alt={item.subject ?? item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-skin-heading line-clamp-2">
                    {item.subject ?? item.title}
                  </h3>
                  <div className="flex items-center gap-6 mt-3 text-xs text-skin-muted">
                    <span>{item.createdAt ? timeAgoFa(item.createdAt) : "—"}</span>
                    <span>بازدید {item.viewCount}</span>
                  </div>
                </div>
              </Link>
            ))}

            {!items?.length && (
              <div className="col-span-full text-center text-sm text-skin-muted py-8">
                محتوایی برای نمایش وجود ندارد.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
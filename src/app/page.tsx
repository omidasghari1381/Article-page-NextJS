// app/page.tsx

import Image from "next/image";
import { articleCategoryEnum } from "@/server/modules/articles/enums/articleCategory.enum";
import { absolute } from "@/app/utils/base-url";
import Chosen from "@/components/mainPage/Chosen";
import Educational from "@/components/mainPage/Educational";
import LatestArticle from "@/components/mainPage/LatestArticle";
import Markets from "@/components/mainPage/Markets";
import Video from "@/components/mainPage/Video";
import HeroSection from "@/components/mainPage/HeroSection";
import SidebarLatest from "@/components/mainPage/SidebarLatest";

// ---- Types ----
type AuthorDTO = { id: string; firstName: string; lastName: string } | null;
type CategoryLite = { id: string; name: string; slug?: string };
type ArticleLite = {
  id: string;
  title: string;
  subject: string | null;
  createdAt: string; // ISO
  viewCount: number;
  thumbnail: string | null;
  readingPeriod: number;
  author?: AuthorDTO;
  categories?: CategoryLite[];
};
type ApiList<T> = { items: T[]; total?: number };

/** ✅ نوعی که SidebarLatest انتظار دارد (همان LiteArticle صفحه جزئیات) */
type LiteArticle = {
  id: string;
  title: string;
  createdAt: string;
  category: string;
  author: { id: string; firstName: string; lastName: string };
  thumbnail: string | null;
  readingPeriod: string | number;
};

// ---- Fetchers (SSR) ----
async function getLatest(): Promise<ArticleLite[]> {
  const res = await fetch(absolute("/api/articles?perPage=4&sortBy=createdAt&sortDir=DESC"), {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data: ApiList<ArticleLite> = await res.json();
  return data.items ?? [];
}

async function getHero(): Promise<ArticleLite | null> {
  const res = await fetch(absolute("/api/articles?perPage=1&sortBy=createdAt&sortDir=DESC"), {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data: ApiList<ArticleLite> = await res.json();
  return Array.isArray(data.items) ? data.items[0] ?? null : null;
}

// ✅ فچ مخصوص سکشن Educational
async function getEducational(): Promise<ArticleLite[]> {
  const res = await fetch(absolute("/api/articles?perPage=5&sortBy=createdAt&sortDir=DESC"), {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data: ApiList<ArticleLite> = await res.json();
  return data.items ?? [];
}

/** ✅ مبدل ArticleLite → LiteArticle برای SidebarLatest */
function toSidebarLite(a: ArticleLite): LiteArticle {
  const author =
    a.author && a.author.firstName !== undefined
      ? {
          id: a.author.id,
          firstName: a.author.firstName,
          lastName: a.author.lastName,
        }
      : { id: "", firstName: "", lastName: "" };

  return {
    id: a.id,
    title: a.title,
    createdAt: a.createdAt,
    category: a.categories?.[0]?.name ?? "",
    author,
    thumbnail: a.thumbnail ?? null,
    readingPeriod: a.readingPeriod ?? 0,
  };
}

export default async function HomePage() {
  const [latest, hero, educational] = await Promise.all([
    getLatest(),
    getHero(),
    getEducational(),
  ]);

  const categories = Object.values(articleCategoryEnum) as articleCategoryEnum[];

  /** ✅ داده واقعی برای SidebarLatest (به‌جای دیتای موقتی) */
  const sidebarPosts: LiteArticle[] = (latest ?? []).map(toSidebarLite);

  return (
    <main className="w-full">
      <HeroSection article={hero} items={latest} />

      <div className="px-4 sm:px-6 lg:px-10 xl:px-20 pb-10">
        <Chosen categories={categories} article={latest[0] ?? null} />

        <section className="mt-10">
          <Markets />
        </section>

        <section className="mt-12">
          <Educational items={educational} />
        </section>

        <section className="mt-10">
          <Image
            src="/image/banner.png"
            alt="thumb"
            width={1285}
            height={367}
            className="rounded-lg w-full h-auto"
            priority
          />
        </section>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LatestArticle />
          </div>
          <aside className="lg:col-span-1">
            <SidebarLatest posts={sidebarPosts} />
          </aside>
        </section>

        <section className="mt-25">
          <Video />
        </section>
      </div>
    </main>
  );
}
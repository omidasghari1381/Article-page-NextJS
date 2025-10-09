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
  // در صورت نیاز می‌تونی به کوئری، فیلتر دسته/تگ اضافه کنی:
  // /api/articles?perPage=5&sortBy=createdAt&sortDir=DESC&categoryId=... یا &tagId=...
  const res = await fetch(absolute("/api/articles?perPage=5&sortBy=createdAt&sortDir=DESC"), {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data: ApiList<ArticleLite> = await res.json();
  return data.items ?? [];
}

export default async function HomePage() {
  const [latest, hero, educational] = await Promise.all([
    getLatest(),
    getHero(),
    getEducational(),
  ]);

  const categories = Object.values(articleCategoryEnum) as articleCategoryEnum[];

  /** داده‌ی نمایشی sidebar – موقت؛ هر وقت APIش آماده شد جایگزین می‌کنیم */
  const related = [
    {
      id: "1a591415-538a-462a-990d-ef3d390c1289",
      title: "DSAFADSFASDF",
      createdAt: "2025-09-10 14:10:52.900681",
      category: "پراپ تریدینگ",
      author: {
        id: "1a591415-538a-466a-990d-ef3d390c1289",
        firstName: "امید",
        lastName: "اصغری",
      },
      thumbnail: "/image/a.png",
      readingPeriod: "7 min",
    },
    // ...
  ];

  return (
    <main className="w-full">
      <HeroSection article={hero} items={latest} />

      <div className="px-4 sm:px-6 lg:px-10 xl:px-20 pb-10">
        <Chosen categories={categories} article={latest[0] ?? null} />

        <section className="mt-10">
          <Markets />
        </section>

        {/* ✅ اینجا داده‌ی واقعی را پاس می‌دهیم */}
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
            <SidebarLatest posts={related} />
          </aside>
        </section>

        <section className="mt-16">
          <Video />
        </section>
      </div>
    </main>
  );
}

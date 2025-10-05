// app/page.tsx
import HeroSection from "@/components/HeroSection";
import SidebarLatest from "@/components/SidebarLatest";
import Image from "next/image";
import { articleCategoryEnum } from "@/server/modules/articles/enums/articleCategory.enum";
import { timeAgoFa } from "@/app/utils/date";
import { absolute } from "@/app/utils/base-url";
import Chosen from "@/components/Chosen";
import Educational from "@/components/Educational";
import LatestArticle from "@/components/LatestArticle";
import Markets from "@/components/Markets";
import Video from "@/components/Video";

/** ---------- Types هم‌راستا با API تو ---------- */
type ArticleDetail = {
  id: string;
  title: string;
  subject: string;
  category: string;
  viewCount: number;
  thumbnail: string | null;
  Introduction: string | null;
  author: { id: string; firstName: string; lastName: string };
  createdAt: string;
};

type Latest = {
  thumbnail: string | null;
  viewCount: number;
  subject: string;
  createdAt: string;
};

type ApiList<T> = { items: T[]; total?: number };

async function getLatest() {
  const res = await fetch(absolute("/api/articles?perPage=4"), {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

async function getHero() {
  const res = await fetch(absolute("/api/articles?perPage=1"), {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data.items) ? data.items[0] ?? null : null;
}

// اگر خواستی مستقیم Service بزنی (TypeORM/سرور): از این الگو استفاده کن
// import { getDataSource } from "@/server/db/typeorm.datasource";
// import { ArticleService } from "@/server/modules/articles/services/article.service";
// async function getLatestByService() { const ds = await getDataSource(); return new ArticleService(ds).list({ perPage: 4 }); }

export default async function HomePage() {
  // تمام دیتاها اینجا روی سرور آماده می‌شن
  const [latest, article] = await Promise.all([getLatest(), getHero()]);

  const categories = Object.values(
    articleCategoryEnum
  ) as articleCategoryEnum[];

  /** داده‌ی نمایشی sidebar (مثل نمونه‌ی قبلیت) */
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
    {
      id: "1a591415-538a-461a-990d-ef3d390c1289",
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
    {
      id: "1a591415-538a-466a-990d-ef3d390c1289",
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
  ];

  return (
    <main className="w-full">
      <HeroSection article={article} items={latest} />

      <div className="px-4 sm:px-6 lg:px-10 xl:px-20 pb-10">
        {/* تنها بخش کلاینتی این صفحه */}
        <Chosen categories={categories} article={latest[0] ?? null} />

        <section className="mt-10">
          <Markets />
        </section>

        <section className="mt-12">
          <Educational />
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

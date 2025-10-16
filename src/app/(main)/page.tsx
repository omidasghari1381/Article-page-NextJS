import Image from "next/image";
import { articleCategoryEnum } from "@/server/modules/articles/enums/articleCategory.enum";
import Chosen from "@/components/mainPage/Chosen";
import Educational from "@/components/mainPage/Educational";
import LatestArticle from "@/components/mainPage/LatestArticle";
import Markets from "@/components/mainPage/Markets";
import Video from "@/components/mainPage/Video";
import HeroSection from "@/components/mainPage/HeroSection";
import SidebarLatest from "@/components/mainPage/SidebarLatest";
import { ArticleService } from "@/server/modules/articles/services/article.service";

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
  category?: CategoryLite | null;
};

export default async function HomePage() {
  const categories = Object.values(
    articleCategoryEnum
  ) as articleCategoryEnum[];
  const svc = new ArticleService();
  const [latestRes, heroRes, educationalRes, sidebarLatestRes, mostViewedRes] =
    await Promise.all([
      svc.listArticles({
        page: 1,
        pageSize: 4,
        sort: { by: "createdAt", dir: "DESC" },
        variant: "lite",
      }),
      svc.listArticles({
        page: 1,
        pageSize: 1,
        sort: { by: "createdAt", dir: "DESC" },
        variant: "lite",
      }),
      svc.listArticles({
        page: 1,
        pageSize: 5,
        sort: { by: "createdAt", dir: "DESC" },
        variant: "lite",
      }),
      svc.listArticles({
        page: 1,
        pageSize: 3,
        sort: { by: "createdAt", dir: "DESC" },
        variant: "lite",
      }),
      svc.listArticles({
        page: 1,
        pageSize: 4,
        sort: { by: "viewCount", dir: "DESC" },
        variant: "lite",
      }),
    ]);

  const latest = latestRes.items as ArticleLite[];
  const hero = heroRes.items?.[0] as ArticleLite | null;
  const educational = educationalRes.items as ArticleLite[];
  const sidebarLatest = sidebarLatestRes.items as ArticleLite[];
  const mostViewed = mostViewedRes.items as ArticleLite[];

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
            <LatestArticle items={mostViewed} />
          </div>
          <aside className="lg:col-span-1">
            <SidebarLatest posts={sidebarLatest} />
          </aside>
        </section>

        <section className="mt-25">
          <Video />
        </section>
      </div>
    </main>
  );
}

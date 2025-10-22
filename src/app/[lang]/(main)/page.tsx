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
import Reveal from "@/components/transitions/Reveal";

import { clampLang, type Lang } from "@/lib/i18n/settings";
import { getServerT } from "@/lib/i18n/get-server-t";

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

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = clampLang(raw);
  const t = await getServerT(lang, "article");

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
      <Reveal as="section" mode="mount">
        <HeroSection article={hero} items={latest} lang={lang} />
      </Reveal>

      <div className="px-4 sm:px-6 lg:px-10 xl:px-20 pb-10">
        <Reveal as="section">
          <Chosen
            categories={categories}
            article={latest[0] ?? null}
            lang={lang}
          />
        </Reveal>

        <Reveal as="section" className="mt-10" once={false}>
          <Markets lang={lang} />
        </Reveal>

        <Reveal as="section" className="mt-12" once={false}>
          <Educational items={educational} lang={lang} />
        </Reveal>

        <Reveal as="section" className="mt-10" once={false}>
          <Image
            src="/image/banner.png"
            alt={t("home.banner_alt", { defaultValue: "banner" })}
            width={1285}
            height={367}
            className="rounded-lg w-full h-auto"
            priority
          />
        </Reveal>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Reveal as="div" className="lg:col-span-2" once={false}>
            <LatestArticle items={mostViewed} lang={lang} />
          </Reveal>

          <Reveal as="aside" className="lg:col-span-1" once={false}>
            <SidebarLatest posts={sidebarLatest} lang={lang} />
          </Reveal>
        </section>

        <Reveal as="section" className="mt-25" once={false}>
          <Video lang={lang} />
        </Reveal>
      </div>
    </main>
  );
}

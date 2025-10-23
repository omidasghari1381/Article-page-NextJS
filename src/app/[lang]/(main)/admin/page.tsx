import { ArticleService } from "@/server/modules/articles/services/article.service";
import { UserService } from "@/server/modules/users/services/users.service";
import { clampLang, type Lang } from "@/lib/i18n/settings";
import { getServerT } from "@/lib/i18n/get-server-t";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = clampLang(raw);
  const t = await getServerT(lang, "admin");

  const userService = new UserService();
  const articleService = new ArticleService();

  const [userCount, articleViewCount] = await Promise.all([
    userService.getUserCount({ isDeleted: "0" }),
    articleService.getViewCount(),
  ]);

  return (
    <main className="px-4 py-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="border border-skin-border rounded-md bg-skin-card p-6 text-center text-skin-base shadow-sm">
          <span className="font-medium text-lg sm:text-xl text-skin-heading">
            {t("cards.users.title")}
          </span>
          <div className="text-4xl sm:text-5xl mt-6 sm:mt-8 text-skin-heading">
            {userCount}
          </div>
        </div>

        <div className="border border-skin-border rounded-md bg-skin-card p-6 text-center text-skin-base shadow-sm">
          <span className="font-medium text-lg sm:text-xl text-skin-heading">
            {t("cards.articleViews.title")}
          </span>
          <div className="text-4xl sm:text-5xl mt-6 sm:mt-8 text-skin-heading">
            {articleViewCount}
          </div>
        </div>
      </div>
    </main>
  );
}
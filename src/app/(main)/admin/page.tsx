import UsersAreaCard from "@/components/admin/UsersChart";
import { ArticleService } from "@/server/modules/articles/services/article.service";
import { UserService } from "@/server/modules/users/services/users.service";
import { da } from "zod/v4/locales";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout() {
  const userService = new UserService();
  const articleService = new ArticleService();

  const userCount = await userService.getUserCount({ isDeleted: "0" });
  const articleViewCount = await articleService.getViewCount();

  const daily = await userService.getDailyNewUsers("last_7", {
    locale: "fa-IR",
  });
  console.log(daily);

  return (
    <main className="px-4 py-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="border border-skin-border rounded-md bg-skin-card p-6 text-center text-skin-base shadow-sm">
          <span className="font-medium text-lg sm:text-xl text-skin-heading">
            تعداد کاربران
          </span>
          <div className="text-4xl sm:text-5xl mt-6 sm:mt-8 text-skin-heading">
            {userCount}
          </div>
        </div>

        <div className="border border-skin-border rounded-md bg-skin-card p-6 text-center text-skin-base shadow-sm">
          <span className="font-medium text-lg sm:text-xl text-skin-heading">
            تعداد بازدید مقالات
          </span>
          <div className="text-4xl sm:text-5xl mt-6 sm:mt-8 text-skin-heading">
            {articleViewCount}
          </div>
        </div>
      </div>

      <UsersAreaCard
        total={daily.total}
        deltaPercent={Math.round(daily.deltaPercent)}
        series={daily.series}
        categories={daily.labels}
        defaultPeriod="۷ روز گذشته"
        subtitle="Users this week"
      />
    </main>
  );
}

import { ArticleService } from "@/server/modules/articles/services/article.service";
import { UserService } from "@/server/modules/users/services/users.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout() {
  const userService = new UserService();
  const articleService = new ArticleService();
  const userCount = await userService.getUserCount({ isDeleted: "0" });
  // const articleCount = await articleService.getUserCount();

  return (
    <main>
      <div className="flex gap-7">
        <div className="border rounded-md bg-gray-50 p-6 h-50 w-55 text-center">
          <span className="font-medium text-2xl ">تعداد کاربران</span>
          <div className="text-7xl mt-10">{userCount}</div>
        </div>
        <div className="border rounded-md bg-gray-50 p-6 h-50 w-55 text-center">
          <span className="font-medium text-2xl ">تعداد مقالات</span>
          <div className="text-7xl mt-10">{userCount}</div>
        </div>
      </div>
    </main>
  );
}

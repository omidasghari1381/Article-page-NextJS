import Breadcrumb from "@/components/Breadcrumb";
import ArticleFormClient from "@/components/faq/ArticleFormClient";
import BannerWithBox from "@/components/faq/BannerWithBox";

export const dynamic = "force-dynamic"; 

export default function Page() {
  return (
    <main className="pb-24 px-20 py-10">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          { label: "افزودن سوالات", href: "/articles/new" },
        ]}
      />
      <div className="mt-10">
        <ArticleFormClient />
      </div>
      {/* <div className="mt-10"><BannerWithBox /></div> */}
    </main>
  );
}
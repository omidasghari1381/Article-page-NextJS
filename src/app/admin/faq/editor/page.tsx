import Breadcrumb from "@/components/Breadcrumb";
import FaqFormClient from "@/components/faq/FaqFormClient";
import BannerWithBox from "@/components/faq/BannerWithBox";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="pb-24 py-10">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          { label: "افزودن سوالات", href: "/articles/new" },
        ]}
      />
      <div className="mt-10">
        <FaqFormClient />
      </div>
      {/* <div className="mt-10"><BannerWithBox /></div> */}
    </main>
  );
}

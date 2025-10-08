import Breadcrumb from "@/components/Breadcrumb";
import FaqClient from "@/components/faq/FaqClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main
      className={[
        // keep original look but make padding responsive
        "mx-auto",
        "py-10",
        "px-4 sm:px-6 lg:px-12 xl:px-20",
      ].join(" ")}
    >
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "سوالات متداول", href: "/" },
        ]}
      />

      <FaqClient />
    </main>
  );
}
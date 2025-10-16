import Breadcrumb from "@/components/Breadcrumb";
import FaqFormClient from "@/components/faq/FaqFormClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="pb-24 py-10">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "سوالات پرکاربرد", href: "/admin/faq" },
          { label: "افزودن سوالات", href: "/admin/faq/editor" },
        ]}
      />
      <div className="mt-10">
        <FaqFormClient />
      </div>
    </main>
  );
}

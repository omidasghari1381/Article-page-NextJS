import Breadcrumb from "@/components/Breadcrumb";
import { absolute } from "@/app/utils/base-url";
import TagFormClient from "@/components/tags/TagFormClient";

type TagDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export const dynamic = "force-dynamic"; // editor should be fresh

export default async function Page({ params }: { params: { id?: string[] } }) {
  const id = Array.isArray(params?.id) && params.id.length ? params.id[0] : null;

  let initialRecord: TagDTO | null = null;
  if (id) {
    try {
      const res = await fetch(absolute(`/api/tags/${id}`), { cache: "no-store" });
      if (res.ok) initialRecord = (await res.json()) as TagDTO;
    } catch {
      // silent — client shows friendly error if needed
    }
  }

  return (
    <main className="pb-24 pt-6 ">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          { label: "افزودن/ویرایش تگ", href: "/tags/editor" },
        ]}
      />

      <div className="mt-5">
        <TagFormClient initialRecord={initialRecord} />
      </div>
    </main>
  );
}
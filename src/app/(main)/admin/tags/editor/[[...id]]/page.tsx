import Breadcrumb from "@/components/Breadcrumb";
import TagFormClient from "@/components/tags/TagFormClient";
import { TagsService } from "@/server/modules/tags/services/tag.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type TagDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Page({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}) {
  const p = await params;
  const id = Array.isArray(p?.id) && p.id.length ? p.id[0] : null;

  let initialRecord: TagDTO | null = null;
  if (id) {
    try {
      const svc = new TagsService();
      const row = await svc.getById(id);
      if (row) {
        initialRecord = {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description ?? null,
        };
      } else {
        initialRecord = null;
      }
    } catch {
      initialRecord = null;
    }
  }

  async function saveAction(formData: FormData) {
    "use server";
    const svc = new TagsService();

    const id = String(formData.get("id") || "");
    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const descriptionRaw = String(formData.get("description") || "");
    const description = descriptionRaw.trim() ? descriptionRaw.trim() : null;

    if (!name || !slug) {
      redirect("/admin/tags/editor");
    }

    try {
      if (id) {
        await svc.updateTag(id, { name, slug, description });
      } else {
        await svc.createTag({ name, slug, description });
      }
      revalidatePath("/admin/tags");
      redirect("/admin/tags");
    } catch (e: any) {
      revalidatePath("/admin/tags");
      redirect("/admin/tags");
    }
  }

  async function deleteAction(formData: FormData) {
    "use server";
    const svc = new TagsService();
    const id = String(formData.get("id") || "");
    if (!id) {
      redirect("/admin/tags");
    }
    try {
      await svc.deleteTag(id);
      revalidatePath("/admin/tags");
      redirect("/admin/tags");
    } catch (e: any) {
      revalidatePath("/admin/tags");
      redirect("/admin/tags");
    }
  }

  return (
    <main className="pb-24 pt-6" dir="rtl">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "تگ‌ها", href: "/admin/tags" },
          { label: id ? "ویرایش تگ" : "افزودن تگ", href: "/admin/tags/editor" },
        ]}
      />
      <div className="mt-5">
        <TagFormClient
          initialRecord={initialRecord}
          onSave={saveAction}
          onDelete={deleteAction}
        />
      </div>
    </main>
  );
}

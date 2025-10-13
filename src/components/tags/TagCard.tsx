import Link from "next/link";
import { revalidatePath } from "next/cache";
import { absolute } from "@/app/utils/base-url";

export type TagDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  item: TagDTO;
  editHref?: string | ((id: string) => string);
  showDates?: boolean;
};

export default function TagCard({ item, editHref, showDates = true }: Props) {
  const { id, name, slug, description, createdAt, updatedAt } = item;
  const editLink = typeof editHref === "function" ? editHref(id) : typeof editHref === "string" ? editHref : null;

  async function deleteAction(formData: FormData) {
    "use server";
    const tagId = String(formData.get("id") || "");
    if (!tagId) return;

    await fetch(absolute("/api/tags"), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tagId }),
      cache: "no-store",
    });

    revalidatePath("/admin/tags");
  }

  return (
    <div className="rounded-2xl border shadow-sm bg-white p-4 sm:p-5 2xl:p-6 text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold truncate">{name}</div>
          <div className="text-sm text-gray-500 mt-1 truncate">@{slug}</div>
          {description && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2 sm:line-clamp-1">{description}</p>
          )}
        </div>

        {showDates && (createdAt || updatedAt) && (
          <div className="text-xs text-gray-500 flex flex-col text-left sm:text-right shrink-0">
            {createdAt && (
              <div>
                <span className="text-gray-400">ایجاد: </span>
                <time dateTime={createdAt}>{formatDateTime(createdAt)}</time>
              </div>
            )}
            {updatedAt && (
              <div>
                <span className="text-gray-400">ویرایش: </span>
                <time dateTime={updatedAt}>{formatDateTime(updatedAt)}</time>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-2 shrink-0">
          {editLink ? (
            <Link href={editLink} className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50 text-center whitespace-nowrap">ویرایش</Link>
          ) : null}

          <form action={deleteAction} className="contents">
            <input type="hidden" name="id" value={id} />
            <button className="px-3 py-1.5 rounded-lg bg-red-700 text-white hover:bg-red-800 whitespace-nowrap" type="submit">حذف</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return iso;
  }
}
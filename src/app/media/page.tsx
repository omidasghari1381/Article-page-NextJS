import Link from "next/link";
import { MediaGrid } from "./mediaCart";
import type { SimpleMediaType } from "@/server/modules/media/enums/media.enums";

type MediaDTO = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  type: SimpleMediaType;
  createdAt: string;
  updatedAt: string;
};

async function fetchMedia() {
  const res = await fetch(`http://localhost:3000/api/media?limit=100`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load media");
  return res.json() as Promise<{ items: MediaDTO[]; total: number }>;
}

export default async function MediaListPage() {
  const { items } = await fetchMedia();

  return (
    <main className="p-6 md:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">مدیا</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/media/editor"
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
          >
            افزودن مدیا
          </Link>
        </div>
      </div>

      <MediaGrid items={items} />
    </main>
  );
}

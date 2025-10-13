import type { SimpleMediaType } from "@/server/modules/media/enums/media.enums";
import { absolute } from "@/app/utils/base-url";
import MediaEditorClient from "@/components/media/MediaEditorClient";

// ---- Types ----
type MediaDTO = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  type: SimpleMediaType;
  createdAt: string;
  updatedAt: string;
};

export const dynamic = "force-dynamic"; 

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string[] }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const p = await params;
  const id = Array.isArray(p?.id) && p.id.length ? p.id[0] : null;

  let initialRecord: MediaDTO | null = null;
  if (id) {
    try {
      const res = await fetch(absolute(`/api/media/${id}`), { cache: "no-store" });
      if (res.ok) {
        initialRecord = (await res.json()) as MediaDTO;
      }
    } catch {
    }
  }

  return <MediaEditorClient initialId={id} initialRecord={initialRecord} />;
}

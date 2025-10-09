"use client";
import type { SimpleMediaType } from "@/server/modules/media/enums/media.enums";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type MediaDTO = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  type: SimpleMediaType;
  createdAt: string;
  updatedAt: string;
};

function getBaseOrigin() {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

function toAbsoluteUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.href;
  } catch {
    const base = getBaseOrigin();
    return new URL(url.replace(/^\/+/, "/"), base || "http://localhost:3000")
      .href;
  }
}

export function MediaGrid({ items }: { items: MediaDTO[] }) {
  const [list, setList] = useState<MediaDTO[]>(() => items?.slice?.() ?? []);
  const [selected, setSelected] = useState<MediaDTO | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setList(items?.slice?.() ?? []);
  }, [items]);

  const gridItems = useMemo(() => list, [list]);

  const handleCopyUrl = async (m: MediaDTO) => {
    const full = toAbsoluteUrl(m.url);
    await navigator.clipboard.writeText(full);
    setCopied(m.id);
    setTimeout(() => setCopied(null), 1200);
  };

  const handleDelete = async (m: MediaDTO) => {
    if (!confirm(`«${m.name}» حذف شود؟`)) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/media/${m.id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "خطا در حذف مدیا");
      }
      router.refresh();
      setList((prev) => prev.filter((x) => x.id !== m.id));
      setSelected(null);
    } catch (err: any) {
      alert(err?.message ?? "خطای نامشخص در حذف");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 sm:gap-4 md:gap-5">
        {gridItems.map((m) => (
          <button
            key={m.id}
            className="border rounded-xl p-2 text-right hover:shadow transition bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={() => setSelected(m)}
            title={m.name}
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
              {m.type === "image" ? (
                <img
                  src={toAbsoluteUrl(m.url)}
                  alt={m.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={toAbsoluteUrl(m.url)}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="line-clamp-1 text-sm font-medium text-black">
              {m.name}
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full sm:w-[92vw] sm:max-w-2xl rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-lg max-h-[92vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-between mb-4">
              <h2 className="text-lg font-semibold">جزئیات مدیا</h2>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  className="text-black px-4 py-2 rounded-lg border hover:bg-gray-50"
                  onClick={() => setSelected(null)}
                >
                  بستن
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {selected.type === "image" ? (
                    <img
                      src={toAbsoluteUrl(selected.url)}
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={toAbsoluteUrl(selected.url)}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">نام</div>
                  <div className="font-medium text-black break-words">
                    {selected.name}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">توضیحات</div>
                  <div className="text-gray-800 whitespace-pre-wrap break-words">
                    {selected.description || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">آدرس (URL)</div>
                  <button
                    className="w-full text-right text-blue-700 underline break-all hover:opacity-80"
                    onClick={() => handleCopyUrl(selected)}
                    title="برای کپی کلیک کنید"
                  >
                    {toAbsoluteUrl(selected.url)}
                  </button>
                  {copied === selected.id && (
                    <div className="text-xs text-green-600 mt-1">
                      آدرس کامل کپی شد ✓
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                  <Link
                    href={`/media/editor/${selected.id}`}
                    className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
                  >
                    ویرایش
                  </Link>

                  <a
                    href={toAbsoluteUrl(selected.url)}
                    target="_blank"
                    className="text-black px-4 py-2 rounded-xl border hover:bg-gray-50"
                    rel="noreferrer"
                  >
                    باز کردن فایل
                  </a>

                  <button
                    onClick={() => handleDelete(selected)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                    title="حذف مدیا"
                  >
                    {deleting ? "در حال حذف..." : "حذف"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

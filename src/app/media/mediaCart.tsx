"use client";

import type { SimpleMediaType } from "@/server/modules/media/enums/media.enums";
import Link from "next/link";
import { useMemo, useState } from "react";

type MediaDTO = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  type: SimpleMediaType;
  createdAt: string;
  updatedAt: string;
};
export function MediaGrid({ items }: { items: MediaDTO[] }) {
  const [selected, setSelected] = useState<MediaDTO | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const gridItems = useMemo(
    () => items?.slice() ?? [],
    [items]
  );

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {gridItems.map((m) => (
          <button
            key={m.id}
            className="border rounded-xl p-2 text-left hover:shadow transition bg-white"
            onClick={() => setSelected(m)}
            title={m.name}
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <video src={m.url} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="line-clamp-1 text-sm font-medium text-black">{m.name}</div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selected ? (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-[92vw] max-w-2xl rounded-2xl p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">جزییات مدیا</h2>
              <button
                className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                onClick={() => setSelected(null)}
              >
                بستن
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {selected.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.url}
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={selected.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">نام</div>
                  <div className="font-medium text-black break-words">{selected.name}</div>
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
                    className="w-full text-left text-blue-700 underline break-all hover:opacity-80"
                    onClick={async () => {
                      await navigator.clipboard.writeText(selected.url);
                      setCopied(selected.id);
                      setTimeout(() => setCopied(null), 1200);
                    }}
                    title="برای کپی کلیک کنید"
                  >
                    {selected.url}
                  </button>
                  {copied === selected.id && (
                    <div className="text-xs text-green-600 mt-1">آدرس کپی شد ✓</div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/media/editor/${selected.id}`}
                    className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
                  >
                    ویرایش
                  </Link>
                  <a
                    href={selected.url}
                    target="_blank"
                    className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                    rel="noreferrer"
                  >
                    باز کردن فایل
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

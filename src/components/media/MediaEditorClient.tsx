"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";

export type MediaType = "image" | "video";

export type MediaDTO = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  type: MediaType;
  createdAt: string;
  updatedAt: string;
};

export type TempUpload = {
  tempId: string;
  url: string;
  path: string;
  mime?: string;
  size?: number;
};

export default function MediaEditorClient({
  initialId,
  initialRecord,
}: {
  initialId: string | null;
  initialRecord: MediaDTO | null;
}) {
  const router = useRouter();

  const id = initialId;
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [type, setType] = useState<MediaType>("image");
  const [description, setDescription] = useState("");

  const [temp, setTemp] = useState<TempUpload | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [record, setRecord] = useState<MediaDTO | null>(initialRecord);

  const [loading, setLoading] = useState<boolean>(isEdit && !initialRecord);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasUnsavedTempRef = useRef<boolean>(false);

  useEffect(() => {
    if (initialRecord) {
      setRecord(initialRecord);
      setName(initialRecord.name ?? "");
      setType((initialRecord.type as MediaType) ?? "image");
      setDescription(initialRecord.description ?? "");
      setTemp(null);
    }
  }, [initialRecord?.id]);

  useEffect(() => {
    if (!isEdit || !id || initialRecord) return;
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/media/${id}`, { cache: "no-store" });
        if (res.status === 404) throw new Error("آیتم مدیا پیدا نشد");
        if (!res.ok) throw new Error("خطا در دریافت آیتم");

        const data = (await res.json()) as MediaDTO;
        if (!active) return;

        setRecord(data);
        setName(data.name ?? "");
        setType((data.type as MediaType) ?? "image");
        setDescription(data.description ?? "");
        setTemp(null);
      } catch (e: any) {
        if (active) setError(e?.message || "خطا در دریافت آیتم");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, isEdit, initialRecord]);

  useEffect(() => {
    hasUnsavedTempRef.current = !!temp && !saving;
  }, [temp, saving]);

  useEffect(() => {
    const cleanTemp = async () => {
      if (hasUnsavedTempRef.current && temp?.tempId) {
        try {
          await fetch(`/api/upload-temp/${encodeURIComponent(temp.tempId)}`, {
            method: "DELETE",
          });
        } catch {
          // silent
        }
      }
    };

    const onBeforeUnload = () => {};

    const onPageHide = () => {
      cleanTemp();
    };

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      cleanTemp();
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload as any);
    };
  }, [temp?.tempId]);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const file = files[0];

    const isImg = file.type.startsWith("image/");
    const isVid = file.type.startsWith("video/");
    if (!isImg && !isVid) {
      alert("فقط تصویر یا ویدئو مجاز است");
      return;
    }
    setType(isImg ? "image" : "video");

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const xhr = new XMLHttpRequest();
      const promise = new Promise<Response>((resolve, reject) => {
        xhr.open("POST", "/api/upload-temp");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const p = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(p);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(
              new Response(xhr.responseText, {
                status: xhr.status,
                headers: new Headers({
                  "Content-Type":
                    xhr.getResponseHeader("Content-Type") || "application/json",
                }),
              })
            );
          } else {
            reject(new Error(xhr.responseText || "خطا در آپلود"));
          }
        };
        xhr.onerror = () => reject(new Error("ارتباط با سرور قطع شد"));
        xhr.send(form);
      });

      const res = await promise;
      if (!res.ok) throw new Error("خطا در آپلود");

      const data = (await res.json()) as TempUpload;
      setTemp(data);
      hasUnsavedTempRef.current = true;
    } catch (e: any) {
      setError(e?.message || "آپلود ناموفق بود");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await handleFiles(e.dataTransfer.files);
  };

  const preventDefault = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("نام الزامی است");
      return;
    }

    const finalUrl = temp?.url ?? record?.url;
    if (!finalUrl) {
      alert("ابتدا فایل را آپلود کنید");
      return;
    }

    const payload = {
      name: name.trim(),
      url: finalUrl,
      type,
      description: description.trim() ? description.trim() : null,
    };

    try {
      setSaving(true);
      setError(null);

      const url = isEdit ? `/api/media/${record?.id}` : `/api/media`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "خطا در ذخیره");
      }

      if (!isEdit) {
        const saved = (await res.json()) as MediaDTO;
        hasUnsavedTempRef.current = false;
        setTemp(null);
        router.push(`/media`);
        return;
      }

      hasUnsavedTempRef.current = false;
      setTemp(null);

      alert("ذخیره شد ✅");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemp = async () => {
    if (!temp?.tempId) return;
    try {
      await fetch(`/api/upload-temp/${encodeURIComponent(temp.tempId)}`, {
        method: "DELETE",
      });
    } catch {}
    setTemp(null);
    hasUnsavedTempRef.current = false;
  };

  const previewUrl = temp?.url ?? record?.url ?? null;

  if (loading) {
    return <div className="mx-20 my-10">در حال بارگذاری…</div>;
  }

  return (
    <main className="pb-24 pt-10 px-4 2xl:pb-28" dir="rtl">
      <div className="mx-auto w-full max-w-[92rem] 2xl:max-w-[110rem]">
        <Breadcrumb
          items={[
            { label: "مای پراپ", href: "/" },
            { label: "مدیا", href: "/admin/media" },
            { label: "افزودن/ویرایش مدیا", href: "/admin/media/editor" },
          ]}
        />

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 2xl:gap-8 pt-8">
          <div className="md:col-span-5 2xl:col-span-5 space-y-4">
            <div
              onDrop={onDrop}
              onDragOver={preventDefault}
              onDragEnter={preventDefault}
              onDragLeave={preventDefault}
              className="border-2 border-dashed rounded-2xl p-4 sm:p-6 2xl:p-8 flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[220px] 2xl:min-h-[260px] bg-gray-50"
            >
              {previewUrl ? (
                <div className="w-full">
                  <div className="rounded-xl overflow-hidden bg-gray-100 mb-3 aspect-square 2xl:aspect-[16/10]">
                    {type === "image" ? (
                      <img
                        src={previewUrl}
                        alt={name || "preview"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-2">
                    <button
                      type="button"
                      className="text-black px-3 py-2 rounded-lg border hover:bg-gray-100"
                      onClick={() => {
                        if (previewUrl)
                          navigator.clipboard.writeText(previewUrl);
                        alert("آدرس کپی شد!");
                      }}
                    >
                      کپی آدرس
                    </button>
                    {temp ? (
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                        onClick={handleDeleteTemp}
                      >
                        حذف فایل موقت
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-black px-3 py-2 rounded-lg border hover:bg-gray-100"
                        onClick={handlePickFile}
                      >
                        جایگزینی فایل…
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-gray-700">فایل را اینجا دراپ کنید</div>
                  <div className="text-xs text-gray-500">
                    فقط تصویر یا ویدئو
                  </div>
                  <button
                    type="button"
                    onClick={handlePickFile}
                    className="px-3 py-2 rounded-lg border hover:bg-gray-100 text-gray-700"
                  >
                    انتخاب فایل…
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*,video/*"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {uploading && (
              <div className="w-full">
                <div className="text-sm mb-1">در حال آپلود…</div>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-black rounded"
                    style={{
                      width: `${uploadProgress ?? 0}%`,
                      transition: "width .2s",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-7 2xl:col-span-7">
            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-t p-3 flex items-center gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setName("");
                  setDescription("");
                  setType("image");
                  if (temp) handleDeleteTemp();
                }}
              >
                پاک‌سازی
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                disabled={saving || uploading}
              >
                {saving ? "در حال ذخیره…" : isEdit ? "ثبت تغییرات" : "ثبت مدیا"}
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 2xl:p-8 space-y-5"
            >
              <div>
                <label className="block text-sm text-black mb-2">نام</label>
                <input
                  className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: کاور مقاله بازار"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-black mb-2">نوع</label>
                <select
                  className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={type}
                  onChange={(e) => setType(e.target.value as MediaType)}
                >
                  <option value="image">تصویر</option>
                  <option value="video">ویدئو</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-black mb-2">توضیح</label>
                <textarea
                  className="w-full min-h-[120px] 2xl:min-h-[160px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیح کوتاه (اختیاری)…"
                  maxLength={1000}
                />
              </div>

              <div className="hidden md:flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setName("");
                    setDescription("");
                    setType("image");
                    if (temp) handleDeleteTemp();
                  }}
                >
                  پاک‌سازی
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                  disabled={saving || uploading}
                >
                  {saving
                    ? "در حال ذخیره…"
                    : isEdit
                    ? "ثبت تغییرات"
                    : "ثبت مدیا"}
                </button>
              </div>
            </form>

            <div className="h-16 md:h-0" />
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type MediaType = "image" | "video";

type MediaDTO = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  type: MediaType;
  createdAt: string;
  updatedAt: string;
};

type TempUpload = {
  tempId: string; 
  url: string; 
  path: string; 
  mime?: string;
  size?: number;
};

export default function MediaEditorPage() {
  const params = useParams<{ id?: string[] }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id =
    Array.isArray(params?.id) && params.id.length ? params.id[0] : null;
  const isEdit = !!id;

  // فرم ساده
  const [name, setName] = useState("");
  const [type, setType] = useState<MediaType>("image");
  const [description, setDescription] = useState("");

  // فایل و آپلود موقت
  const [temp, setTemp] = useState<TempUpload | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // رکورد موجود (در حالت ویرایش)
  const [record, setRecord] = useState<MediaDTO | null>(null);

  // وضعیت‌ها
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasUnsavedTempRef = useRef<boolean>(false); // برای Cleanup

  // لود رکورد در حالت ویرایش
  useEffect(() => {
    if (!isEdit || !id) return;
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
        // در حالت ویرایش، پیش‌نمایش از url رکورد
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
  }, [id, isEdit]);

  // Cleanup فایل موقت روی خروج/تعویض صفحه (وقتی رکورد نهایی ثبت نشده)
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

    // هنگام بسته شدن تب/رفرش
    const onBeforeUnload = () => {
      // sync call امکان‌پذیر نیست؛ بعضی مرورگرها ignore می‌کنند.
      // ما بهتره از navigator.sendBeacon استفاده کنیم اگر بک‌اند ساپورت کند.
    };

    const onPageHide = () => {
      // pagehide در موبایل/سافاری بهتر از beforeunload جواب می‌دهد
      // تلاش async برای پاک کردن
      cleanTemp();
    };

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      // روی Unmount هم پاک کن
      cleanTemp();
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temp?.tempId]);

  // Handler: انتخاب فایل (کلیک یا دراپ)
  const handlePickFile = () => fileInputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const file = files[0];

    // محدودیت ساده نوع فایل برای UX (سمت بک‌اند هم باید چک شود)
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
      // آپلود موقت
      const form = new FormData();
      form.append("file", file);

      // برای نمایش Progress، باید از XHR استفاده کنیم
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
            // Response رو به شکل Response-like بسازیم
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
      hasUnsavedTempRef.current = true; // هنوز ثبت دیتابیس نشده
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

  // ذخیره نهایی: اگر temp وجود دارد => از temp.url استفاده کنیم
  const handleSave = async () => {
    if (!name.trim()) {
      alert("نام الزامی است");
      return;
    }

    // اگر آپلود موقت داریم، از همون URL استفاده می‌کنیم
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

      // اگر جدید ساختیم، می‌تونی ریدایرکت کنی به صفحه‌ی ادیت
      if (!isEdit) {
        const saved = (await res.json()) as MediaDTO;
        // در این نقطه: فایل موقت تبدیل به فایل نهایی شده؛
        // پیشنهاد: در بک‌اند با move/rename از temp به مقصد دائم این کار را انجام بده
        hasUnsavedTempRef.current = false; // دیگه فایل موقت نداریم
        setTemp(null);
        router.push(`/media/editor/${saved.id}`);
        return;
      }

      // ویرایش موفق
      hasUnsavedTempRef.current = false;
      setTemp(null);

      // TODO (اختیاری): اگر فایل قبلی رکورد با فایل جدید جایگزین شده،
      // می‌تونی اینجا درخواست پاک‌سازی فایل قبلی را هم به بک‌اند بزنی.
      // await fetch("/api/files", { method: "DELETE", body: JSON.stringify({ path: record?.url }) })

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
    <main className="pb-24 pt-6 px-20" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {isEdit ? "ویرایش مدیا" : "افزودن مدیا"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ستون آپلود/پیش‌نمایش */}
        <div className="md:col-span-5 space-y-4">
          <div
            onDrop={onDrop}
            onDragOver={preventDefault}
            onDragEnter={preventDefault}
            onDragLeave={preventDefault}
            className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[220px] bg-gray-50"
          >
            {previewUrl ? (
              <div className="w-full">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                  {type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg border hover:bg-gray-100"
                    onClick={() => {
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
                      className="px-3 py-2 rounded-lg border hover:bg-gray-100"
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
                <div className="text-xs text-gray-500">فقط تصویر یا ویدئو</div>
                <button
                  type="button"
                  onClick={handlePickFile}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-100"
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

        {/* ستون فرم متادیتا */}
        <div className="md:col-span-7">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="bg-white rounded-2xl shadow-sm border p-6 space-y-5"
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
                className="w-full min-h-[120px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیح کوتاه (اختیاری)…"
                maxLength={1000}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setName("");
                  setDescription("");
                  setType("image");
                  // فایل موقت را هم پاک کن
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
                {saving ? "در حال ذخیره…" : isEdit ? "ثبت تغییرات" : "ثبت مدیا"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

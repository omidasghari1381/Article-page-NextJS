"use client";

import React, { useEffect, useState } from "react";

type TagDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type Props = {
  initialRecord: TagDTO | null;
  onSave: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

export default function TagFormClient({ initialRecord, onSave, onDelete }: Props) {
  const isEdit = !!initialRecord?.id;

  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState<boolean>(false);

  useEffect(() => {
    if (initialRecord) {
      setForm({
        name: initialRecord.name ?? "",
        slug: initialRecord.slug ?? "",
        description: initialRecord.description ?? "",
      });
    } else {
      setForm({ name: "", slug: "", description: "" });
    }
  }, [initialRecord?.id]);

  const slugify = (s: string) =>
    s
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\u0600-\u06FF]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/\-+/g, "-")
      .replace(/^\-+|\-+$/g, "");

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (field === "name") {
        setForm((f) => {
          const next: any = { ...f, name: val };
          if (!slugTouched) next.slug = slugify(val);
          return next;
        });
      } else if (field === "slug") {
        setSlugTouched(true);
        setForm((f) => ({ ...f, slug: slugify(val) }));
      } else {
        setForm((f) => ({ ...f, [field]: val }));
      }
    };

  const onSaveFormAction = async (formData: FormData) => {
    setSaving(true);
    setError(null);
    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    if (!name || !slug) {
      setSaving(false);
      setError("نام و اسلاگ الزامی است.");
      return;
    }
    await onSave(formData);
  };

  const onDeleteFormAction = async (formData: FormData) => {
    if (!isEdit || !initialRecord?.id) return;
    setDeleting(true);
    await onDelete(formData);
  };

  return (
    <section className="w-full">
      <form
        action={onSaveFormAction}
        className="bg-skin-bg rounded-2xl shadow-sm border border-skin-border p-6 md:p-8 w-full mx-auto"
        dir="rtl"
      >
        {error && (
          <div className="mb-4 rounded border border-red-500 bg-red-900/20 p-3 text-red-300">
            {error}
          </div>
        )}

        {isEdit ? <input type="hidden" name="id" value={initialRecord!.id} /> : null}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-6">
            <div>
              <label className="block text-sm text-skin-muted mb-2">نام تگ</label>
              <input
                name="name"
                type="text"
                className="w-full rounded-lg border border-skin-border text-skin-base bg-skin-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
                placeholder="مثلاً: پرایس‌اکشن"
                value={form.name}
                onChange={handleChange("name")}
              />
            </div>

            <div>
              <label className="block text-sm text-skin-muted mb-2">اسلاگ</label>
              <input
                name="slug"
                type="text"
                className="w-full rounded-lg border border-skin-border text-skin-base bg-skin-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70 ltr"
                placeholder="masalan: price-action"
                value={form.slug}
                onChange={handleChange("slug")}
              />
              <p className="text-xs text-skin-muted mt-1">اگر خالی بماند، از روی نام ساخته می‌شود (حروف کوچک و خط تیره).</p>
            </div>
          </div>

          <div className="md:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-skin-muted mb-2">توضیح</label>
                <CharCounter value={form.description} max={600} />
              </div>
              <textarea
                name="description"
                className="w-full min-h-[140px] text-skin-base rounded-lg border border-skin-border bg-skin-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
                placeholder="توضیح کوتاه برای این تگ (اختیاری)…"
                value={form.description}
                onChange={handleChange("description")}
                maxLength={600}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-skin-border text-skin-base hover:bg-skin-card"
                onClick={() => {
                  setForm({ name: "", slug: "", description: "" });
                  setSlugTouched(false);
                }}
              >
                پاک‌سازی
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-skin-accent text-white hover:bg-skin-accent/90 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "در حال ذخیره…" : isEdit ? "ثبت تغییرات" : "ثبت تگ"}
              </button>

              <form action={onDeleteFormAction} className="contents">
                <input type="hidden" name="id" value={initialRecord?.id || ""} />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                  disabled={deleting || !isEdit}
                  onClick={(e) => {
                    if (!confirm("آیا از حذف این تگ مطمئن هستید؟")) {
                      e.preventDefault();
                    }
                  }}
                >
                  {deleting ? "در حال حذف..." : "حذف تگ"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value?.length || 0;
  const danger = len > max * 0.9;
  return <span className={`text-xs ${danger ? "text-red-400" : "text-skin-muted"}`}>{len}/{max}</span>;
}
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TagDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type TagCreatePayload = {
  name: string;
  slug: string;
  description?: string | null;
};

export default function TagFormClient({ initialRecord }: { initialRecord: TagDTO | null }) {
  const router = useRouter();

  const isEdit = !!initialRecord?.id;

  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState<boolean>(false);

  useEffect(() => {
    if (initialRecord) {
      setForm({ name: initialRecord.name ?? "", slug: initialRecord.slug ?? "", description: initialRecord.description ?? "" });
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

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleDelete = async () => {
    if (!isEdit || !initialRecord?.id) return;
    if (!confirm("آیا از حذف این تگ مطمئن هستید؟")) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/tags`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initialRecord.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.message || "حذف تگ ناموفق بود.");
        return;
      }

      alert("تگ با موفقیت حذف شد.");
      router.push("/tags");
    } catch (err) {
      alert("مشکل در ارتباط با سرور");
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "نام الزامی است.";
    if (!form.slug.trim()) errs.slug = "اسلاگ الزامی است.";

    if (Object.keys(errs).length) {
      alert(Object.values(errs).join("\n"));
      return;
    }

    const payload: TagCreatePayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description?.trim() ? form.description.trim() : null,
    };

    try {
      setSaving(true);
      setError(null);

      const url = isEdit ? `/api/tags/${initialRecord?.id}` : `/api/tags`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "خطا در ذخیره تگ");
      }

      alert(isEdit ? "تغییرات ثبت شد ✅" : "تگ با موفقیت ایجاد شد ✅");
      isEdit ? router.refresh() : router.push("/tags");
    } catch (err: any) {
      setError(err?.message || "خطایی رخ داد");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mx-20 my-10">در حال بارگذاری…</div>;

  return (
    <section className="w-full">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 w-full mx-auto" dir="rtl">
        {error && <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-6">
            <div>
              <label className="block text-sm text-black mb-2">نام تگ</label>
              <input type="text" className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="مثلاً: پرایس‌اکشن" value={form.name} onChange={handleChange("name")} />
            </div>

            <div>
              <label className="block text-sm text-black mb-2">اسلاگ</label>
              <input type="text" className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr" placeholder="masalan: price-action" value={form.slug} onChange={handleChange("slug")} />
              <p className="text-xs text-gray-400 mt-1">اگر خالی بماند، از روی نام ساخته می‌شود (حروف کوچک و خط تیره).</p>
            </div>
          </div>

          <div className="md:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-black mb-2">توضیح</label>
                <CharCounter value={form.description} max={600} />
              </div>
              <textarea className="w-full min-h-[140px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="توضیح کوتاه برای این تگ (اختیاری)…" value={form.description} onChange={handleChange("description")} maxLength={600} />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50" onClick={() => { setForm({ name: "", slug: "", description: "" }); setSlugTouched(false); }}>پاک‌سازی</button>

              <button type="submit" className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50" disabled={saving}>{saving ? "در حال ذخیره…" : isEdit ? "ثبت تغییرات" : "ثبت تگ"}</button>

              <button type="button" onClick={handleDelete} className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50" disabled={deleting || !isEdit}>{deleting ? "در حال حذف..." : "حذف تگ"}</button>
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
  return (
    <span className={`text-xs ${danger ? "text-red-500" : "text-gray-400"}`}>{len}/{max}</span>
  );
}

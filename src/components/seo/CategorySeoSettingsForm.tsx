"use client";

import { useEffect, useMemo, useState } from "react";

type RobotsSetting =
  | "index,follow"
  | "noindex,follow"
  | "index,nofollow"
  | "noindex,nofollow";
type TwitterCardType = "summery" | "summery_large_image";

export type SeoMetaPayload = {
  useAuto: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  robots: RobotsSetting | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterCard: TwitterCardType | null;
  publishedTime: string | null;
  modifiedTime: string | null;
  authorName: string | null;
  tags: string[] | null;
};

type Props = {
  categoryId: string | null;
  locale?: string;
};

const API_BASE = "/api/seo/";

export default function CategorySeoSettingsForm({
  categoryId,
  locale = "",
}: Props) {
  const entityType = "category";
  const disabled = !categoryId;

  const [loading, setLoading] = useState<boolean>(!!categoryId);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState<boolean>(false);

  const [form, setForm] = useState<SeoMetaPayload>({
    useAuto: true,
    seoTitle: null,
    seoDescription: null,
    canonicalUrl: null,
    robots: null,
    ogTitle: null,
    ogDescription: null,
    ogImageUrl: null,
    twitterCard: "summery_large_image",
    publishedTime: null,
    modifiedTime: null,
    authorName: null,
    tags: null,
  });

  useEffect(() => {
    let active = true;
    if (!categoryId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const qs = new URLSearchParams({
          entityType,
          entityId: categoryId,
          locale,
        }).toString();
        const res = await fetch(`${API_BASE}?${qs}`, { cache: "no-store" });
        if (res.status === 404) {
          if (!active) return;
          setExists(false);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("خطا در دریافت تنظیمات سئو");
        const data = await res.json();
        if (!active) return;
        setExists(true);
        setForm({
          useAuto: !!data.useAuto,
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
          canonicalUrl: data.canonicalUrl ?? null,
          robots: data.robots ?? null,
          ogTitle: data.ogTitle ?? null,
          ogDescription: data.ogDescription ?? null,
          ogImageUrl: data.ogImageUrl ?? null,
          twitterCard: data.twitterCard ?? "summery_large_image",
          publishedTime: data.publishedTime ?? null,
          modifiedTime: data.modifiedTime ?? null,
          authorName: data.authorName ?? null,
          tags: Array.isArray(data.tags) ? data.tags : null,
        });
      } catch (e: any) {
        if (active) setError(e?.message || "خطا در بارگیری تنظیمات سئو");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [categoryId, locale]);

  const handleChange =
    <K extends keyof SeoMetaPayload>(key: K) =>
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | boolean
        | string[]
    ) => {
      setForm((f) => {
        if (typeof e === "boolean") return { ...f, [key]: e } as any;
        if (Array.isArray(e)) return { ...f, [key]: e } as any;
        return {
          ...f,
          [key]: (e.target as HTMLInputElement).value || null,
        } as any;
      });
    };

  const tagsText = useMemo(() => (form.tags ?? []).join(", "), [form.tags]);
  const setTagsText = (txt: string) => {
    const arr = txt
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((f) => ({ ...f, tags: arr.length ? arr : null }));
  };

  const onSave = async () => {
    if (!categoryId) return;
    try {
      setSaving(true);
      setError(null);
      const payload = { ...form, entityType, entityId: categoryId, locale };
      const method = exists ? "PATCH" : "POST";
      const res = await fetch(API_BASE, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "خطا در ذخیره تنظیمات سئو");
      }
      if (!exists) setExists(true);
      alert("تنظیمات سئو دسته با موفقیت ذخیره شد ✅");
    } catch (e: any) {
      setError(e?.message || "خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!categoryId) return;
    if (!confirm("تنظیمات سئوی این دسته حذف شود؟")) return;
    try {
      setDeleting(true);
      setError(null);
      const qs = new URLSearchParams({
        entityType,
        entityId: categoryId,
        locale,
      }).toString();
      const res = await fetch(`${API_BASE}?${qs}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "حذف تنظیمات ناموفق بود");
      }
      setExists(false);
      setForm({
        useAuto: true,
        seoTitle: null,
        seoDescription: null,
        canonicalUrl: null,
        robots: null,
        ogTitle: null,
        ogDescription: null,
        ogImageUrl: null,
        twitterCard: "summery_large_image",
        publishedTime: null,
        modifiedTime: null,
        authorName: null,
        tags: null,
      });
      alert("تنظیمات سئو دسته حذف شد ✅");
    } catch (e: any) {
      setError(e?.message || "خطا در حذف تنظیمات");
    } finally {
      setDeleting(false);
    }
  };

  const isFieldsDisabled = form.useAuto;

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8" dir="rtl">
      {!categoryId && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-amber-800">
          برای تنظیم سئو، ابتدا <b>دسته</b> را ذخیره کنید تا شناسه (ID) داشته
          باشد.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div>در حال بارگذاری تنظیمات سئو…</div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input
                id="seo-use-auto"
                type="checkbox"
                className="h-4 w-4"
                checked={!!form.useAuto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, useAuto: e.target.checked }))
                }
                disabled={disabled}
              />
              <label htmlFor="seo-use-auto" className="text-sm text-black">
                استفاده از مقادیر خودکار (پیشنهادی)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 rounded-lg border text-red-600 hover:bg-red-50 disabled:opacity-50"
                disabled={disabled || deleting || !exists}
              >
                {deleting ? "در حال حذف…" : "حذف تنظیمات"}
              </button>
              <button
                type="button"
                onClick={onSave}
                className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                disabled={disabled || saving}
              >
                {saving ? "در حال ذخیره…" : "ذخیره تنظیمات سئو"}
              </button>
            </div>
          </div>

          {/* بقیه UI بدون تغییر منطقی/استایلی — همان نسخه قبلی شما */}
        </>
      )}
    </div>
  );
}

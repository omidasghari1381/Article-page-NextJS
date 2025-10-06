"use client";

import { useEffect, useMemo, useState } from "react";

type SeoEntityType = "article" | "category";
type RobotsSetting =
  | "index,follow"
  | "noindex,follow"
  | "index,nofollow"
  | "noindex,nofollow";
type TwitterCardType = "summery" | "summery_large_image";

export type SeoMetaPayload = {
  useAuto: boolean;

  // SEO Basics
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  robots: RobotsSetting | null;

  // Open Graph
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;

  // Twitter
  twitterCard: TwitterCardType | null;

  // Article-like meta
  publishedTime: string | null; // ISO string
  modifiedTime: string | null; // ISO string
  authorName: string | null;

  // Tags
  tags: string[] | null;
};

type Props = {
  entityType: SeoEntityType;
  entityId: string | null; // اگر null باشد (هنوز مقاله ذخیره نشده)، فرم غیرفعال می‌شود
  locale?: string; // پیش‌فرض: ""
};

export default function SeoSettingsForm({
  entityType,
  entityId,
  locale = "",
}: Props) {
  const disabled = !entityId;

  const [loading, setLoading] = useState<boolean>(!!entityId);
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

  // --- Load Existing SEO (if entityId present) ---
  useEffect(() => {
    let active = true;
    if (!entityId) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const qs = new URLSearchParams({
          entityType,
          entityId,
          locale,
        }).toString();

        const res = await fetch(`/api/seo/?${qs}`, { cache: "no-store" });
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
  }, [entityType, entityId, locale]);

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
        return { ...f, [key]: e.target.value || null } as any;
      });
    };

  const tagsText = useMemo(
    () => (form.tags ?? []).join(", "),
    [form.tags]
  );

  const setTagsText = (txt: string) => {
    const arr = txt
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((f) => ({ ...f, tags: arr.length ? arr : null }));
  };

  const onSave = async () => {
    if (!entityId) return;
    try {
      setSaving(true);
      setError(null);

      const payload = { ...form, entityType, entityId, locale };
      const url = `/api/seo`;
      const method = exists ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "خطا در ذخیره تنظیمات سئو");
      }

      if (!exists) setExists(true);
      alert("تنظیمات سئو با موفقیت ذخیره شد ✅");
    } catch (e: any) {
      setError(e?.message || "خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!entityId) return;
    if (!confirm("تنظیمات سئو حذف شود؟ این عمل قابل بازگشت نیست.")) return;

    try {
      setDeleting(true);
      setError(null);

      const qs = new URLSearchParams({
        entityType,
        entityId,
        locale,
      }).toString();

      const res = await fetch(`/api/seo/?${qs}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "حذف تنظیمات ناموفق بود");
      }

      setExists(false);
      setForm((f) => ({
        ...f,
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
      }));
      alert("تنظیمات سئو حذف شد ✅");
    } catch (e: any) {
      setError(e?.message || "خطا در حذف تنظیمات");
    } finally {
      setDeleting(false);
    }
  };

  const isFieldsDisabled = form.useAuto; // وقتی خودکار روشن است، فیلدها غیرفعال می‌شن (Override دستی خاموش)

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8" dir="rtl">
      {disabled && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-amber-800">
          برای تنظیم سئو، ابتدا مقاله را ذخیره کنید تا شناسه (ID) داشته باشد.
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
                onChange={(e) => setForm((f) => ({ ...f, useAuto: e.target.checked }))}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="lg:col-span-7 space-y-6">
              {/* SEO Basics */}
              <fieldset className="space-y-4">
                <legend className="font-medium text-black">SEO Basics</legend>

                <LabeledInput
                  label="SEO Title"
                  placeholder="اگر خالی باشد از عنوان مقاله استفاده می‌شود"
                  value={form.seoTitle ?? ""}
                  onChange={handleChange("seoTitle")}
                  max={60}
                  disabled={disabled || isFieldsDisabled}
                />

                <LabeledTextarea
                  label="Meta Description"
                  placeholder="اگر خالی باشد از خلاصه/متن مقاله ساخته می‌شود"
                  value={form.seoDescription ?? ""}
                  onChange={handleChange("seoDescription")}
                  max={180}
                  disabled={disabled || isFieldsDisabled}
                />

                <LabeledInput
                  label="Canonical URL"
                  placeholder="https://example.com/article/slug"
                  value={form.canonicalUrl ?? ""}
                  onChange={handleChange("canonicalUrl")}
                  disabled={disabled || isFieldsDisabled}
                />

                <LabeledSelect
                  label="Robots"
                  value={form.robots ?? ""}
                  onChange={handleChange("robots")}
                  options={[
                    { label: "پیش‌فرض (خالی)", value: "" },
                    { label: "index,follow", value: "index,follow" },
                    { label: "noindex,follow", value: "noindex,follow" },
                    { label: "index,nofollow", value: "index,nofollow" },
                    { label: "noindex,nofollow", value: "noindex,nofollow" },
                  ]}
                  disabled={disabled || isFieldsDisabled}
                />
              </fieldset>

              {/* Twitter */}
              <fieldset className="space-y-4">
                <legend className="font-medium text-black">Twitter</legend>
                <LabeledSelect
                  label="Twitter Card"
                  value={form.twitterCard ?? "summery_large_image"}
                  onChange={handleChange("twitterCard")}
                  options={[
                    { label: "summery_large_image", value: "summery_large_image" },
                    { label: "summery", value: "summery" },
                  ]}
                  disabled={disabled || isFieldsDisabled}
                />
              </fieldset>

              {/* Article-like meta */}
              <fieldset className="space-y-4">
                <legend className="font-medium text-black">Article Meta</legend>
                <LabeledInput
                  label="Author Name"
                  value={form.authorName ?? ""}
                  onChange={handleChange("authorName")}
                  disabled={disabled || isFieldsDisabled}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledInput
                    label="Published Time (ISO)"
                    placeholder="2025-09-30T12:00:00.000Z"
                    value={form.publishedTime ?? ""}
                    onChange={handleChange("publishedTime")}
                    disabled={disabled || isFieldsDisabled}
                  />
                  <LabeledInput
                    label="Modified Time (ISO)"
                    placeholder="2025-09-30T12:00:00.000Z"
                    value={form.modifiedTime ?? ""}
                    onChange={handleChange("modifiedTime")}
                    disabled={disabled || isFieldsDisabled}
                  />
                </div>

                <LabeledInput
                  label="Tags (comma separated)"
                  value={tagsText}
                  onChange={(e) => setTagsText((e.target as HTMLInputElement).value)}
                  disabled={disabled || isFieldsDisabled}
                />
              </fieldset>
            </div>

            <div className="lg:col-span-5 space-y-6">
              {/* Open Graph */}
              <fieldset className="space-y-4">
                <legend className="font-medium text-black">Open Graph</legend>

                <LabeledInput
                  label="OG Title"
                  placeholder="اگر خالی باشد از SEO Title استفاده می‌شود"
                  value={form.ogTitle ?? ""}
                  onChange={handleChange("ogTitle")}
                  max={70}
                  disabled={disabled || isFieldsDisabled}
                />

                <LabeledTextarea
                  label="OG Description"
                  placeholder="اگر خالی باشد از Meta Description استفاده می‌شود"
                  value={form.ogDescription ?? ""}
                  onChange={handleChange("ogDescription")}
                  max={200}
                  disabled={disabled || isFieldsDisabled}
                />

                <LabeledInput
                  label="OG Image URL"
                  placeholder="https://... (از سیستم مدیا)"
                  value={form.ogImageUrl ?? ""}
                  onChange={handleChange("ogImageUrl")}
                  disabled={disabled || isFieldsDisabled}
                />

                <div className="rounded-xl border border-gray-200 overflow-hidden h-[160px] flex items-center justify-center bg-gray-50">
                  {form.ogImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.ogImageUrl}
                      alt="OG preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-gray-400">
                      پیش‌نمایش تصویر OG
                    </div>
                  )}
                </div>
              </fieldset>

              {/* SERP Preview */}
              <fieldset className="space-y-3">
                <legend className="font-medium text-black">پیش‌نمایش SERP</legend>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-[#1a0dab] text-[18px] leading-6 truncate">
                    {form.seoTitle || "عنوان صفحه (نمونه)"}
                  </div>
                  <div className="text-[#006621] text-[12px] mt-1 truncate">
                    {form.canonicalUrl || "https://example.com/article/slug"}
                  </div>
                  <div className="text-[#545454] text-[13px] mt-1 line-clamp-2">
                    {form.seoDescription ||
                      "توضیحات متا حداکثر حدود ۱۵۰–۱۶۰ کاراکتر، برای جذب کلیک بهتر."}
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** ---------- UI helpers (local) ---------- */

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value?.length || 0;
  const danger = len > max * 0.9;
  return (
    <span className={`text-xs ${danger ? "text-red-500" : "text-gray-400"}`}>
      {len}/{max}
    </span>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  max,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: any) => void;
  placeholder?: string;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm text-black mb-2">{label}</label>
        {typeof value === "string" && max ? <CharCounter value={value} max={max} /> : null}
      </div>
      <input
        type="text"
        className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60"
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        maxLength={max}
        disabled={disabled}
      />
    </div>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  placeholder,
  max,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: any) => void;
  placeholder?: string;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm text-black mb-2">{label}</label>
        {typeof value === "string" && max ? <CharCounter value={value} max={max} /> : null}
      </div>
      <textarea
        className="w-full min-h-[100px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60"
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        maxLength={max}
        disabled={disabled}
      />
    </div>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: any) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-black mb-2">{label}</label>
      <select
        className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60"
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

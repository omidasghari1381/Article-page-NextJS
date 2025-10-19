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
  initialData?: SeoMetaPayload | null;
  initialExists?: boolean;
};

const API_BASE = "/api/seo/";

export default function CategorySeoSettingsForm({
  categoryId,
  locale = "",
  initialData = null,
  initialExists = false,
}: Props) {
  const entityType = "category";
  const disabled = !categoryId;
  const [loading, setLoading] = useState<boolean>(
    !!categoryId && !initialExists
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState<boolean>(!!initialExists);
  const [form, setForm] = useState<SeoMetaPayload>(
    initialData ?? {
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
    }
  );

  useEffect(() => {
    let active = true;
    if (!categoryId) return;
    if (initialData) return;
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
  }, [categoryId, locale, initialData]);

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
    <div
      className="bg-white dark:bg-skin-card rounded-2xl shadow-sm border border-gray-200 dark:border-skin-border p-4 sm:p-6 lg:p-8 transition-colors"
      dir="rtl"
    >
      {!categoryId && (
        <div className="mb-4 rounded-xl border border-amber-300 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-400/10 p-3 sm:p-4 text-amber-800 dark:text-amber-200 text-sm">
          برای تنظیم سئو، ابتدا دسته را ذخیره کنید تا شناسه داشته باشد.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-300 dark:border-red-400/40 bg-red-50 dark:bg-red-400/10 p-3 sm:p-4 text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/85 dark:bg-skin-card/85 backdrop-blur border-t border-gray-200 dark:border-skin-border p-3 flex items-center justify-between gap-2 transition-colors">
        <button
          type="button"
          onClick={onDelete}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-skin-border text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
          disabled={!categoryId || deleting || !exists}
        >
          {deleting ? "حذف…" : "حذف"}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          disabled={!categoryId || saving}
        >
          {saving ? "ذخیره…" : "ذخیره"}
        </button>
      </div>

      <div className="hidden md:flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            id="seo-use-auto"
            type="checkbox"
            className="h-4 w-4"
            checked={!!form.useAuto}
            onChange={(e) =>
              setForm((f) => ({ ...f, useAuto: e.target.checked }))
            }
            disabled={!categoryId}
          />
          <label
            htmlFor="seo-use-auto"
            className="text-sm text-black dark:text-white"
          >
            استفاده از مقادیر خودکار
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-skin-border text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
            disabled={!categoryId || deleting || !exists}
          >
            {deleting ? "در حال حذف…" : "حذف تنظیمات"}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={!categoryId || saving}
          >
            {saving ? "در حال ذخیره…" : "ذخیره تنظیمات سئو"}
          </button>
        </div>
      </div>

      <div className="mt-4 md:mt-6">
        <div className="flex md:hidden items-center gap-2 mb-4">
          <input
            id="seo-use-auto-m"
            type="checkbox"
            className="h-5 w-5"
            checked={!!form.useAuto}
            onChange={(e) =>
              setForm((f) => ({ ...f, useAuto: e.target.checked }))
            }
            disabled={!categoryId}
          />
          <label
            htmlFor="seo-use-auto-m"
            className="text-sm text-black dark:text-white"
          >
            استفاده از مقادیر خودکار
          </label>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          <div className="xl:col-span-7 space-y-6">
            <fieldset className="space-y-4">
              <legend className="font-medium text-black dark:text-white">
                SEO Basics
              </legend>
              <LabeledInput
                label="SEO Title"
                placeholder="اگر خالی باشد از نام دسته استفاده می‌شود"
                value={form.seoTitle ?? ""}
                onChange={handleChange("seoTitle")}
                max={60}
                disabled={!categoryId || isFieldsDisabled}
              />
              <LabeledTextarea
                label="Meta Description"
                placeholder="اگر خالی باشد از توضیح دسته ساخته می‌شود"
                value={form.seoDescription ?? ""}
                onChange={handleChange("seoDescription")}
                max={180}
                disabled={!categoryId || isFieldsDisabled}
              />
              <LabeledInput
                label="Canonical URL"
                placeholder="https://example.com/category/slug"
                value={form.canonicalUrl ?? ""}
                onChange={handleChange("canonicalUrl")}
                disabled={!categoryId || isFieldsDisabled}
              />
              <LabeledSelect
                label="Robots"
                value={(form.robots ?? "") as any}
                onChange={handleChange("robots")}
                options={[
                  { label: "پیش‌فرض", value: "" },
                  { label: "index,follow", value: "index,follow" },
                  { label: "noindex,follow", value: "noindex,follow" },
                  { label: "index,nofollow", value: "index,nofollow" },
                  { label: "noindex,nofollow", value: "noindex,nofollow" },
                ]}
                disabled={!categoryId || isFieldsDisabled}
              />
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="font-medium text-black dark:text-white">
                Twitter
              </legend>
              <LabeledSelect
                label="Twitter Card"
                value={form.twitterCard ?? "summery_large_image"}
                onChange={handleChange("twitterCard")}
                options={[
                  {
                    label: "summery_large_image",
                    value: "summery_large_image",
                  },
                  { label: "summery", value: "summery" },
                ]}
                disabled={!categoryId || isFieldsDisabled}
              />
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="font-medium text-black dark:text-white">
                Meta
              </legend>
              <LabeledInput
                label="Author/Owner Name"
                value={form.authorName ?? ""}
                onChange={handleChange("authorName")}
                disabled={!categoryId || isFieldsDisabled}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput
                  label="Published Time (ISO)"
                  placeholder="2025-09-30T12:00:00.000Z"
                  value={form.publishedTime ?? ""}
                  onChange={handleChange("publishedTime")}
                  disabled={!categoryId || isFieldsDisabled}
                />
                <LabeledInput
                  label="Modified Time (ISO)"
                  placeholder="2025-09-30T12:00:00.000Z"
                  value={form.modifiedTime ?? ""}
                  onChange={handleChange("modifiedTime")}
                  disabled={!categoryId || isFieldsDisabled}
                />
              </div>
              <LabeledInput
                label="Tags (comma separated)"
                value={tagsText}
                onChange={(e: any) =>
                  setTagsText((e.target as HTMLInputElement).value)
                }
                disabled={!categoryId || isFieldsDisabled}
              />
            </fieldset>
          </div>

          <div className="xl:col-span-5 space-y-6">
            <fieldset className="space-y-4">
              <legend className="font-medium text-black dark:text-white">
                Open Graph
              </legend>
              <LabeledInput
                label="OG Title"
                placeholder="اگر خالی باشد از SEO Title استفاده می‌شود"
                value={form.ogTitle ?? ""}
                onChange={handleChange("ogTitle")}
                max={70}
                disabled={!categoryId || isFieldsDisabled}
              />
              <LabeledTextarea
                label="OG Description"
                placeholder="اگر خالی باشد از Meta Description استفاده می‌شود"
                value={form.ogDescription ?? ""}
                onChange={handleChange("ogDescription")}
                max={200}
                disabled={!categoryId || isFieldsDisabled}
              />
              <LabeledInput
                label="OG Image URL"
                placeholder="https://..."
                value={form.ogImageUrl ?? ""}
                onChange={handleChange("ogImageUrl")}
                disabled={!categoryId || isFieldsDisabled}
              />
              <div className="rounded-xl border border-gray-200 dark:border-skin-border overflow-hidden h-[180px] sm:h-[200px] md:h-[220px] flex items-center justify-center bg-gray-50 dark:bg-skin-bg/5 transition-colors">
                {form.ogImageUrl ? (
                  <img
                    src={form.ogImageUrl}
                    alt="OG preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-gray-400 dark:text-skin-muted">
                    پیش‌نمایش تصویر OG
                  </div>
                )}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="font-medium text-black dark:text-white">
                پیش‌نمایش SERP
              </legend>
              <div className="rounded-xl border border-gray-200 dark:border-skin-border p-4 transition-colors">
                <div className="text-[#1a0dab] text-base sm:text-lg leading-6 truncate">
                  {form.seoTitle || "عنوان دسته"}
                </div>
                <div className="text-[#006621] text-[12px] mt-1 truncate">
                  {form.canonicalUrl || "https://example.com/category/slug"}
                </div>
                <div className="text-[#545454] dark:text-skin-muted text-[13px] mt-1 line-clamp-2">
                  {form.seoDescription || "توضیحات متا."}
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="h-16 md:h-0" />
    </div>
  );
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value?.length || 0;
  const danger = len > max * 0.9;
  return (
    <span
      className={`text-xs ${
        danger ? "text-red-500" : "text-gray-400 dark:text-skin-muted"
      }`}
    >
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
        <label className="block text-sm text-black dark:text-white mb-1 sm:mb-2">
          {label}
        </label>
        {typeof value === "string" && max ? (
          <CharCounter value={value} max={max} />
        ) : null}
      </div>
      <input
        type="text"
        className="w-full rounded-lg border text-black dark:text-white border-gray-200 dark:border-skin-border bg-white dark:bg-skin-bg/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-skin-border/50 disabled:opacity-60 transition-colors"
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
        <label className="block text-sm text-black dark:text-white mb-1 sm:mb-2">
          {label}
        </label>
        {typeof value === "string" && max ? (
          <CharCounter value={value} max={max} />
        ) : null}
      </div>
      <textarea
        className="w-full min-h-[140px] sm:min_h-[160px] text-black dark:text-white rounded-lg border border-gray-200 dark:border-skin-border bg-white dark:bg-skin-bg/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-skin-border/50 disabled:opacity-60 transition-colors"
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
      <label className="block text-sm text-black dark:text-white mb-1 sm:mb-2">
        {label}
      </label>
      <select
        className="w-full rounded-lg border text-black dark:text-white border-gray-200 dark:border-skin-border bg-white dark:bg-skin-bg/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-skin-border/50 disabled:opacity-60 transition-colors"
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

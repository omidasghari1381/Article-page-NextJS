"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
  lang: "fa" | "en";
  categoryId: string | null;
  initialData?: SeoMetaPayload | null;
  initialExists?: boolean;
};

const API_BASE = "/api/seo/";

export default function CategorySeoSettingsForm({
  lang,
  categoryId,
  initialData = null,
  initialExists = false,
}: Props) {
  const { t } = useTranslation("admin");
  const locale = lang; // فقط "fa" یا "en" طبق قرارداد بک‌اند

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
    if (!categoryId || initialData) return;

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
        if (!res.ok) throw new Error(t("categories.seo.errors.fetch"));

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
        if (active) setError(e?.message || t("categories.seo.errors.fetch"));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const tmsg = await res.text().catch(() => "");
        throw new Error(tmsg || t("categories.seo.errors.save"));
      }
      if (!exists) setExists(true);
      alert(t("categories.seo.messages.saveSuccess"));
    } catch (e: any) {
      setError(e?.message || t("categories.seo.errors.save"));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!categoryId) return;
    if (!confirm(t("categories.seo.confirm.delete"))) return;
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
        const tmsg = await res.text().catch(() => "");
        throw new Error(tmsg || t("categories.seo.errors.delete"));
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
      alert(t("categories.seo.messages.deleteSuccess"));
    } catch (e: any) {
      setError(e?.message || t("categories.seo.errors.delete"));
    } finally {
      setDeleting(false);
    }
  };

  const isFieldsDisabled = form.useAuto;

  return (
    <div
      className="bg-white dark:bg-skin-card rounded-2xl shadow-sm border border-gray-200 dark:border-skin-border p-4 sm:p-6 lg:p-8 transition-colors"
    >
      {!categoryId && (
        <div className="mb-4 rounded-xl border border-amber-300 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-400/10 p-3 sm:p-4 text-amber-800 dark:text-amber-200 text-sm">
          {t("categories.seo.notice.noId")}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-300 dark:border-red-400/40 bg-red-50 dark:bg-red-400/10 p-3 sm:p-4 text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Mobile action bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/85 dark:bg-skin-card/85 backdrop-blur border-t border-gray-200 dark:border-skin-border p-3 flex items-center justify-between gap-2 transition-colors">
        <button
          type="button"
          onClick={onDelete}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-skin-border text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
          disabled={!categoryId || deleting || !exists}
        >
          {deleting ? t("actions.deleting") : t("actions.delete")}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          disabled={!categoryId || saving}
        >
          {saving ? t("actions.saving") : t("actions.save")}
        </button>
      </div>

      {/* Desktop header actions */}
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
            {t("categories.seo.auto")}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-skin-border text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
            disabled={!categoryId || deleting || !exists}
          >
            {deleting
              ? t("categories.seo.buttons.deleting")
              : t("categories.seo.buttons.delete")}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={!categoryId || saving}
          >
            {saving
              ? t("categories.seo.buttons.saving")
              : t("categories.seo.buttons.save")}
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
            {t("categories.seo.auto")}
          </label>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Left column */}
          <div className="xl:col-span-7 space-y-6">
            <fieldset className="space-y-4">
              <legend className="font-medium text-black dark:text-white">
                {t("categories.seo.basics.title")}
              </legend>
              <LabeledInput
                label={t("categories.seo.basics.seoTitle")}
                placeholder={t("categories.seo.placeholders.seoTitle")}
                value={form.seoTitle ?? ""}
                onChange={handleChange("seoTitle")}
                max={60}
                disabled={!categoryId || isFieldsDisabled}
              />
              <LabeledTextarea
                label={t("categories.seo.basics.metaDescription")}
                placeholder={t("categories.seo.placeholders.metaDescription")}
                value={form.seoDescription ?? ""}
                onChange={handleChange("seoDescription")}
                max={180}
                disabled={!categoryId || isFieldsDisabled}
              />
              <LabeledInput
                label={t("categories.seo.basics.canonicalUrl")}
                placeholder="https://example.com/category/slug"
                value={form.canonicalUrl ?? ""}
                onChange={handleChange("canonicalUrl")}
                disabled={!categoryId || isFieldsDisabled}
              />
              <LabeledSelect
                label={t("categories.seo.basics.robots")}
                value={(form.robots ?? "") as any}
                onChange={handleChange("robots")}
                options={[
                  { label: t("categories.seo.options.default"), value: "" },
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
                label={t("categories.seo.twitter.card")}
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
                {t("categories.seo.meta.title")}
              </legend>
              <LabeledInput
                label={t("categories.seo.meta.author")}
                value={form.authorName ?? ""}
                onChange={handleChange("authorName")}
                disabled={!categoryId || isFieldsDisabled}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput
                  label={t("categories.seo.meta.published")}
                  placeholder="2025-09-30T12:00:00.000Z"
                  value={form.publishedTime ?? ""}
                  onChange={handleChange("publishedTime")}
                  disabled={!categoryId || isFieldsDisabled}
                />
                <LabeledInput
                  label={t("categories.seo.meta.modified")}
                  placeholder="2025-09-30T12:00:00.000Z"
                  value={form.modifiedTime ?? ""}
                  onChange={handleChange("modifiedTime")}
                  disabled={!categoryId || isFieldsDisabled}
                />
              </div>
              <LabeledInput
                label={t("categories.seo.meta.tags")}
                value={tagsText}
                onChange={(e: any) =>
                  setTagsText((e.target as HTMLInputElement).value)
                }
                disabled={!categoryId || isFieldsDisabled}
              />
            </fieldset>
          </div>

          {/* Right column */}
          <div className="xl:col-span-5 space-y-6">
            <fieldset className="space-y-4">
              <legend className="font-medium text-black dark:text-white">
                Open Graph
              </legend>
              <LabeledInput
                label={t("categories.seo.og.title")}
                placeholder={t("categories.seo.placeholders.ogTitle")}
                value={form.ogTitle ?? ""}
                onChange={handleChange("ogTitle")}
                max={70}
                disabled={!categoryId || isFieldsDisabled}
              />
              <LabeledTextarea
                label={t("categories.seo.og.description")}
                placeholder={t("categories.seo.placeholders.ogDescription")}
                value={form.ogDescription ?? ""}
                onChange={handleChange("ogDescription")}
                max={200}
                disabled={!categoryId || isFieldsDisabled}
              />
              <LabeledInput
                label={t("categories.seo.og.imageUrl")}
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
                    {t("categories.seo.og.previewPlaceholder")}
                  </div>
                )}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="font-medium text-black dark:text-white">
                {t("categories.seo.serp.title")}
              </legend>
              <div className="rounded-xl border border-gray-200 dark:border-skin-border p-4 transition-colors">
                <div className="text-[#1a0dab] text-base sm:text-lg leading-6 truncate">
                  {form.seoTitle || t("categories.seo.serp.fallbackTitle")}
                </div>
                <div className="text-[#006621] text-[12px] mt-1 truncate">
                  {form.canonicalUrl || t("categories.seo.serp.fallbackUrl")}
                </div>
                <div className="text-[#545454] dark:text-skin-muted text-[13px] mt-1 line-clamp-2">
                  {form.seoDescription || t("categories.seo.serp.fallbackDesc")}
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
        className="w-full min-h-[140px] sm:min-h-[160px] text-black dark:text-white rounded-lg border border-gray-200 dark:border-skin-border bg-white dark:bg-skin-bg/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-skin-border/50 disabled:opacity-60 transition-colors"
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

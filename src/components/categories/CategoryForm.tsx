"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent?: { id: string } | null;
  depth: number;
};

type CategoryCreatePayload = {
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
};

export default function CategoryForm({
  lang,
  initialAllCategories,
  initialCategory,
}: {
  lang: "fa" | "en";
  initialAllCategories: CategoryDTO[];
  initialCategory: CategoryDTO | null;
}) {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const isEdit = !!initialCategory?.id;

  const [allCategories, setAllCategories] = useState<CategoryDTO[]>(
    initialAllCategories || []
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState<boolean>(false);

  const [form, setForm] = useState({
    name: initialCategory?.name ?? "",
    slug: initialCategory?.slug ?? "",
    description: initialCategory?.description ?? "",
    parentId: (initialCategory?.parent as any)?.id ?? "",
  });

  // اگر لیست والدها پاس نشده، از API بگیر
  useEffect(() => {
    if (initialAllCategories?.length) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/categories`, { cache: "no-store" });
        if (res.ok) {
          const arr = (await res.json()) as CategoryDTO[];
          if (active) setAllCategories(Array.isArray(arr) ? arr : []);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, [initialAllCategories]);

  // اسلاگ فقط لاتین (مطابق الگوی فعلی پروژه)
  const slugify = (s: string) =>
    s
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\u0600-\u06FF]/g, "") // حروف فارسی حذف
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/\-+/g, "-")
      .replace(/^\-+|\-+$/g, "");

  const parentOptions = useMemo(() => {
    return (allCategories || [])
      .slice()
      .sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name))
      .map((c) => ({
        id: c.id,
        label: `${"— ".repeat(Math.min(c.depth, 6))}${c.name}`,
      }));
  }, [allCategories]);

  const handleChange =
    (field: keyof typeof form) =>
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | string
    ) => {
      const val = typeof e === "string" ? e : e.target.value;
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

  const withLangPath = (path: string) => `/${lang}${path}`;

  const handleDelete = async () => {
    if (!isEdit || !initialCategory?.id) return;
    if (!confirm(t("categories.form.confirmDelete"))) return;
    try {
      setDeleting(true);
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initialCategory.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.message || t("categories.form.deleteFailed"));
        return;
      }
      alert(t("categories.form.deleteSuccess"));
      router.push(withLangPath("/admin/categories"));
    } catch {
      alert(t("messages.error"));
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("categories.form.validations.name");
    if (!form.slug.trim()) errs.slug = t("categories.form.validations.slug");
    if (isEdit && form.parentId && form.parentId === initialCategory?.id) {
      errs.parentId = t("categories.form.validations.parentSelf");
    }
    if (Object.keys(errs).length) {
      alert(Object.values(errs).join("\n"));
      return;
    }
    const payload: CategoryCreatePayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description?.trim() ? form.description.trim() : null,
      parentId: form.parentId || undefined,
    };
    try {
      setSaving(true);
      setError(null);
      const url = isEdit
        ? `/api/categories/${initialCategory!.id}`
        : `/api/categories`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const tmsg = await res.text().catch(() => "");
        throw new Error(tmsg || t("categories.form.saveError"));
      }
      if (!isEdit) {
        const json = await res.json().catch(() => null);
        const newId = json?.created?.id;
        if (newId) {
          router.push(
            withLangPath(`/admin/categories/editor/${newId}?tab=seo`)
          );
          return;
        }
      }
      alert(
        isEdit
          ? t("categories.form.updateSuccess")
          : t("categories.form.createSuccess")
      );
      router.refresh();
    } catch (err: any) {
      setError(err?.message || t("messages.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="w-full">
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-skin-card rounded-2xl shadow-sm border border-gray-200 dark:border-skin-border p-6 md:p-8 w-full mx-auto transition-colors"
      >
        {error && (
          <div className="mb-4 rounded border border-red-300 dark:border-red-400/40 bg-red-50 dark:bg-red-400/10 p-3 text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-6">
            <div>
              <label className="block text-sm text-black dark:text-white mb-2">
                {t("categories.form.name")}
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 dark:border-skin-border text-black dark:text-white bg-white dark:bg-skin-bg/5 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-skin-border/50 transition-colors"
                placeholder={t("categories.form.placeholders.name")}
                value={form.name}
                onChange={handleChange("name")}
              />
            </div>

            <div>
              <label className="block text-sm text-black dark:text-white mb-2">
                {t("categories.form.slug")}
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 dark:border-skin-border text-black dark:text-white bg-white dark:bg-skin-bg/5 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-skin-border/50 ltr transition-colors"
                placeholder="masalan: market-analysis"
                value={form.slug}
                onChange={handleChange("slug")}
              />
              <p className="text-xs text-gray-400 dark:text-skin-muted mt-1">
                {t("categories.form.hints.slugAuto")}
              </p>
            </div>

            <div>
              <label className="block text-sm text-black dark:text-white mb-2">
                {t("categories.form.parent")}
              </label>
              <select
                className="w-full rounded-lg border text-black dark:text-white border-gray-200 dark:border-skin-border bg-white dark:bg-skin-bg/5 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-skin-border/50 transition-colors"
                value={form.parentId}
                onChange={(e) => handleChange("parentId")(e)}
              >
                <option value="">{t("categories.form.noParent")}</option>
                {parentOptions.map((opt) => (
                  <option value={opt.id} key={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 dark:text-skin-muted mt-1">
                {t("categories.form.hints.parent")}
              </p>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-black dark:text-white mb-2">
                  {t("categories.form.description")}
                </label>
                <CharCounter value={form.description} max={1000} />
              </div>
              <textarea
                className="w-full min-h-[160px] text-black dark:text-white rounded-lg border border-gray-200 dark:border-skin-border bg-white dark:bg-skin-bg/5 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-skin-border/50 transition-colors"
                placeholder={t("categories.form.placeholders.description")}
                value={form.description}
                onChange={handleChange("description")}
                maxLength={1000}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-skin-border text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-skin-bg/10 transition-colors"
                onClick={() => {
                  setForm({
                    name: "",
                    slug: "",
                    description: "",
                    parentId: "",
                  });
                  setSlugTouched(false);
                }}
              >
                {t("actions.clear")}
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                disabled={saving}
              >
                {saving
                  ? t("actions.saving")
                  : isEdit
                  ? t("categories.form.buttons.update")
                  : t("categories.form.buttons.create")}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                disabled={deleting || !isEdit}
              >
                {deleting
                  ? t("actions.deleting")
                  : t("categories.form.buttons.delete")}
              </button>
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
    <span
      className={`text-xs ${
        danger ? "text-red-500" : "text-gray-400 dark:text-skin-muted"
      }`}
    >
      {len}/{max}
    </span>
  );
}

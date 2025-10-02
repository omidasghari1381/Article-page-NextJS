"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import CategorySeoSettingsForm from "./CategorySeoSettingsForm";

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

export default function Page() {
  return (
    <main className="pb-24 pt-6 px-20">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "دسته", href: "/categories" },
          { label: "افزودن/ویرایش دسته", href: "/article/new-category" },
        ]}
      />
      <div className="mt-5">
        <CategoryEditWithTabs />
      </div>
    </main>
  );
}

/** ---------------- Tabs Wrapper ---------------- */
function CategoryEditWithTabs() {
  const searchParams = useSearchParams();
  const initialTab =
    (searchParams.get("tab") as "category" | "seo" | null) === "seo"
      ? "seo"
      : "category";

  const [tab, setTab] = useState<"category" | "seo">(initialTab);

  return (
    <section className="w-full" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg border ${
            tab === "category"
              ? "bg-black text-white"
              : "bg-white text-gray-800 hover:bg-gray-50"
          }`}
          onClick={() => setTab("category")}
        >
          اطلاعات دسته
        </button>
        <button
          className={`px-4 py-2 rounded-lg border ${
            tab === "seo"
              ? "bg-black text-white"
              : "bg-white text-gray-800 hover:bg-gray-50"
          }`}
          onClick={() => setTab("seo")}
        >
          SEO
        </button>
      </div>

      {tab === "category" ? <CategoryForm /> : <CategorySeoTab />}
    </section>
  );
}

function CategorySeoTab() {
  const params = useParams<{ id?: string | string[] }>();
  const raw = params?.id;
  const id = Array.isArray(raw) ? raw[0] : raw ?? null;
  return <CategorySeoSettingsForm categoryId={id || null} />;
}

/** ---------------- Original Form (kept, minimal tweaks) ---------------- */
function CategoryForm() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();

  const raw = params?.id;
  const id = Array.isArray(raw) ? raw[0] : raw ?? null;
  const isEdit = !!id;

  const [form, setForm] = useState<{
    name: string;
    slug: string;
    description: string;
    parentId: string | "";
  }>({
    name: "",
    slug: "",
    description: "",
    parentId: "",
  });

  const [allCategories, setAllCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [slugTouched, setSlugTouched] = useState<boolean>(false);

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

  const parentOptions = useMemo(() => {
    return allCategories
      .slice()
      .sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name))
      .map((c) => ({
        id: c.id,
        label: `${"— ".repeat(Math.min(c.depth, 6))}${c.name}`,
      }));
  }, [allCategories]);

  // Load categories list (for parent select)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/categories`, { cache: "no-store" });
        if (res.ok) {
          const arr = (await res.json()) as CategoryDTO[];
          if (active) setAllCategories(Array.isArray(arr) ? arr : []);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Load category by id (edit mode)
  useEffect(() => {
    if (!isEdit) return;
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/categories/${id}`, { cache: "no-store" });
        if (res.status === 404) {
          if (!active) return;
          setError("دسته پیدا نشد");
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("خطا در دریافت دسته");

        const data: CategoryDTO = await res.json();
        if (!data?.id) {
          if (!active) return;
          setError("دسته پیدا نشد");
          setLoading(false);
          return;
        }

        if (!active) return;

        setForm({
          name: data.name ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          parentId: (data.parent as any)?.id ?? "",
        });
      } catch (e: any) {
        if (active) setError(e?.message || "خطا در دریافت دسته");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, isEdit]);

  // Handlers
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

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    if (!confirm("آیا از حذف این دسته مطمئن هستید؟")) return;

    try {
      setDeleting(true);
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.message || "حذف دسته ناموفق بود.");
        return;
      }

      alert("دسته با موفقیت حذف شد.");
      router.push("/articles");
    } catch {
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

    if (isEdit && form.parentId && form.parentId === id) {
      errs.parentId = "نمی‌توانید والد را خود دسته قرار دهید.";
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

      const url = isEdit ? `/api/categories/${id}` : `/api/categories`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "خطا در ذخیره دسته");
      }

      if (!isEdit) {
        const json = await res.json().catch(() => null);
        const newId = json?.created.id;
        if (newId) {
          router.push(`editor/${newId}?tab=seo`);
          return;
        }
      }

      alert(isEdit ? "تغییرات ثبت شد ✅" : "دسته با موفقیت ایجاد شد ✅");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "خطایی رخ داد");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-20 my-10">در حال بارگذاری…</div>;
  }

  return (
    <section className="w-full">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 w-full mx-auto"
        dir="rtl"
      >
        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-6">
            <div>
              <label className="block text-sm text-black mb-2">نام دسته</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="مثلاً: تحلیل بازار"
                value={form.name}
                onChange={handleChange("name")}
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-2">اسلاگ</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
                placeholder="masalan: market-analysis"
                value={form.slug}
                onChange={handleChange("slug")}
              />
              <p className="text-xs text-gray-400 mt-1">
                اگر خالی بماند، از روی نام ساخته می‌شود (حروف کوچک و خط تیره).
              </p>
            </div>

            <div>
              <label className="block text-sm text-black mb-2">
                دسته والد (اختیاری)
              </label>
              <select
                className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={form.parentId}
                onChange={(e) => handleChange("parentId")(e)}
              >
                <option value="">— بدون والد —</option>
                {parentOptions.map((opt) => (
                  <option value={opt.id} key={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                والد باعث ساختار درختی می‌شود. حذف والد، این دسته را ریشه‌ای
                می‌کند.
              </p>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-black mb-2">توضیح</label>
                <CharCounter value={form.description} max={1000} />
              </div>
              <textarea
                className="w-full min-h-[160px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="توضیح کوتاهی درباره این دسته بنویسید (اختیاری)..."
                value={form.description}
                onChange={handleChange("description")}
                maxLength={1000}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
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
                پاک‌سازی
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "در حال ذخیره…" : isEdit ? "ثبت تغییرات" : "ثبت دسته"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                disabled={deleting || !isEdit}
              >
                {deleting ? "در حال حذف..." : "حذف دسته"}
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
    <span className={`text-xs ${danger ? "text-red-500" : "text-gray-400"}`}>
      {len}/{max}
    </span>
  );
}

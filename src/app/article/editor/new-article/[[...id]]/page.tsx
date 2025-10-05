"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import SeoSettingsForm from "./SeoSettingsForm";

/** ---------- Types ---------- */
type CategoryDTO = { id: string; name: string; slug: string };
type TagDTO = { id: string; name: string; slug: string };
type MediaDTO = { id: string; name: string; url: string };

type ArticleDTO = {
  id: string;
  title: string;
  slug: string | null;
  subject: string | null;
  readingPeriod: number;
  viewCount: number;
  thumbnail: MediaDTO | null;
  introduction: string | null;
  quotes: string | null;
  summary: string[] | null;
  mainText: string;
  secondaryText: string | null;
  author: { id: string; firstName: string; lastName: string } | null;
  categories: CategoryDTO[];
  tags: TagDTO[];
  createdAt: string;
};

type FormState = {
  title: string;
  subject: string;
  authorId: string; // اختیاری؛ در بک‌اند از session هم پر می‌شود

  readingPeriod: string; // ورودی متنی؛ قبل از ارسال به number تبدیل می‌کنیم

  thumbnail: string; // می‌تونه UUID یا URL باشد (برای preview هندل می‌کنیم)
  introduction: string;
  quotes: string;
  mainText: string;
  secondaryText: string;

  categoryId: string;
  tagIds: string[];
  slug: string;
};

/** ---------- Page ---------- */
export default function Page() {
  return (
    <main className="pb-24 pt-6 px-20">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          { label: "افزودن/ویرایش مقاله", href: "/article/editor" },
        ]}
      />
      <div className="mt-5">
        <ArticleEditWithTabs />
      </div>
    </main>
  );
}

function ArticleEditWithTabs() {
  const params = useParams<{ id?: string[] }>();
  const id = params?.id?.[0] ?? null; // [[...id]]
  const [tab, setTab] = useState<"article" | "seo">("article");

  return (
    <section className="w-full" dir="rtl">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg border ${
            tab === "article"
              ? "bg-black text-white"
              : "bg-white text-gray-800 hover:bg-gray-50"
          }`}
          onClick={() => setTab("article")}
        >
          اطلاعات مقاله
        </button>
        <button
          className={`px-4 py-2 rounded-lg border ${
            tab === "seo"
              ? "bg-black text-white"
              : "bg-white text-gray-800 hover:bg-gray-50"
          }`}
          onClick={() => setTab("seo")}
          disabled={!id}
        >
          SEO
        </button>
      </div>

      {tab === "article" ? <ArticleForm id={id} /> : <ArticleSeoTab id={id} />}
    </section>
  );
}

function ArticleSeoTab({ id }: { id: string | null }) {
  return <SeoSettingsForm entityType="article" entityId={id || null} />;
}

/** ---------- Article Form ---------- */
function ArticleForm({ id }: { id: string | null }) {
  const router = useRouter();
  const isEdit = !!id;

  const [form, setForm] = useState<FormState>({
    title: "",
    subject: "",
    authorId: "",
    slug: "",
    readingPeriod: "",

    thumbnail: "",
    introduction: "",
    quotes: "",
    mainText: "",
    secondaryText: "",

    categoryId: "",
    tagIds: [],
  });

  const [summaryList, setSummaryList] = useState<string[]>([]);
  const [summaryInput, setSummaryInput] = useState<string>("");

  const [previewThumbUrl, setPreviewThumbUrl] = useState<string>("");
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [tags, setTags] = useState<TagDTO[]>([]);

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /** --- helpers --- */
  const isUUID = (s: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      s.trim()
    );

  async function resolveThumbPreview(input: string) {
    const v = input.trim();
    if (!v) {
      setPreviewThumbUrl("");
      return;
    }

    // اگر لینک با http شروع میشه همون رو نمایش بده
    if (/^https?:\/\//i.test(v)) {
      setPreviewThumbUrl(v);
      return;
    }

    // در غیر این صورت نمایش نده (چون فقط لینک مستقیم مجازه)
    setPreviewThumbUrl("");
  }

  /** --- load reference data (categories / tags) --- */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [catsRes, tagsRes] = await Promise.allSettled([
          fetch("/api/categories?perPage=1000", { cache: "no-store" }),
          fetch("/api/articles/tags?perPage=100", { cache: "no-store" }),
        ]);
        if (!active) return;

        if (catsRes.status === "fulfilled" && catsRes.value.ok) {
          const catsData = await catsRes.value.json();
          setCategories(
            Array.isArray(catsData?.items) ? catsData.items : catsData ?? []
          );
        }
        if (tagsRes.status === "fulfilled" && tagsRes.value.ok) {
          const tagsData = await tagsRes.value.json();
          setTags(
            Array.isArray(tagsData?.items) ? tagsData.items : tagsData ?? []
          );
        }
      } catch {
        // optional
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  /** --- load article if edit --- */
  useEffect(() => {
    let active = true;
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/articles/${id}`, { cache: "no-store" });
        if (res.status === 404) {
          if (!active) return;
          setError("مقاله پیدا نشد");
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("خطا در دریافت مقاله");

        const data = (await res.json()) as ArticleDTO;

        if (!active) return;

        setForm({
          title: data.title ?? "",
          subject: data.subject ?? "",
          authorId: data.author?.id ?? "",
          slug: data.slug ?? "",

          readingPeriod:
            typeof data.readingPeriod === "number"
              ? String(data.readingPeriod)
              : "",

          thumbnail: data.thumbnail?.id ?? data.thumbnail?.url ?? "",
          introduction: data.introduction ?? "",
          quotes: data.quotes ?? "",
          mainText: data.mainText ?? "",
          secondaryText: data.secondaryText ?? "",

          categoryId: data.categories?.[0]?.id ?? "",
          tagIds: (data.tags ?? []).map((t) => t.id),
        });

        setSummaryList(Array.isArray(data.summary) ? data.summary : []);
        setPreviewThumbUrl(data.thumbnail?.url ?? "");
      } catch (e: any) {
        if (active) setError(e?.message || "خطا در دریافت مقاله");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, isEdit]);

  /** --- handlers --- */
  const handleChange =
    (field: keyof FormState) =>
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | string[]
    ) => {
      if (Array.isArray(e)) {
        setForm((f) => ({ ...f, [field]: e }));
        return;
      }
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const handleThumbnailInput = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, thumbnail: v }));
    resolveThumbPreview(v);
  };

  const toggleIdInArray = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  // const onToggleCategory = (cid: string) =>
  //   setForm((f) => ({
  //     ...f,
  //     categoryIds: toggleIdInArray(f.categoryIds, cid),
  //   }));

  const onToggleTag = (tid: string) =>
    setForm((f) => ({ ...f, tagIds: toggleIdInArray(f.tagIds, tid) }));

  const addSummary = () => {
    const v = summaryInput.trim();
    if (!v) return;
    setSummaryList((prev) => [...prev, v]);
    setSummaryInput("");
  };

  const removeSummary = (idx: number) =>
    setSummaryList((prev) => prev.filter((_, i) => i !== idx));

  const editSummary = (idx: number, val: string) =>
    setSummaryList((prev) => prev.map((s, i) => (i === idx ? val : s)));

  const handleDelete = async () => {
    if (!isEdit) return;
    try {
      setDeleting(true);
      const res = await fetch("/api/articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.message || "حذف مقاله ناموفق بود.");
        return;
      }
      alert("مقاله با موفقیت حذف شد.");
      router.push("/articles");
      router.refresh();
    } catch (err) {
      alert("مشکل در ارتباط با سرور");
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "عنوان الزامی است.";
    if (!form.mainText.trim()) errs.mainText = "متن اصلی مقاله الزامی است.";
    if (!form.secondaryText.trim())
      errs.secondaryText = "متن ثانویه مقاله الزامی است.";
    if (!String(form.readingPeriod).trim())
      errs.readingPeriod = "مدت زمان مطالعه الزامی است.";
    if (!form.categoryId) errs.categoryId = "انتخاب دسته‌بندی الزامی است.";

    if (Object.keys(errs).length) {
      alert(Object.values(errs).join("\n"));
      return;
    }

    const payload = {
      // مدل جدید سرویس
      title: form.title,
      subject: form.subject || null,
      mainText: form.mainText,
      secondaryText: form.secondaryText || null,
      introduction: form.introduction || null,
      quotes: form.quotes || null,
      readingPeriod: Number(form.readingPeriod) || 0,
      categoryIds: form.categoryId ? [form.categoryId] : [],
      tagIds: form.tagIds,
      thumbnail: form.thumbnail || null,
      summary: summaryList.length ? summaryList : null,
      slug: form.slug?.trim() || null,
      // همچنان اگر بک‌اند authorId بخواهد
      authorId: form.authorId || undefined,
    };

    try {
      setSaving(true);
      setError(null);

      const url = isEdit ? `/api/articles/${id}` : `/api/articles`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "خطا در ذخیره مقاله");
      }

      const j = await res.json().catch(() => ({} as any));
      const newId = j?.id || id;

      alert(
        isEdit ? "تغییرات با موفقیت ثبت شد ✅" : "مقاله با موفقیت ایجاد شد ✅"
      );

      // اگر تازه ساختیم، برو روی مسیر ادیت تا تب SEO هم فعال بشه
      if (!isEdit && newId) {
        router.push(`/article/editor/${newId}`);
      } else {
        router.refresh();
      }
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
        <div className="md:col-span-4 space-y-6">
          <div>
            <label className="block text-sm text-black mb-2">عنوان مقاله</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="مثلاً: چگونه در فارکس ضرر نکنیم"
              value={form.title}
              onChange={handleChange("title")}
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-2">دسته‌بندی</label>
            <select
              className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={form.categoryId}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoryId: e.target.value }))
              }
            >
              <option value="">انتخاب کنید...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              فقط یک دسته‌بندی قابل انتخاب است.
            </p>
          </div>

          <div>
            <label className="block text-sm text-black mb-2">برچسب‌ها</label>
            <div className="rounded-lg border border-gray-200 p-2 max-h-48 overflow-auto">
              {tags.length ? (
                <ul className="space-y-1">
                  {tags.map((t) => {
                    const checked = form.tagIds.includes(t.id);
                    return (
                      <li key={t.id} className="flex items-center gap-2">
                        <input
                          id={`tag-${t.id}`}
                          type="checkbox"
                          className="accent-black"
                          checked={checked}
                          onChange={() => onToggleTag(t.id)}
                        />
                        <label
                          htmlFor={`tag-${t.id}`}
                          className="text-sm text-black"
                        >
                          {t.name}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">هیچ برچسبی یافت نشد.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-black mb-2">
              مدت زمان مطالعه (دقیقه)
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="مثلاً: 7"
              value={form.readingPeriod}
              onChange={handleChange("readingPeriod")}
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-2">
              شناسه نویسنده (اختیاری)
            </label>
            <input
              type="text"
              className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="authorId (در بک‌اند از session پر می‌شود)"
              value={form.authorId}
              onChange={handleChange("authorId")}
            />
            <p className="text-xs text-gray-400 mt-1">
              در عمل، از session کاربر لاگین‌شده پر می‌کنیم.
            </p>
          </div>

          <div>
            <label className="block text-sm text-black mb-2">
              Slug (اختیاری)
            </label>
            <input
              type="text"
              className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="مثلاً: how-not-to-lose-in-forex"
              value={form.slug}
              onChange={handleChange("slug")}
            />
          </div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <label className="block text-sm text-black mb-2">
                شناسه بندانگشتی یا URL
              </label>
              <input
                type="text"
                className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="UUID یا https://..."
                value={form.thumbnail}
                onChange={handleThumbnailInput}
              />
              <button
                type="button"
                onClick={() => window.open("/media", "_blank")}
                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm mt-3"
              >
                انتخاب از مدیا
              </button>
              <p className="text-xs text-gray-400 mt-1">
                اگر UUID مدیا را بدهید، پیش‌نمایش از /api/media/[id] خوانده
                می‌شود؛ اگر URL بدهید، مستقیم نمایش می‌دهیم.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border border-gray-200 overflow-hidden h-[160px] flex items-center justify-center bg-gray-50">
                {previewThumbUrl ? (
                  <img
                    src={previewThumbUrl}
                    alt="thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-gray-400">
                    پیش‌نمایش بندانگشتی
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-black mb-2">موضوع مقاله</label>
            <input
              type="text"
              className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="مثلاً: مدیریت سرمایه در فارکس"
              value={form.subject}
              onChange={handleChange("subject")}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm text-black mb-2">مقدمه</label>
              <CharCounter value={form.introduction} max={600} />
            </div>
            <textarea
              className="w-full min-h-[120px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="چند خط مقدمه برای شروع مقاله..."
              value={form.introduction}
              onChange={handleChange("introduction")}
              maxLength={600}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm text-black mb-2">نقل قول</label>
              <CharCounter value={form.quotes} max={600} />
            </div>
            <textarea
              className="w-full min-h-[120px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="متن نقل قول را بنویسید"
              value={form.quotes}
              onChange={handleChange("quotes")}
              maxLength={600}
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-2">
              خلاصه‌ها (summary)
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="مثلاً: مدیریت ریسک چیست؟"
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSummary();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSummary}
                className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
              >
                افزودن
              </button>
            </div>

            {summaryList.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {summaryList.map((s, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                  >
                    <input
                      className="flex-1 bg-transparent text-black focus:outline-none"
                      value={s}
                      onChange={(e) => editSummary(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeSummary(idx)}
                      className="px-2 py-1 rounded-md border hover:bg-gray-50"
                      aria-label="remove"
                    >
                      حذف
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 mt-2">
                چند مورد خلاصه اضافه کنید تا در صفحه مقاله نمایش دهیم.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm text-black mb-2">متن اصلی</label>
              <CharCounter value={form.mainText} max={20000} />
            </div>
            <textarea
              className="w-full min-h-[300px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 leading-7"
              placeholder="متن کامل مقاله را اینجا وارد کنید..."
              value={form.mainText}
              onChange={handleChange("mainText")}
              maxLength={20000}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm text-black mb-2">
                متن ثانویه
              </label>
              <CharCounter value={form.secondaryText} max={20000} />
            </div>
            <textarea
              className="w-full min-h-[300px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 leading-7"
              placeholder="متن ثانویه مقاله را اینجا وارد کنید..."
              value={form.secondaryText}
              onChange={handleChange("secondaryText")}
              maxLength={20000}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setForm({
                  title: "",
                  subject: "",
                  authorId: "",
                  slug: "",
                  readingPeriod: "",
                  thumbnail: "",
                  introduction: "",
                  quotes: "",
                  mainText: "",
                  secondaryText: "",
                  categoryId: "",
                  tagIds: [],
                });
                setSummaryList([]);
                setSummaryInput("");
                setPreviewThumbUrl("");
              }}
              disabled={saving}
            >
              پاک‌سازی
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "در حال ذخیره…" : isEdit ? "ثبت تغییرات" : "ثبت مقاله"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
              disabled={deleting || !isEdit}
              title={!isEdit ? "ابتدا مقاله را بسازید" : "حذف مقاله"}
            >
              {deleting ? "در حال حذف..." : "حذف مقاله"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

/** ---------- Utils ---------- */
function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value?.length || 0;
  const danger = len > max * 0.9;
  return (
    <span className={`text-xs ${danger ? "text-red-500" : "text-gray-400"}`}>
      {len}/{max}
    </span>
  );
}

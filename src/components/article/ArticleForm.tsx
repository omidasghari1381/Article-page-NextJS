'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  thumbnail: string | MediaDTO | null;
  introduction: string | null;
  quotes: string | null;
  summery: string[] | null;
  mainText: string;
  secondaryText: string | null;
  author: { id: string; firstName: string; lastName: string } | null;
  categories: CategoryDTO[];
  tags: TagDTO[];
  createdAt: string;
} | null;

type FormState = {
  title: string;
  subject: string;
  authorId: string;
  readingPeriod: string;
  thumbnail: string;
  introduction: string;
  quotes: string;
  mainText: string;
  secondaryText: string;
  categoryId: string;
  tagIds: string[];
  slug: string;
};

export default function ArticleForm({
  initialArticle,
  categories,
  tags,
  initialThumbUrl,
}: {
  initialArticle: ArticleDTO;
  categories: CategoryDTO[];
  tags: TagDTO[];
  initialThumbUrl?: string;
}) {
  const router = useRouter();
  const isEdit = !!initialArticle?.id;

  const [form, setForm] = useState<FormState>(() => ({
    title: initialArticle?.title ?? "",
    subject: initialArticle?.subject ?? "",
    authorId: initialArticle?.author?.id ?? "",
    slug: initialArticle?.slug ?? "",
    readingPeriod:
      typeof initialArticle?.readingPeriod === "number"
        ? String(initialArticle.readingPeriod)
        : "",
    thumbnail:
      (typeof initialArticle?.thumbnail === "string"
        ? initialArticle?.thumbnail
        : initialArticle?.thumbnail?.url) || "",
    introduction: initialArticle?.introduction ?? "",
    quotes: initialArticle?.quotes ?? "",
    mainText: initialArticle?.mainText ?? "",
    secondaryText: initialArticle?.secondaryText ?? "",
    categoryId: initialArticle?.categories?.[0]?.id ?? "",
    tagIds: (initialArticle?.tags ?? []).map((t) => t.id),
  }));

  const [summeryList, setSummeryList] = useState<string[]>(
    () => initialArticle?.summery ?? []
  );
  const [summeryInput, setSummeryInput] = useState<string>("");

  const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "").replace(
    /\/$/,
    ""
  );
  const toAbsMedia = (v?: string | null) => {
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    const path = v.replace(/^\//, "");
    return MEDIA_BASE ? `${MEDIA_BASE}/${path}` : `/${path}`;
  };
  const [previewThumbUrl, setPreviewThumbUrl] = useState<string>(
    () => initialThumbUrl ??
    toAbsMedia(
      typeof initialArticle?.thumbnail === "string"
        ? initialArticle?.thumbnail
        : initialArticle?.thumbnail?.url
    )
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof FormState) => (
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

  const handleThumbnailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, thumbnail: v }));
    setPreviewThumbUrl(toAbsMedia(v));
  };

  const toggleIdInArray = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
  const onToggleTag = (tid: string) =>
    setForm((f) => ({ ...f, tagIds: toggleIdInArray(f.tagIds, tid) }));

  const addSummery = () => {
    const v = summeryInput.trim();
    if (!v) return;
    setSummeryList((prev) => [...prev, v]);
    setSummeryInput("");
  };
  const removeSummery = (idx: number) =>
    setSummeryList((prev) => prev.filter((_, i) => i !== idx));
  const editSummery = (idx: number, val: string) =>
    setSummeryList((prev) => prev.map((s, i) => (i === idx ? val : s)));

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
      summery: summeryList.length ? summeryList : null,
      slug: form.slug?.trim() || null,
      authorId: form.authorId || undefined,
    };

    try {
      setSaving(true);
      setError(null);
      const url = isEdit ? `/api/articles/${initialArticle!.id}` : `/api/articles`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok)
        throw new Error((await res.text().catch(() => "")) || "خطا در ذخیره مقاله");
      const j = (await res.json().catch(() => ({}))) as any;
      const newId = j?.id || initialArticle?.id;
      alert(isEdit ? "تغییرات با موفقیت ثبت شد ✅" : "مقاله با موفقیت ایجاد شد ✅");
      if (!isEdit && newId) router.push(`/articles/editor/${newId}`);
      else router.refresh();
    } catch (e: any) {
      setError(e?.message || "خطایی رخ داد");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!confirm("آیا مطمئنی حذف شود؟")) return;
    try {
      setDeleting(true);
      const res = await fetch("/api/articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initialArticle!.id }),
      });
      if (!res.ok)
        throw new Error((await res.text().catch(() => "")) || "حذف مقاله ناموفق بود");
      alert("مقاله با موفقیت حذف شد.");
      router.push("/articles");
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "مشکل در ارتباط با سرور");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form
      dir="rtl"
      onSubmit={onSubmit}
      className={
        // ★ Compact padding on phones, original on desktop
        "bg-white rounded-2xl shadow-sm border p-4 sm:p-6 md:p-8 w-full mx-auto"
      }
    >
      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Left column */}
        <div className="md:col-span-4 space-y-4 sm:space-y-6">
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
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">انتخاب کنید...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">فقط یک دسته‌بندی قابل انتخاب است.</p>
          </div>

          <div>
            <label className="block text-sm text-black mb-2">برچسب‌ها</label>
            <div className="rounded-lg border border-gray-200 p-2 max-h-56 sm:max-h-64 overflow-auto">
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
                        <label htmlFor={`tag-${t.id}`} className="text-sm text-black">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-black mb-2">مدت زمان مطالعه (دقیقه)</label>
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
              <label className="block text-sm text-black mb-2">Slug (اختیاری)</label>
              <input
                type="text"
                className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="how-not-to-lose-in-forex"
                value={form.slug}
                onChange={handleChange("slug")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-black mb-2">شناسه نویسنده (اختیاری)</label>
            <input
              type="text"
              className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="authorId (در بک‌اند از session پر می‌شود)"
              value={form.authorId}
              onChange={handleChange("authorId")}
            />
            <p className="text-xs text-gray-400 mt-1">در عمل، از session کاربر لاگین‌شده پر می‌کنیم.</p>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-8 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <div className="lg:col-span-7">
              <label className="block text-sm text-black mb-2">شناسه بندانگشتی یا URL</label>
              <input
                type="text"
                className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="UUID یا /uploads/... یا https://..."
                value={form.thumbnail}
                onChange={handleThumbnailInput}
              />
              <button
                type="button"
                onClick={() => window.open("/media", "_blank")}
                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm mt-3 w-full sm:w-auto"
              >
                انتخاب از مدیا
              </button>
              <p className="text-xs text-gray-400 mt-1">
                اگر مسیر نسبی وارد کنید (مثل /uploads/...) در پیش‌نمایش، خودکار با بیس URL ترکیب می‌شود.
              </p>
            </div>
            <div className="lg:col-span-5">
              {/* ★ Responsive preview height */}
              <div className="rounded-xl border border-gray-200 overflow-hidden h-40 sm:h-48 md:h-44 lg:h-[160px] flex items-center justify-center bg-gray-50">
                {previewThumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewThumbUrl}
                    alt="thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-gray-400">پیش‌نمایش بندانگشتی</div>
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
              className="w-full min-h-28 sm:min-h-[120px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              className="w-full min-h-28 sm:min-h-[120px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="متن نقل قول را بنویسید"
              value={form.quotes}
              onChange={handleChange("quotes")}
              maxLength={600}
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-2">خلاصه‌ها (summery)</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="مثلاً: مدیریت ریسک چیست؟"
                value={summeryInput}
                onChange={(e) => setSummeryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSummery();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSummery}
                className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
              >
                افزودن
              </button>
            </div>
            {summeryList.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {summeryList.map((s, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                  >
                    <input
                      className="flex-1 bg-transparent text-black focus:outline-none"
                      value={s}
                      onChange={(e) => editSummery(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeSummery(idx)}
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
              className="w-full min-h-40 sm:min-h-[300px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 leading-7"
              placeholder="متن کامل مقاله را اینجا وارد کنید..."
              value={form.mainText}
              onChange={handleChange("mainText")}
              maxLength={20000}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm text-black mb-2">متن ثانویه</label>
              <CharCounter value={form.secondaryText} max={20000} />
            </div>
            <textarea
              className="w-full min-h-40 sm:min-h-[300px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 leading-7"
              placeholder="متن ثانویه مقاله را اینجا وارد کنید..."
              value={form.secondaryText}
              onChange={handleChange("secondaryText")}
              maxLength={20000}
            />
          </div>

          {/* ★ Buttons: stack on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
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
                setSummeryList([]);
                setSummeryInput("");
                setPreviewThumbUrl("");
              }}
              disabled={saving}
            >
              پاک‌سازی
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 w-full sm:w-auto"
              disabled={saving}
            >
              {saving ? "در حال ذخیره…" : isEdit ? "ثبت تغییرات" : "ثبت مقاله"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50 w-full sm:w-auto"
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

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value?.length || 0;
  const danger = len > max * 0.9;
  return (
    <span className={`text-xs ${danger ? "text-red-500" : "text-gray-400"}`}>
      {len}/{max}
    </span>
  );
}
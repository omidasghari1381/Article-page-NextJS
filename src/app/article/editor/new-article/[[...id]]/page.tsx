"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import { articleCategoryEnum } from "@/server/modules/articles/enums/articleCategory.enum";
import SeoSettingsForm from "./SeoSettingsForm";

type ArticleCreatePayload = {
  title: string;
  subject: string;
  authorId?: string;
  category: articleCategoryEnum;
  Introduction: string | null;
  quotes: string | null;
  mainText: string;
  secondryText: string;
  thumbnail: string | null;
  readingPeriod: string;
  summery: string[];
};

export default function Page() {
  return (
    <main className="pb-24 pt-6 px-20">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          { label: "افزودن/ویرایش مقاله", href: "/article/new-article" },
        ]}
      />
      <div className="mt-5">
        <ArticleEditWithTabs />
      </div>
    </main>
  );
}

function ArticleEditWithTabs() {
  const [tab, setTab] = useState<"article" | "seo">("article");
  return (
    <section className="w-full" dir="rtl">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg border ${tab === "article" ? "bg-black text-white" : "bg-white text-gray-800 hover:bg-gray-50"}`}
          onClick={() => setTab("article")}
        >
          اطلاعات مقاله
        </button>
        <button
          className={`px-4 py-2 rounded-lg border ${tab === "seo" ? "bg-black text-white" : "bg-white text-gray-800 hover:bg-gray-50"}`}
          onClick={() => setTab("seo")}
        >
          SEO
        </button>
      </div>

      {tab === "article" ? <ArticleForm /> : <ArticleSeoTab />}
    </section>
  );
}

function ArticleSeoTab() {
  const params = useParams<{ id?: string }>();
  const id = params?.id?.[0] ?? null; // اگر صفحه‌ی /article/new-article است، id ندارد
  return (
    <SeoSettingsForm entityType="article" entityId={id || null} />
  );
}

function ArticleForm() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const id = params?.id?.[0] ?? null;
  const isEdit = !!id;

  const [form, setForm] = useState<{
    title: string;
    subject: string;
    authorId: string;
    category: "" | articleCategoryEnum;
    Introduction: string;
    quotes: string;
    mainText: string;
    secondryText: string;
    thumbnail: string;
    readingPeriod: string;
  }>({
    title: "",
    subject: "",
    authorId: "",
    category: "",
    Introduction: "",
    quotes: "",
    mainText: "",
    secondryText: "",
    thumbnail: "",
    readingPeriod: "",
  });

  const [summeryList, setSummeryList] = useState<string[]>([]);
  const [summeryInput, setSummeryInput] = useState<string>("");
  const [previewThumb, setPreviewThumb] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- load article if in edit mode ---
  useEffect(() => {
    let active = true;
    if (!isEdit) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        let data: any | null = null;
        try {
          const res = await fetch(`/api/articles/${id}`, { cache: "no-store" });
          if (res.status === 404) {
            if (!active) return;
            setError("مقاله پیدا نشد");
            setLoading(false);
            return;
          }
          if (!res.ok) {
            throw new Error("خطا در دریافت مقاله");
          }
          data = await res.json();
          if (!data || !data.id) {
            if (!active) return;
            setError("مقاله پیدا نشد");
            setLoading(false);
            return;
          }
        } catch {
          // ignore (در صورت آماده نبودن API)
        }

        if (!active) return;

        setForm({
          title: data?.title ?? "",
          subject: data?.subject ?? "",
          authorId: data?.authorId ?? "",
          category: (data?.category as articleCategoryEnum) ?? "",
          Introduction: data?.Introduction ?? "",
          quotes: data?.quotes ?? "",
          mainText: data?.mainText ?? "",
          secondryText: data?.secondryText ?? "",
          thumbnail: data?.thumbnail ?? "",
          readingPeriod: data?.readingPeriod ?? "",
        });
        setSummeryList(Array.isArray(data?.summery) ? data.summery : []);
        setPreviewThumb(data?.thumbnail ?? "");
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

  const addSummery = () => {
    const v = summeryInput.trim();
    if (!v) return;
    setSummeryList((prev) => [...prev, v]);
    setSummeryInput("");
  };

  const removeSummery = (idx: number) => {
    setSummeryList((prev) => prev.filter((_, i) => i !== idx));
  };

  const editSummery = (idx: number, val: string) => {
    setSummeryList((prev) => prev.map((s, i) => (i === idx ? val : s)));
  };

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
        console.error("خطا در حذف:", err);
        alert(err?.message || "حذف مقاله ناموفق بود.");
        return;
      }

      alert("مقاله با موفقیت حذف شد.");
      // مثلا:
      // router.push("/articles");
      // router.refresh();
    } catch (err) {
      console.error("خطای شبکه در حذف:", err);
      alert("مشکل در ارتباط با سرور");
    } finally {
      setDeleting(false);
    }
  };

  const handleChange =
    (field: keyof typeof form) =>
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | boolean
    ) => {
      if (typeof e === "boolean") {
        setForm((f) => ({ ...f, [field]: e }));
      } else {
        if (field === "category") {
          setForm((f) => ({
            ...f,
            category: (e.target.value as articleCategoryEnum) || "",
          }));
        } else {
          setForm((f) => ({ ...f, [field]: e.target.value }));
        }
      }
    };

  const handleThumbnailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    setForm((f) => ({ ...f, thumbnail: v }));
    setPreviewThumb(v);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "عنوان الزامی است.";
    if (!form.subject.trim()) errs.subject = "موضوع مقاله الزامی است.";
    if (!form.category) errs.category = "دسته‌بندی را انتخاب کنید.";
    if (!form.readingPeriod.trim())
      errs.readingPeriod = "مدت زمان مطالعه الزامی است.";
    if (!form.mainText.trim()) errs.mainText = "متن اصلی مقاله الزامی است.";
    if (!form.secondryText.trim())
      errs.secondryText = "متن ثانویه مقاله الزامی است.";

    if (Object.keys(errs).length) {
      alert(Object.values(errs).join("\n"));
      return;
    }

    const payload: ArticleCreatePayload = {
      title: form.title,
      subject: form.subject,
      authorId: form.authorId || undefined,
      category: form.category as articleCategoryEnum,
      Introduction: form.Introduction || null,
      quotes: form.quotes || null,
      mainText: form.mainText,
      secondryText: form.secondryText,
      thumbnail: form.thumbnail || null,
      readingPeriod: form.readingPeriod,
      summery: summeryList,
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

      alert(
        isEdit ? "تغییرات با موفقیت ثبت شد ✅" : "مقاله با موفقیت ایجاد شد ✅"
      );
      // پس از ذخیره، اگر تازه ایجاد شد می‌تونی ریدایرکت کنی تا تب SEO فعال شود
      // router.push(`/article/editor/${newId}`);
      // router.refresh();
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
              value={form.category}
              onChange={handleChange("category")}
            >
              <option value="">انتخاب کنید...</option>
              {Object.values(articleCategoryEnum).map((val) => (
                <option value={val} key={val}>
                  {val}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              مقدار انتخابی باید دقیقاً یکی از مقادیر <code>articleCategoryEnum</code> باشد.
            </p>
          </div>

          <div>
            <label className="block text-sm text-black mb-2">مدت زمان مطالعه</label>
            <input
              type="text"
              className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="مثلاً: ۷ دقیقه"
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
        </div>

        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <label className="block text-sm text-black mb-2">
                لینک تصویر بندانگشتی
              </label>
              <input
                type="text"
                className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="https://..."
                value={form.thumbnail}
                onChange={handleThumbnailInput}
              />
              <p className="text-xs text-gray-400 mt-1">
                اگر آپلود داخلی دارید، این فیلد را بعداً با آپلودر جایگزین می‌کنیم.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border border-gray-200 overflow-hidden h-[160px] flex items-center justify-center bg-gray-50">
                {previewThumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewThumb}
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
            <p className="text-xs text-gray-400 mt-1">
              این فیلد به‌صورت اجباری ذخیره می‌شود.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm text-black mb-2">مقدمه</label>
              <CharCounter value={form.Introduction} max={600} />
            </div>
            <textarea
              className="w-full min-h-[120px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="چند خط مقدمه برای شروع مقاله..."
              value={form.Introduction}
              onChange={handleChange("Introduction")}
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
              placeholder="متن نقل قول رو بنویسید"
              value={form.quotes}
              onChange={handleChange("quotes")}
              maxLength={600}
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-2">
              خلاصه‌ها (آنچه در مقاله می‌خوانید)
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="مثلاً: مدیریت ریسک چیست؟"
                value={summeryInput}
                onChange={(e) => setSummeryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSummery();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSummery}
                className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
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
              className="w-full min-h-[300px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 leading-7"
              placeholder="متن کامل مقاله را اینجا وارد کنید..."
              value={form.mainText}
              onChange={handleChange("mainText")}
              maxLength={20000}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm text-black mb-2">متن ثانویه</label>
              <CharCounter value={form.secondryText} max={20000} />
            </div>
            <textarea
              className="w-full min-h-[300px] text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 leading-7"
              placeholder="متن ثانویه مقاله را اینجا وارد کنید..."
              value={form.secondryText}
              onChange={handleChange("secondryText")}
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
                  authorId: "",
                  category: "",
                  Introduction: "",
                  quotes: "",
                  mainText: "",
                  secondryText: "",
                  thumbnail: "",
                  readingPeriod: "",
                  subject: "",
                });
                setSummeryList([]);
                setSummeryInput("");
                setPreviewThumb("");
              }}
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

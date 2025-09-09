"use client";

import Image from "next/image";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { articleCategoryEnum } from "@/server/modules/articles/enums/articleCategory.enum";

type ArticleCreatePayload = {
  title: string;
  subject: string;
  authorId?: string;
  category: articleCategoryEnum;
  Introduction: string | null;
  mainText: string;
  secondryText: string;
  thumbnail: string | null;
  showStatus: boolean;
  readingPeriod: string;
  summery: string[]; 
};

export default function Page() {
  return (
    <main className="pb-24">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          { label: "افزودن مقاله", href: "/articles/new" },
        ]}
      />
      <BannerWithBox />
      <div className="mt-24">
        <ArticleForm />
      </div>
    </main>
  );
}

function BannerWithBox() {
  return (
    <section className="relative w-full">
      <div className="relative h-[228px] w-full rounded-2xl overflow-hidden">
        <img
          src="/image/faqMain.png"
          alt="banner"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex justify-center items-center border absolute rounded-lg left-1/2 -bottom-12 transform -translate-x-1/2 w-[92%] md:w-[80%] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-10 w-full">
          <IconItem src="/svg/tarnsaction.svg" label="مقالات من" />
          <IconItem src="/svg/faqNote.svg" label="لیست مقالات" />
          <IconItem src="/svg/lock.svg" label="پیش‌نویس‌ها" />
          <IconItem src="/svg/faqNote.svg" label="دسته‌بندی‌ها" />
          <IconItem src="/svg/wallet.svg" label="آمار بازدید" />
        </div>
      </div>
    </section>
  );
}

function IconItem({ src, label }: { src: string; label: string }) {
  return (
    <div className="flex items-center justify-center flex-1 min-w-[140px] gap-2">
      <Image src={src} alt={label} width={48} height={48} />
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function ArticleForm() {
  const [form, setForm] = useState<{
    title: string;
    subject: string;
    authorId: string;
    category: "" | articleCategoryEnum;
    Introduction: string;
    mainText: string;
    secondryText: string;
    thumbnail: string;
    readingPeriod: string;
    showStatus: boolean;
  }>({
    title: "",
    subject: "",
    authorId: "",
    category: "",
    Introduction: "",
    mainText: "",
    secondryText: "",
    thumbnail: "",
    readingPeriod: "",
    showStatus: false,
  });

  const [summeryList, setSummeryList] = useState<string[]>([]);
  const [summeryInput, setSummeryInput] = useState<string>("");

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

  const [previewThumb, setPreviewThumb] = useState<string>("");

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
      mainText: form.mainText,
      secondryText: form.secondryText,
      thumbnail: form.thumbnail || null,
      showStatus: form.showStatus,
      readingPeriod: form.readingPeriod,
      summery: summeryList,
    };

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "خطا در ایجاد مقاله");
      }

      alert("مقاله با موفقیت ثبت شد ✅");
    } catch (err: any) {
      alert(err?.message || "خطایی رخ داد");
    }
  };

  return (
    <section className="w-full">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 w-full mx-auto"
        dir="rtl"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-6">
            <div>
              <label className="block text-sm text-black mb-2">
                عنوان مقاله
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200  text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
                مقدار انتخابی باید دقیقاً یکی از مقادیر{" "}
                <code>articleCategoryEnum</code> باشد.
              </p>
            </div>

            <div>
              <label className="block text-sm text-black mb-2">
                مدت زمان مطالعه
              </label>
              <input
                type="text"
                className="w-full rounded-lg border text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="مثلاً: ۷ دقیقه"
                value={form.readingPeriod}
                onChange={handleChange("readingPeriod")}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <span className="text-sm text-gray-700">نمایش عمومی</span>
              <button
                type="button"
                onClick={() => handleChange("showStatus")(!form.showStatus)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  form.showStatus ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    form.showStatus ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
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
                  className="w-full rounded-lg border  text-black border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  placeholder="https://..."
                  value={form.thumbnail}
                  onChange={handleThumbnailInput}
                />
                <p className="text-xs text-gray-400 mt-1">
                  اگر آپلود داخلی دارید، این فیلد را بعداً با آپلودر جایگزین
                  می‌کنیم.
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-xl border border-gray-200 overflow-hidden h-[160px] flex items-center justify-center bg-gray-50">
                  {previewThumb ? (
                    <img
                      src={previewThumb}
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
              <label className="block text-sm text-black mb-2">
                موضوع مقاله
              </label>
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
                className="w-full min-h-[120px]  text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="چند خط مقدمه برای شروع مقاله..."
                value={form.Introduction}
                onChange={handleChange("Introduction")}
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

              {summeryList.length > 0 && (
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
              )}

              {summeryList.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  چند مورد خلاصه اضافه کنید تا در صفحه مقاله نمایش دهیم.
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-black mb-2">
                  متن اصلی
                </label>
                <CharCounter value={form.mainText} max={20000} />
              </div>
              <textarea
                className="w-full min-h-[300px]  text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 leading-7"
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
                <CharCounter value={form.secondryText} max={20000} />
              </div>
              <textarea
                className="w-full min-h-[300px]  text-black rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 leading-7"
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
                    mainText: "",
                    secondryText: "",
                    thumbnail: "",
                    readingPeriod: "",
                    showStatus: false,
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
                className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
              >
                ثبت مقاله
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

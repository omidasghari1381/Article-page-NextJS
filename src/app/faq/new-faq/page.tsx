"use client";
import Breadcrumb from "@/components/Breadcrumb";
import { faqCategory } from "@/server/modules/faq/enums/faqCategory.enum";
import Image from "next/image";
import { useState } from "react";

type ArticleCreatePayload = {
  question: string;
  answer: string;
  category: faqCategory;
};

export default function Page() {
  return (
    <main className="pb-24 px-20 py-10">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/articles" },
          { label: "افزودن سوالات", href: "/articles/new" },
        ]}
      />
      <div className="mt-10">
        <ArticleForm />
      </div>
    </main>
  );
}

function BannerWithBox() {
  return (
    <section className="relative w-full ">
      <div className="relative h-[228px] w-full rounded-2xl overflow-hidden">
        <img
          src="/image/faqMain.png"
          alt="banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* باکس وسط صفحه روی بنر */}
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
    question: string;
    answer: string;
    category: "" | faqCategory;
  }>({
    question: "",
    answer: "",
    category: "",
  });
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
            category: (e.target.value as faqCategory) || "",
          }));
        } else {
          setForm((f) => ({ ...f, [field]: e.target.value }));
        }
      }
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!form.question.trim()) errs.title = "سوال الزامی است.";
    if (!form.answer.trim()) errs.subject = "جواب الزامی است.";
    if (!form.category) errs.category = "دسته‌بندی را انتخاب کنید.";

    const payload: ArticleCreatePayload = {
      question: form.question,
      answer: form.answer,
      category: form.category as faqCategory,
    };

    try {
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "خطا در ایجاد مقاله");
      }

      alert("سوال با موفقیت ثبت شد ✅");
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
              <label className="block text-sm text-gray-600 mb-2">سوال</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="مثلاً: چگونه در فارکس ضرر نکنیم"
                value={form.question}
                onChange={handleChange("question")}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">پاسخ</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="مثلاً: چگونه در فارکس ضرر نکنیم"
                value={form.answer}
                onChange={handleChange("answer")}
              />
            </div>
            <div>
              <label className="block text-sm text-black mb-2">دسته‌بندی</label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={form.category}
                onChange={handleChange("category")}
              >
                <option value="">انتخاب کنید...</option>
                {Object.values(faqCategory).map((val) => (
                  <option value={val} key={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="md:col-span-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6"></div>
            <div></div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                onClick={() =>
                  setForm({
                    question: "",
                    answer: "",
                    category: "",
                  })
                }
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

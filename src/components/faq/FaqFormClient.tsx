"use client";
import { useState } from "react";
import { faqCategory } from "@/server/modules/faq/enums/faqCategory.enum";
import { absolute } from "@/app/utils/base-url";

export type ArticleCreatePayload = {
  question: string;
  answer: string;
  category: faqCategory;
};

export default function FaqFormClient() {
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
      const res = await fetch(absolute("/api/faq"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "خطا در ایجاد سوال");
      }

      alert("سوال با موفقیت ثبت شد ✅");
    } catch (err: any) {
      alert(err?.message || "خطایی رخ داد");
    }
  };

  return (
    <section className="w-full" dir="rtl">
      <form
        onSubmit={onSubmit}
        className="bg-skin-bg rounded-2xl shadow-sm border border-skin-border p-6 md:p-8 w-full mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-6">
            <div>
              <label className="block text-sm text-skin-muted mb-2">سوال</label>
              <input
                type="text"
                className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
                placeholder="مثلاً: چگونه در فارکس ضرر نکنیم"
                value={form.question}
                onChange={handleChange("question")}
              />
            </div>

            <div>
              <label className="block text-sm text-skin-muted mb-2">پاسخ</label>
              <input
                type="text"
                className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
                placeholder="پاسخ مربوط به سوال"
                value={form.answer}
                onChange={handleChange("answer")}
              />
            </div>

            <div>
              <label className="block text-sm text-skin-muted mb-2">دسته‌بندی</label>
              <select
                className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70"
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
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-skin-border text-skin-base hover:bg-skin-card"
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
                className="px-5 py-2 rounded-lg bg-skin-accent text-white hover:bg-skin-accent/90"
              >
                ثبت سوال
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
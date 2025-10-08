"use client";

import DropBox from "@/components/DropBox";
import { useEffect, useState } from "react";
import { absolute } from "@/app/utils/base-url";
import { faqCategory } from "@/server/modules/faq/enums/faqCategory.enum";
import BannerWithBox from "./BannerWithBox";

export type FAQDetail = {
  id: string;
  question: string;
  answer: string;
  category: faqCategory;
};

type ListResponse = { items: FAQDetail[] };

export default function FaqClient() {
  const [faq, setFaq] = useState<FAQDetail[]>([]);
  const [category, setCategory] = useState<faqCategory>(faqCategory.BUYSELL);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          absolute(`/api/faq/${encodeURIComponent(category)}`),
          { signal: controller.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error(await res.text());
        const data: ListResponse = await res.json();
        setFaq(data.items || []);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          console.error("fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [category]);

  return (
    <section>
      {/* Banner stays visually identical; container below is made responsive */}
      <BannerWithBox setCategory={setCategory} />

      <div className="mt-20 sm:mt-24 mb-10 sm:mb-14 space-y-5 sm:space-y-7">
        {loading && (
          <DropBox title="در حال بارگذاری..." defaultOpen>
            لطفاً صبر کنید...
          </DropBox>
        )}

        {!loading && faq.length === 0 && (
          <div className="rounded-sm border p-3 sm:p-4 gap-4 text-black bg-white text-sm sm:text-base">
            سوالی برای این دسته‌بندی ثبت نشده است.
          </div>
        )}

        {!loading &&
          faq.map((f) => (
            <DropBox title={f.question} key={f.id}>
              {f.answer}
            </DropBox>
          ))}
      </div>
    </section>
  );
}
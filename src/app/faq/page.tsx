"use client";

import Breadcrumb from "@/components/Breadcrumb";
import DropBox from "@/components/DropBox";
import { faqCategory } from "@/server/modules/faq/enums/faqCategory.enum";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

type FAQDetail = {
  id: string;
  question: string;
  answer: string;
  category: faqCategory;
};

function Page() {
  const [faq, setFaq] = useState<FAQDetail[]>([]);
  const [category, setCategory] = useState<faqCategory>(faqCategory.BUYSELL);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancel = false;
    const source = axios.CancelToken.source();

    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<{ items: FAQDetail[] }>(
          `/api/faq/${encodeURIComponent(category)}`,
          { cancelToken: source.token }
        );


        if (!cancel) setFaq(data.items || []);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("axios error:", err);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
      source.cancel("route changed");
    };
  }, [category]);

  return (
    <main className="px-20 py-10   mx-auto">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "سوالات متداول", href: "/" },
        ]}
      />

      <BannerWithBox setCategory={setCategory} />

      <div className="space-y-7 mt-24 mb-14">
        {loading && (
          <DropBox title="در حال بارگذاری..." defaultOpen>
            لطفاً صبر کنید...
          </DropBox>
        )}

        {!loading && faq.length === 0 && (
          <div className="rounded-sm border p-4 gap-4 text-black bg-white">
            سوالی برای این دسته‌بندی ثبت نشده است.
          </div>
        )}

        {!loading &&
          faq.map((f: FAQDetail) => (
            <DropBox title={f.question} key={f.id}>
              {f.answer}
            </DropBox>
          ))}
      </div>
    </main>
  );
}

function BannerWithBox({
  setCategory,
}: {
  setCategory: (c: faqCategory) => void;
}) {
  return (
    <section className="relative w-full my-6">
      <div className="relative h-[228px] w-full rounded-2xl overflow-hidden">
        <img
          src="/image/faqMain.png"
          alt="banner"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex justify-center items-center border absolute rounded-lg left-1/2 -bottom-12 transform -translate-x-1/2 w-[80%] bg-white p-6">
        <div className="flex flex-wrap justify-between items-center gap-14">
          <div
            onClick={() => setCategory(faqCategory.BUYSELL)}
            className="flex items-center justify-center flex-1 min-w-[120px] gap-2 cursor-pointer"
          >
            <Image
              src="/svg/tarnsaction.svg"
              alt="note"
              width={65}
              height={65}
            />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              خرید و فروش
            </span>
          </div>

          <div
            onClick={() => setCategory(faqCategory.CONTRACT)}
            className="flex items-center justify-center flex-1 min-w-[120px] gap-2 cursor-pointer"
          >
            <Image src="/svg/faqNote.svg" alt="note" width={65} height={65} />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              یادداشت‌ها
            </span>
          </div>

          <div
            onClick={() => setCategory(faqCategory.SECURITY)}
            className="flex items-center justify-center flex-1 min-w-[120px] gap-2 cursor-pointer"
          >
            <Image src="/svg/lock.svg" alt="note" width={65} height={65} />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              امنیت حساب کاربری
            </span>
          </div>

          <div
            onClick={() => setCategory(faqCategory.USERCREDIT)}
            className="flex items-center justify-center flex-1 min-w-[120px] gap-2 cursor-pointer"
          >
            <Image src="/svg/faqNote.svg" alt="note" width={65} height={65} />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              اعتبار کاربری
            </span>
          </div>

          <div
            onClick={() => setCategory(faqCategory.SPREAD)}
            className="flex items-center justify-center flex-1 min-w-[120px] gap-2 cursor-pointer"
          >
            <Image src="/svg/wallet.svg" alt="note" width={65} height={65} />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              کارمزد حساب
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Page;

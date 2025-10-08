"use client";

import Image from "next/image";
import { faqCategory } from "@/server/modules/faq/enums/faqCategory.enum";
import DropBox from "../DropBox";

export default function BannerWithBox({
  setCategory,
}: {
  setCategory: (c: faqCategory) => void;
}) {
  return (
    <section className="relative w-full my-6">
      <div className="relative w-[90vw] rounded-2xl overflow-hidden  h-57 sm:h-56 md:h-64 lg:h-[228px] sm:mx-0">
        <img
          src="/image/faqMain.png"
          alt="banner"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="sm:hidden mt-4 px-4">
        <DropBox title="دسته‌بندی سوالات" defaultOpen={false}>
          <div className="bg-white rounded-md border p-3">
            <div className="grid grid-cols-2 gap-3">
              <MobileCategoryButton
                onClick={() => setCategory(faqCategory.BUYSELL)}
                icon="/svg/tarnsaction.svg"
                label="خرید و فروش"
              />
              <MobileCategoryButton
                onClick={() => setCategory(faqCategory.CONTRACT)}
                icon="/svg/faqNote.svg"
                label="یادداشت‌ها"
              />
              <MobileCategoryButton
                onClick={() => setCategory(faqCategory.SECURITY)}
                icon="/svg/lock.svg"
                label="امنیت حساب کاربری"
              />
              <MobileCategoryButton
                onClick={() => setCategory(faqCategory.USERCREDIT)}
                icon="/svg/faqNote.svg"
                label="اعتبار کاربری"
              />
              <MobileCategoryButton
                onClick={() => setCategory(faqCategory.SPREAD)}
                icon="/svg/wallet.svg"
                label="کارمزد حساب"
              />
            </div>
          </div>
        </DropBox>
      </div>


      <div className="hidden sm:flex absolute left-2/4 -translate-x-1/2 -bottom-14 md:-bottom-12 justify-center w-full p-6">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="bg-white border rounded-lg shadow-sm p-4 sm:p-5 md:p-5 lg:p-6">
            {/* Force single row with 5 columns on sm & md, reduce gaps & scale to fit */}
            <div className="grid grid-cols-5 gap-4 md:gap-6 lg:gap-10 xl:gap-14 place-items-center">
              <CategoryItem
                onClick={() => setCategory(faqCategory.BUYSELL)}
                icon="/svg/tarnsaction.svg"
                label="خرید و فروش"
                className="sm:scale-75 md:scale-90 lg:scale-100"
              />
              <CategoryItem
                onClick={() => setCategory(faqCategory.CONTRACT)}
                icon="/svg/faqNote.svg"
                label="یادداشت‌ها"
                className="sm:scale-75 md:scale-90 lg:scale-100"
              />
              <CategoryItem
                onClick={() => setCategory(faqCategory.SECURITY)}
                icon="/svg/lock.svg"
                label="امنیت حساب کاربری"
                className="sm:scale-75 md:scale-90 lg:scale-100"
              />
              <CategoryItem
                onClick={() => setCategory(faqCategory.USERCREDIT)}
                icon="/svg/faqNote.svg"
                label="اعتبار کاربری"
                className="sm:scale-75 md:scale-90 lg:scale-100"
              />
              <CategoryItem
                onClick={() => setCategory(faqCategory.SPREAD)}
                icon="/svg/wallet.svg"
                label="کارمزد حساب"
                className="sm:scale-75 md:scale-90 lg:scale-100"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileCategoryButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white text-black border rounded-md px-3 py-2 flex items-center justify-center gap-2"
    >
      <Image src={icon} alt="note" width={24} height={24} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function CategoryItem({
  icon,
  label,
  onClick,
  className = "",
}: {
  icon: string;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center gap-2 cursor-pointer min-w-0 ${className}`}
    >
      <Image
        src={icon}
        alt="note"
        width={48}
        height={48}
        className="w-8 h-8 md:w-12 md:h-12 lg:w-[65px] lg:h-[65px]"
      />
      <span className="text-[11px] md:text-sm font-medium text-gray-700 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

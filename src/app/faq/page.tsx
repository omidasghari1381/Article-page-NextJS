import Breadcrumb from "@/components/Breadcrumb";
import DropBox from "@/components/DropBox";
import Image from "next/image";

function page() {
  return (
    <main>
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "سواللات متداول", href: "/" },
        ]}
      />
      <BannerWithBox />
      <div className="space-y-7 mt-24 mb-14">
        <DropBox
          title="نحوه محاسبه سود حاصل از سرمایه‌گذاری چگونه است"
          defaultOpen
        >
          لطفا پیش از ورود هرگونه اطلاعات، آدرس موجود در بخش مرورگر وب خود را با
          آدرس فوق مقایسه نمایید و درصورت مشاهده هر نوع مغایرت احتمالی، از ادامه
          کار منصرف شده و موضوع را با ما در میان بگذارید.
        </DropBox>
        <DropBox title="شرایط بازگشت وجه چگونه است؟">
          متن نمونه جهت نمایش بدنه‌ی بسته. این متن را با محتوای واقعی جایگزین
          کنید.
        </DropBox>
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
      <div className="flex justify-center items-center border absolute rounded-lg left-1/2 -bottom-12 transform -translate-x-1/2 w-[80%] bg-white p-6">
        <div className="flex flex-wrap justify-between items-center gap-14">
          <div className="flex  items-center justify-center flex-1 min-w-[120px] gap-2">
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
          <div className="flex  items-center justify-center flex-1 min-w-[120px] gap-2">
            <Image src="/svg/faqNote.svg" alt="note" width={65} height={65} />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              خرید و فروش
            </span>
          </div>
          <div className="flex  items-center justify-center flex-1 min-w-[120px] gap-2">
            <Image src="/svg/lock.svg" alt="note" width={65} height={65} />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              امنیت حساب کاربری{" "}
            </span>
          </div>
          <div className="flex items-center justify-center flex-1 min-w-[120px] gap-2">
            <Image src="/svg/faqNote.svg" alt="note" width={65} height={65} />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              اعتبار کاربری{" "}
            </span>
          </div>

          <div className="flex  items-center justify-center flex-1 min-w-[120px] gap-2">
            <Image src="/svg/wallet.svg" alt="note" width={65} height={65} />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              کارمزد حساب{" "}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default page;

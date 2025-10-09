// components/home/LatestArticle.tsx
import Image from "next/image";

export default function LatestArticle() {
  return (
    <section>
      <div className="flex items-center gap-3 py-6">
        <Image src="/svg/Rectangle.svg" alt="thumb" width={8} height={36} />
        <h3 className="text-xl font-semibold text-[#1C2121]">آخرین مقالات</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <LateArticle />
        <LateArticle />
        <LateArticle />
        <LateArticle />
      </div>

      <div className="mt-6 flex justify-center">
        <button className="px-6 sm:px-8 h-12 bg-[#19CCA7] rounded-md flex items-center gap-2 text-white">
          <Image src={"/svg/whiteEye.svg"} alt="more" width={24} height={19} />
          <span className="text-base font-medium">مشاهده همه مقالات</span>
        </button>
      </div>
    </section>
  );
}

function LateArticle() {
  return (
    <article className="mb-2">
      <div className="relative w-full aspect-[16/9]">
        <Image src="/image/chart.png" alt="thumb" fill className="rounded-md object-cover" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/svg/arrowLeftBlack.svg"
              alt="badge"
              width={108}
              height={34}
              className="block rounded-sm"
              priority
            />
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
              آموزش فارکس
            </span>
          </div>
          <span className="text-[#373A41] text-sm sm:text-base font-medium">3 روز پیش</span>
        </div>
        <div className="flex items-center gap-2">
          <Image src={"/svg/eye.svg"} alt="views" width={18} height={14} />
          <span className="text-sm text-[#373A41]">بازدید 3</span>
        </div>
      </div>

      <p className="mt-2 text-base sm:text-lg text-[#121212] font-bold line-clamp-2">
        چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
      </p>
      <p className="text-sm sm:text-base font-normal text-[#121212] mt-3 line-clamp-3">
        با زیرساختی سریع، پلتفرمی امن، و تحلیل‌هایی مبتنی بر داده‌های لحظه‌ای، ما به تو کمک
        می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر تحلیل کنی و هوشمندانه‌تر معامله کنی...
      </p>
    </article>
  );
}

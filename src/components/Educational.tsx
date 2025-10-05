// components/home/Educational.tsx
import Image from "next/image";

export default function Educational() {
  return (
    <section>
      <div className="flex items中心 gap-3 ">
        <Image src="/svg/Rectangle.svg" alt="thumb" width={8} height={36} />
        <h3 className="text-xl font-semibold text-[#1C2121]">مقالات آموزشی</h3>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[540px]">
        <div className="relative rounded-md overflow-hidden aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto lg:h-full">
          <button className="absolute top-3 right-3 z-10 w-11 h-11 bg-gradient-to-r from-[#111414] to-[#272F2F] flex items-center justify-center rounded-md">
            <Image src="/svg/share.svg" alt="share" width={26} height={26} />
          </button>

          <Image src="/image/chart.png" alt="thumb" fill className="object-cover" />

          <div className="absolute bottom-3 right-3 left-3">
            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-white">
              <div className="flex items-center gap-2">
                <Image src={"/svg/whiteCalender.svg"} alt="date" width={22} height={22} />
                <span>3 روز پیش</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src={"/svg/whiteEye.svg"} alt="views" width={20} height={16} />
                <span>44 بازدید</span>
              </div>
            </div>
            <h1 className="mt-2 text-white font-semibold">چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر</h1>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-6 lg:h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SmallCard />
            <SmallCard />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SmallCard />
            <SmallCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function SmallCard() {
  return (
    <div className="relative rounded-md overflow-hidden h-[220px] lg:h-full">
      <Image src={"/image/towers.png"} alt="thumb" fill className="object-cover" />
      <div className="absolute bottom-3 right-3 left-3">
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white">
          <div className="flex items-center gap-2">
            <Image src={"/svg/whiteCalender.svg"} alt="date" width={20} height={20} />
            <span>3 روز پیش</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src={"/svg/whiteEye.svg"} alt="views" width={18} height={14} />
            <span>44 بازدید</span>
          </div>
        </div>
        <h2 className="mt-2 text-white font-semibold">چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر</h2>
      </div>
    </div>
  );
}

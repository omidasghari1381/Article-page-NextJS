// components/home/VideoCart.tsx
import Image from "next/image";

export default function VideoCart() {
  return (
    <div className="bg-white border rounded-md p-3 h-full">
      <div className="relative w-full aspect-video lg:aspect-auto lg:h-[70%] rounded-md overflow-hidden mb-4">
        <Image src="/image/a.png" alt="thumb" fill className="object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src="/svg/play.svg" alt="play" width={60} height={60} />
        </div>
      </div>

      <span className="block text-[#1C2121] text-sm sm:text-base font-semibold line-clamp-2">
        چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
      </span>
    </div>
  );
}

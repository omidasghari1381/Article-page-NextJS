import Image from "next/image";
import VideoCart from "./VideoCart";

export default function Video() {
  return (
    <section className="my-10">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/svg/Rectangle.svg" alt="thumb" width={8} height={36} />
          <h3 className="text-xl font-semibold text-[#1C2121] dark:text-white">
            آخرین ویدیوها
          </h3>
        </div>

        <button className="self-start sm:self-auto px-6 sm:px-8 w-[202px] h-[56px] whitespace-nowrap bg-[#19CCA7] rounded-md flex items-center justify-center gap-2 text-white">
          <Image src="/svg/whiteEye.svg" alt="more" width={24} height={19} />
          <span className="text-base font-medium">مشاهده همه ویدیوها</span>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[540px]">
        <div className="grid gap-6 lg:grid-rows-2 lg:h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:h-full">
            <VideoCart />
            <VideoCart />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:h-full">
            <VideoCart />
            <VideoCart />
          </div>
        </div>

        <div className="relative rounded-md overflow-hidden aspect-[16/10] sm:aspect-[16/10] lg:aspect-auto lg:h-full">
          <Image
            src="/image/mac.png"
            alt="thumb"
            fill
            className="object-cover"
          />

          <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center">
            <Image
              src="/svg/play.svg"
              alt="play"
              width={160}
              height={160}
              className="dark:invert"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

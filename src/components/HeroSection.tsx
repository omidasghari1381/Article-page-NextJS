import React from "react";

export default function HeroSection() {
  return (
    <section className=" text-white w-full relative ">
      {/* هدر بالایی */}
      <div className="bg-black h-[479px] mx-auto px-4 sm:px-6 lg:px-8  grid grid-cols-1 md:grid-cols-2 gap-8 items-center overflow-hidden">
        {/* تصویر سمت چپ */}
        

        {/* متن سمت راست */}
        <div className="flex flex-col items-start space-y-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>سروش نوروزی</span>
            <span>·</span>
            <span>۳ روز پیش</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold">
            چگونه در فارکس ضرر نکنیم:
            <br />
            <span className="font-normal text-gray-300">
              راهکارهای مؤثر برای معامله‌گران موفق
            </span>
          </h1>

          <button className="bg-[#19CCA7] hover:bg-[#15b697] text-white px-6 py-3 rounded-lg font-medium transition">
            مطالعه مقاله →
          </button>
        </div>
        <div>
          <img
            src="/Image/hero1.jpg"
            alt="Trading App"
            className="rounded-lg shadow-lg h-[479px] w-[853.13px]"
          />
        </div>
      </div>

      {/* بخش کارت‌ها */}
      
      <div className=" bg-linear-[360deg,white_70%,black_100%]  mx-auto px-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6  -translate-y-20 h-[303px] w-[1280px]">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white  rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={`/Image/hero${item}.jpg`}
              alt="Article"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-sm font-bold text-gray-800 leading-6">
                چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
              </h3>
              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>۴۴ بازدید</span>
                <span>۳ روز پیش</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      
    </section>
  );
}

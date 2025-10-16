import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main>
      <section className="text-white w-full">
        <div className="relative bg-black mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch overflow-hidden rounded-xl">
          <div className="relative flex flex-col justify-center space-y-4 md:space-y-6 py-8 md:py-10 z-10 order-2 md:order-1">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300">
              <Skeleton.Block className="h-[22px] w-[22px] rounded-md" />
              <Skeleton.Line width={64} height={14} />
              <Skeleton.Line width={72} height={14} />
              <span className="opacity-60">·</span>
              <Skeleton.Block className="h-[22px] w-[22px] rounded-md" />
              <Skeleton.Line width={80} height={14} />
            </div>

            <div>
              <Skeleton.Line className="mb-3" width="70%" height={26} />
              <Skeleton.Line className="mb-1.5" width="55%" height={22} />
              <Skeleton.Line width="40%" height={22} />
            </div>

            <div className="flex w-full sm:w-auto">
              <Skeleton.Block className="w-full sm:w-44 h-12 rounded-lg" />
            </div>
          </div>

          <div className="relative min-h-[220px] sm:min-h-[300px] md:min-h-[420px] lg:min-h-[480px] order-1 md:order-2 rounded-xl overflow-hidden">
            <Skeleton.Block className="absolute inset-0 rounded-xl" />
          </div>
        </div>

        <div className="mx-auto mt-6 sm:mt-8 lg:mt-10 px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-5 md:p-6 lg:-translate-y-10">
            <div className="mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 -translate-y-20 h-[303px] w-[1280px] backdrop-blur-[100px] rounded-lg justify-center">
              <div className="md:col-span-full md:hidden">
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mb-2 align-middle">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="min-w-[260px] max-w-[260px] snap-start bg-white/20 rounded-lg overflow-hidden"
                    >
                      <div className="relative w-full h-40">
                        <Skeleton.Block className="absolute inset-0" />
                      </div>
                      <div className="p-4">
                        <Skeleton.Line
                          className="mb-2"
                          height={14}
                          width="85%"
                        />
                        <Skeleton.Line height={12} width="60%" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`md-${i}`}
                  className="hidden md:block bg-white/20 rounded-lg overflow-hidden"
                >
                  <div className="relative w-full h-40 md:h-44 lg:h-48">
                    <Skeleton.Block className="absolute inset-0" />
                  </div>
                  <div className="p-4">
                    <Skeleton.Line className="mb-2" height={16} width="90%" />
                    <div className="mt-3 space-x-0 space-y-2 md:space-y-0 md:space-x-6 flex md:block items-center text-xs text-gray-300">
                      <Skeleton.Line height={12} width="40%" />
                      <Skeleton.Line
                        className="md:mt-3"
                        height={12}
                        width="35%"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="px-4 sm:px-6 lg:px-10 xl:px-20 pb-10">
        <section>
          {/* هدر: آیکون مستطیل + تیتر */}
          <div className="flex items-center gap-3">
            <Skeleton.Block className="h-11 w-2 rounded-md" />
            <Skeleton.Line width={180} height={22} />
          </div>

          {/* دکمه‌های دسته‌بندی (اسکرول افقی در موبایل، wrap در sm+) */}
          <div className="my-5 flex gap-2 overflow-x-auto no-scrollbar sm:flex-wrap sm:overflow-visible">
            {/* دکمه "همه" */}
            <Skeleton.Block className="h-9 w-16 rounded-md" />
            {/* چند دکمه‌ی تصادفی برای پر شدن فضا */}
            <Skeleton.Block className="h-9 w-20 rounded-md" />
            <Skeleton.Block className="h-9 w-24 rounded-md" />
            <Skeleton.Block className="h-9 w-16 rounded-md" />
            <Skeleton.Block className="h-9 w-28 rounded-md" />
            <Skeleton.Block className="h-9 w-20 rounded-md" />
          </div>

          {/* کارت مقاله انتخاب سردبیر */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* تصویر تامبنیل با گرادینت و بافت */}
            <div className="relative w-full sm:w-48 md:w-56 aspect-[16/9] sm:aspect-[16/10] overflow-hidden rounded-md">
              {/* بدنه‌ی اصلی اسکلتون (پس‌زمینه خاکستری) */}
              <Skeleton.Block className="absolute inset-0 rounded-md bg-gray-300 dark:bg-gray-600" />

              {/* گرادینت روی تصویر */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent opacity-40" />

              {/* لایه‌ی نویز (اختیاری برای طبیعی‌تر شدن) */}
              <div className="absolute inset-0 opacity-10 bg-[url('/Image/noise.png')] bg-repeat bg-[length:auto]" />
            </div>

            {/* متن و متادیتا */}
            <div className="flex-1 min-w-0 w-full">
              {/* عنوان دو خطی */}
              <Skeleton.Line className="mb-2" height={18} width="90%" />
              <Skeleton.Line className="mb-1.5" height={16} width="70%" />

              {/* ردیف تاریخ و بازدید */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <Skeleton.Block className="h-5 w-5 rounded-sm" />
                  <Skeleton.Line height={12} width={90} />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton.Block className="h-[14px] w-[18px] rounded-sm" />
                  <Skeleton.Line height={12} width={100} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-10">
          <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* کارت اول */}
            <div className="p-4 sm:p-5">
              {/* هدر */}
              <div className="flex items-center gap-3 mb-4">
                <Skeleton.Block className="h-11 w-2 rounded-md" />
                <Skeleton.Line width={140} height={20} />
              </div>

              {/* جدول جفت‌ارزها */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 px-3 py-3 border-b last:border-b-0"
                  >
                    {/* بخش چپ: آیکون و اطلاعات نام */}
                    <div className="flex items-center gap-3">
                      <Skeleton.Block className="h-[34px] w-[48px] rounded-md" />
                      <div className="space-y-1">
                        <Skeleton.Line width={60} height={14} />
                        <Skeleton.Line width={40} height={12} />
                      </div>
                    </div>

                    {/* بخش راست: قیمت و درصد تغییر */}
                    <div className="text-left min-w-[90px] space-y-1">
                      <Skeleton.Line width={60} height={14} />
                      <Skeleton.Line width={40} height={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* کارت دوم */}
            <div className="p-4 sm:p-5">
              {/* هدر */}
              <div className="flex items-center gap-3 mb-4">
                <Skeleton.Block className="h-9 w-2 rounded-md" />
                <Skeleton.Line width={140} height={20} />
              </div>

              {/* جدول جفت‌ارزها */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 px-3 py-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton.Block className="h-[34px] w-[48px] rounded-md" />
                      <div className="space-y-1">
                        <Skeleton.Line width={60} height={14} />
                        <Skeleton.Line width={40} height={12} />
                      </div>
                    </div>

                    <div className="text-left min-w-[90px] space-y-1">
                      <Skeleton.Line width={60} height={14} />
                      <Skeleton.Line width={40} height={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* === Educational (مقالات آموزشی) – Skeleton === */}
          <section className="mt-12">
            {/* هدر: آیکون مستطیل + تیتر */}
            <div className="flex items-center gap-3">
              <Skeleton.Block className="h-9 w-2 rounded-md" />
              <Skeleton.Line width={180} height={22} />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h[540px] lg:h-[540px]">
              {/* کارت اصلی سمت چپ */}
              <div className="relative rounded-md overflow-hidden aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto lg:h-full">
                {/* دکمه اشتراک‌گذاری (بالا-راست) */}
                <div className="absolute top-3 right-3 z-10 w-11 h-11 rounded-md">
                  <Skeleton.Block className="w-full h-full rounded-md" />
                </div>

                {/* پس‌زمینه تصویر */}
                <div className="absolute inset-0 rounded-md overflow-hidden">
                  <Skeleton.Block className="absolute inset-0 rounded-md bg-gray-300 dark:bg-gray-600" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent opacity-50" />
                </div>

                {/* اوورلی متادیتا + عنوان (پایین) */}
                <div className="absolute bottom-3 right-3 left-3">
                  <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-white">
                    <div className="flex items-center gap-2">
                      <Skeleton.Block className="h-[22px] w-[22px] rounded-sm" />
                      <Skeleton.Line height={12} width={80} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton.Block className="h-[16px] w-[20px] rounded-sm" />
                      <Skeleton.Line height={12} width={100} />
                    </div>
                  </div>
                  <Skeleton.Line className="mt-2" height={18} width="85%" />
                </div>
              </div>

              {/* ستون راست: 2×2 کارت کوچک */}
              <div className="grid grid-rows-2 gap-6 lg:h-full">
                {/* ردیف اول: دو کارت */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[0, 1].map((i) => (
                    <div
                      key={`edu-top-${i}`}
                      className="relative rounded-md overflow-hidden h-[220px] lg:h-full"
                    >
                      <Skeleton.Block className="absolute inset-0 rounded-md bg-gray-300 dark:bg-gray-600" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent opacity-50" />
                      <div className="absolute bottom-3 right-3 left-3">
                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white">
                          <div className="flex items-center gap-2">
                            <Skeleton.Block className="h-5 w-5 rounded-sm" />
                            <Skeleton.Line height={12} width={80} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton.Block className="h-[14px] w-[18px] rounded-sm" />
                            <Skeleton.Line height={12} width={90} />
                          </div>
                        </div>
                        <Skeleton.Line
                          className="mt-2"
                          height={16}
                          width="90%"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ردیف دوم: دو کارت */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[0, 1].map((i) => (
                    <div
                      key={`edu-bot-${i}`}
                      className="relative rounded-md overflow-hidden h-[220px] lg:h-full"
                    >
                      <Skeleton.Block className="absolute inset-0 rounded-md bg-gray-300 dark:bg-gray-600" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent opacity-50" />
                      <div className="absolute bottom-3 right-3 left-3">
                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white">
                          <div className="flex items-center gap-2">
                            <Skeleton.Block className="h-5 w-5 rounded-sm" />
                            <Skeleton.Line height={12} width={80} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton.Block className="h-[14px] w-[18px] rounded-sm" />
                            <Skeleton.Line height={12} width={90} />
                          </div>
                        </div>
                        <Skeleton.Line
                          className="mt-2"
                          height={16}
                          width="88%"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="mt-10">
            <div className="relative w-full rounded-lg overflow-hidden">
              <div className="w-full aspect-[1285/367] rounded-lg overflow-hidden relative">
                <Skeleton.Block className="absolute inset-0 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent opacity-40" />
                <div className="absolute inset-0 opacity-10 bg-[url('/Image/noise.png')] bg-repeat bg-[length:auto]" />
              </div>
            </div>
          </section>
          <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* === LatestArticle (آخرین مقالات) – Skeleton === */}
              <section>
                {/* هدر */}
                <div className="flex items-center gap-3 py-6">
                  <Skeleton.Block className="h-9 w-2 rounded-md" />
                  <Skeleton.Line width={160} height={22} />
                </div>

                {/* لیست مقالات */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <article key={i} className="mb-2">
                      {/* تامبنیل */}
                      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-md">
                        <Skeleton.Block className="absolute inset-0 rounded-md bg-gray-300 dark:bg-gray-600" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent opacity-40" />
                      </div>

                      {/* متادیتا (دسته‌بندی + تاریخ + بازدید) */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          {/* بج دسته‌بندی */}
                          <div className="relative">
                            <Skeleton.Block className="h-[34px] w-[108px] rounded-sm" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Skeleton.Line width={50} height={10} />
                            </div>
                          </div>
                          {/* تاریخ */}
                          <Skeleton.Line width={60} height={14} />
                        </div>

                        {/* بازدید */}
                        <div className="flex items-center gap-2">
                          <Skeleton.Block className="h-[14px] w-[18px] rounded-sm" />
                          <Skeleton.Line width={70} height={12} />
                        </div>
                      </div>

                      {/* عنوان و توضیح */}
                      <div className="mt-2 space-y-3">
                        <Skeleton.Line height={18} width="90%" />
                        <Skeleton.Line height={16} width="70%" />
                        <Skeleton.Lines
                          lines={2}
                          heights={[14, 14]}
                          widths={["95%", "85%"]}
                        />
                      </div>
                    </article>
                  ))}
                </div>

                {/* دکمه مشاهده همه مقالات */}
                <div className="mt-6 flex justify-center">
                  <div className="px-6 sm:px-8 h-12 rounded-md flex items-center gap-2 bg-gray-300 dark:bg-gray-600">
                    <Skeleton.Block className="h-[19px] w-[24px] rounded-sm" />
                    <Skeleton.Line width={140} height={16} />
                  </div>
                </div>
              </section>{" "}
            </div>
            <aside className="lg:col-span-1">
              {/* === SidebarLatest (محبوب‌ترین مقالات) – Skeleton === */}
              <aside>
                {/* هدر */}
                <div className="flex items-center gap-3 px-2 sm:px-4 py-6">
                  <Skeleton.Block className="h-9 w-2 rounded-md" />
                  <Skeleton.Line width={180} height={22} />
                </div>

                {/* لیست کارت‌ها */}
                <div className="px-2 sm:px-4 pb-4 space-y-6 sm:space-y-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="group block transition">
                      <div className="relative w-full aspect-[16/10] sm:aspect-[3/2] rounded-md overflow-hidden">
                        {/* تامبنیل */}
                        <Skeleton.Block className="absolute inset-0 rounded-md bg-gray-300 dark:bg-gray-600" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

                        {/* بج دسته‌بندی (اگر باشد) */}
                        <div className="absolute top-3 right-3">
                          <div className="relative inline-block">
                            <Skeleton.Block className="h-[35px] w-[108px] rounded-sm" />
                            <div className="absolute inset-0 left-3 flex items-center">
                              <Skeleton.Line width={64} height={12} />
                            </div>
                          </div>
                        </div>

                        {/* عنوان پایین کارت */}
                        <div className="absolute bottom-3 right-4 left-4">
                          <Skeleton.Line className="max-w-[92%]" height={16} />
                          <Skeleton.Line
                            className="mt-2 max-w-[70%]"
                            height={14}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>{" "}
            </aside>
          </section>{" "}
          <section className="mt-25">
            <section className="my-10">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton.Block className="h-9 w-2 rounded-md" />
                  <Skeleton.Line width={180} height={22} />
                </div>

                <div className="self-start sm:self-auto px-6 sm:px-8 w-[202px] h-[56px] rounded-md flex items-center justify-center gap-2 bg-gray-300 dark:bg-gray-600">
                  <Skeleton.Block className="h-[19px] w-[24px] rounded-sm" />
                  <Skeleton.Line width={150} height={16} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[540px]">
                {/* ستون چپ: ۴ کارت کوچک */}
                <div className="grid gap-6 lg:grid-rows-2 lg:h-full">
                  {[0, 1].map((row) => (
                    <div
                      key={`row-${row}`}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:h-full"
                    >
                      {[0, 1].map((col) => (
                        <div
                          key={`card-${row}-${col}`}
                          className="bg-white border rounded-md p-3 h-full"
                        >
                          {/* ویدیو تامبنیل */}
                          <div className="relative w-full aspect-video lg:aspect-auto lg:h-[70%] rounded-md overflow-hidden mb-4">
                            {/* بک‌گراند تصویر */}
                            <Skeleton.Block className="absolute inset-0 rounded-md bg-gray-300 dark:bg-gray-600 ring-1 ring-gray-200/70" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-50" />

                            {/* مثلث پلی */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div
                                className="w-0 h-0 opacity-80"
                                style={{
                                  borderLeft: "28px solid #6B7280", // خاکستری متوسط
                                  borderTop: "16px solid transparent",
                                  borderBottom: "16px solid transparent",
                                }}
                              />
                            </div>
                          </div>

                          {/* عنوان دو خطی */}
                          <Skeleton.Line height={16} width="92%" />
                          <Skeleton.Line
                            className="mt-2"
                            height={14}
                            width="70%"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* ستون راست: ویدیوی بزرگ */}
                <div className="relative rounded-md overflow-hidden aspect-[16/10] sm:aspect-[16/10] lg:aspect-auto lg:h-full">
                  <Skeleton.Block className="absolute inset-0 rounded-md bg-gray-300 dark:bg-gray-600 ring-1 ring-gray-200/70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-50" />

                  {/* مثلث پلی بزرگ‌تر */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-0 h-0 opacity-80"
                      style={{
                        borderLeft: "72px solid #6B7280", // خاکستری متوسط برای دکمه بزرگ
                        borderTop: "42px solid transparent",
                        borderBottom: "42px solid transparent",
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}

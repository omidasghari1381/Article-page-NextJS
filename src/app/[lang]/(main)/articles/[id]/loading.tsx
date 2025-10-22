import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="px-4 sm:px-6 lg:px-20 py-6 mx-auto">
      <nav className="flex items-center gap-2">
        <Skeleton.Line width={70} height={16} rounded="lg" />
        <span className="text-gray-300">/</span>
        <Skeleton.Line width={80} height={16} rounded="lg" />
        <span className="text-gray-300">/</span>
        <Skeleton.Line width={120} height={16} rounded="lg" />
        <span className="text-gray-300">/</span>
        <Skeleton.Line width={160} height={16} rounded="lg" />
      </nav>

      <div className="grid grid-cols-1 mt-6 lg:grid-cols-12 gap-6 lg:gap-8">
        <section className="lg:col-span-9 space-y-6">
          <article className="overflow-hidden">
            <Skeleton.Line className="my-2" width="32%" height={18} />
            <Skeleton.Line className="my-2" width="60%" height={28} />
            <div className="flex flex-wrap items-center gap-3 my-3 text-xs">
              <Skeleton.Block className="h-6 w-6 rounded-md" />
              <Skeleton.Line width={90} height={14} />
              <span className="text-gray-300">,</span>
              <Skeleton.Block className="h-4 w-5 rounded-md" />
              <Skeleton.Line width={100} height={14} />
            </div>
            <Skeleton.Block className="w-full aspect-[16/9] rounded-xl" />
            <Skeleton.Lines className="my-6" lines={3} heights={[16, 16, 16]} />
            <div className="mt-4 border rounded-xl p-4">
              <Skeleton.Line width="38%" height={18} />
              <div className="mt-3 space-y-2">
                {[85, 72, 90].map((w, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton.Block className="mt-1 h-2.5 w-2.5 rounded-full" />
                    <Skeleton.Line width={`${w}%`} height={12} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white space-y-6 leading-8 text-lg text-slate-700">
              <div className="my-6">
                <Skeleton.Lines lines={5} heights={[16, 16, 16, 16, 16]} />
              </div>

              <div className="border border-[#EBEBEB] px-6">
                <div className="my-5">
                  <Skeleton.Block className="h-[32.57px] w-[32.57px] rounded-md" />
                </div>

                <div className="mx-4">
                  <Skeleton.Lines
                    lines={2}
                    heights={[18, 18]}
                    widths={["90%", "60%"]}
                  />
                </div>

                <div className="my-5 mr-auto rotate-180 w-fit">
                  <Skeleton.Block className="h-[32.57px] w-[32.57px] rounded-md" />
                </div>
              </div>

              <div className="mt-10">
                <Skeleton.Lines lines={4} heights={[16, 16, 16, 16]} />
              </div>
            </div>
            <div className="flex flex-col gap-4 my-6 lg:flex-row lg:items-stretch">
              <div className="relative w-full lg:w-[291.14px]">
                <div className="relative w-full aspect-[16/9] lg:aspect-auto lg:h-[163.5px] overflow-hidden rounded-xl">
                  <div className="absolute inset-0">
                    <Skeleton.Block className="w-full h-full rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="w-full rounded-xl border border-[#E4E4E4] bg-white p-5 flex flex-col justify-between h-auto lg:h-[163.5px]">
                <div className="mb-3 flex items-center text-[#3B3F3F]">
                  <Skeleton.Avatar size={33} />
                  <Skeleton.Line className="ml-3" width={140} height={12} />
                </div>

                <div className="min-w-0 flex-1">
                  <Skeleton.Line className="my-3" width="80%" height={16} />

                  <div className="flex flex-wrap gap-3">
                    <div className="flex h-8 items-center gap-2 rounded-sm bg-[#E4E4E43B] px-2">
                      <Skeleton.Block className="h-[14.38px] w-[14.38px] rounded" />
                      <Skeleton.Line width={72} height={12} />
                    </div>
                    <div className="flex h-8 items-center gap-2 rounded-sm bg-[#E4E4E43B] px-2">
                      <Skeleton.Block className="h-[14.38px] w-[14.38px] rounded" />
                      <Skeleton.Line width={84} height={12} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <aside className="lg:col-span-3  lg:w-[105%]">
          <div className="flex items-center gap-3 px-2 sm:px-4 py-6">
            <Skeleton.Block className="h-11 w-2 rounded-md" />
            <Skeleton.Line width={160} height={22} />
          </div>

          <div className="px-2 sm:px-4 pb-4 space-y-6 sm:space-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="group block transition">
                <div className="relative w-full aspect-[16/10] sm:aspect-[3/2] rounded-md overflow-hidden">
                  <Skeleton.Block className="w-full h-full rounded-md" />
                  <div className="absolute bottom-3 right-4 left-4">
                    <Skeleton.Line className="max-w-[90%]" height={16} />
                    <Skeleton.Line className="mt-2 max-w-[65%]" height={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-10 rounded-sm bg-white border border-slate-200 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3">
          <Skeleton.Block className="h-[32px] w-[6px] rounded-sm" />
          <Skeleton.Block className="h-[21px] w-[21px] rounded-md" />
          <Skeleton.Line width={140} height={20} />
        </div>

        <div className="mt-4 sm:mt-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Skeleton.Block className="h-11 w-full rounded-xl" />
            <Skeleton.Block className="h-11 w-28 rounded-xl" />
          </div>
        </div>

        <div className="mt-6 space-y-4 md:space-y-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <article
              key={i}
              className="rounded-2xl border border-slate-200 p-3 sm:p-4 md:p-5 shadow-xs bg-[#FBFBFB]"
              dir="rtl"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <Skeleton.Block className="rounded-full ring-1 ring-slate-200 bg-slate-100 shrink-0 w-9 h-9 sm:w-10 sm:h-10" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 min-w-0">
                    <Skeleton.Line
                      className="sm:mt-0"
                      width={120}
                      height={18}
                    />
                    <span className="hidden sm:inline text-slate-300">,</span>
                    <div className="flex items-center gap-1.5">
                      <Skeleton.Block className="h-5 w-5 rounded-sm" />
                      <Skeleton.Line width={80} height={14} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-1 md:mt-0">
                  <Skeleton.Block className="w-10 h-10 sm:w-[42.67px] sm:h-[42.67px] rounded-md" />
                  <Skeleton.Block className="w-10 h-10 sm:w-[42.67px] sm:h-[42.67px] rounded-md" />
                  <Skeleton.Block className="h-10 sm:h-[42.67px] px-3 sm:w-[84.27px] rounded-md" />
                </div>
              </div>
              <div className="mt-3">
                <Skeleton.Lines
                  lines={3}
                  heights={[16, 16, 16]}
                  widths={["95%", "88%", "70%"]}
                />
              </div>
              <div className="mt-3">
                <Skeleton.Line width={120} height={14} />
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="w-full h-0.5 bg-gray-200 relative my-20">
        <div className="absolute right-0 top-0 h-0.5 bg-emerald-400 w-1/3"></div>
      </div>
    </main>
  );
}

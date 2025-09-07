"use client";
import SummaryDropdown from "@/components/summery";
import Image from "next/image";
import { useMemo } from "react";

export default function ArticleDetailPage() {
  const latestPosts = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        title: "عنوان نمونه برای جدیدترین مقالات",
        date: "5 دقیقه پیش",
        readTime: "7 دقیقه",
        tag: i === 1 ? "آموزشی" : undefined,
      })),
    []
  );

  const comments = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        author: "کاربر نمونه",
        avatar: "/placeholder-avatar.png",
        time: "3 ساعت پیش",
        text: "متن تستی برای کامنت کاربر. اینجا صرفاً جهت نمایش استایل‌ها استفاده شده است.",
      })),
    []
  );

  const relatedPosts = useMemo(
    () =>
      Array.from({ length: 1 }, (_, i) => ({
        id: i + 1,
        title:
          "چگونه در فارکس ضرر نکنیم (راهکارهای موثر برای معامله‌گران موفق)",
        date: "دیروز",
        readTime: "7 دقیقه",
      })),
    []
  );

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6">
      <HeaderBar />
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 mt-6">
        <section className="lg:col-span-9 space-y-8">
          <HeroCard />
          <ArticleBody />
          <InlineNextCard />
          <CommentsBlock comments={comments} />
          <RelatedArticles posts={relatedPosts} />
          <FooterMeta />
        </section>
        <aside className="lg:col-span-3 space-y-6">
          <SidebarLatest posts={latestPosts} />
        </aside>
      </div>
    </main>
  );
}

// —————————————————————————————————————————
// Components
// —————————————————————————————————————————

function HeaderBar() {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5 text-base text-[#757878] font-normal">
        <span className="i-tabler-home-2" />
        <span>مای پراپ</span>
        <span className="mx-1">&gt;</span>
        <span>مقالات</span>
        <span className="mx-1">&gt;</span>
        <span>آموزش فارکس</span>
        <span className="mx-1">&gt;</span>
        <span className="text-slate-900 font-medium">
          چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-2"></div>
    </div>
  );
}

function SidebarLatest({ posts }: { posts: any[] }) {
  return (
    <div className="rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-4">
        <Image
          src="/svg/Rectangle.svg"
          alt="thumb"
          width={6.686567306518555}
          height={36.29850769042969}
        />
        <h3 className="text-xl font-semibold  text-[#1C2121]">
          محبوب ترین مقالات
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {posts.map((p) => (
          <SidebarCard key={p.id} {...p} />
        ))}
      </div>
    </div>
  );
}

function SidebarCard({
  title,
  date,
  readTime,
  tag,
}: {
  title: string;
  date: string;
  readTime: string;
  tag?: string;
}) {
  return (
    <article className="group grid grid-cols-10 gap-3">
      <div className="col-span-4 relative overflow-hidden rounded-sm h-[236px] w-[362px]">
        <Image
          src="/image/hero1.jpg"
          alt="thumb"
          fill
          className="object-cover"
        />
        <Image
          src="/image/Rectanglepoint.png"
          alt="Rectangle"
          width={108}
          height={34.656715393066406}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121515] to-[#121515]/0" />
        {tag && (
          <span className="absolute top-2 left-2 rounded-full bg-black/60 text-white text-[10px] px-2 py-0.5 shadow">
            {tag}
          </span>
        )}
      </div>
      <div className="col-span-6 flex flex-col">
        <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {title}
        </h4>
        <div className="mt-auto text-[12px] text-slate-500 flex items-center gap-2">
          <span>{date}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{readTime}</span>
        </div>
      </div>
    </article>
  );
}

function HeroCard() {
  return (
    <article className=" overflow-hidden ">
      <h3 className="my-3 text-base font-medium leading-9 text-slate-900">
        راهکارهای مؤثر برای معامله‌گران موفق{" "}
      </h3>
      <h1 className="my-3 text-2xl font-bold leading-9 text-slate-900">
        چگونه در فارکس ضرر نکنیم؛ راهکارهای موثر برای معامله‌گران موفق
      </h1>
      <div className="relative">
        {" "}
        <div className="flex flex-wrap items-center gap-3 my-3 text-xs text-[#2E3232]">
          <Image
            src="/svg/time.svg"
            alt="cover"
            width={24.367347717285156}
            height={24.367347717285156}
          />
          <span>منتشر شده: همین حالا</span>
          <span>,</span>
          <Image src="/svg/eye.svg" alt="cover" width={18} height={14} />
          <span>۲۴۴ بازدید</span>
        </div>
        <div className="relative h-72 sm:h-96">
          <Thumbnail
            mainImage="/image/a.png"
            label="dasf"
            width={862.0591430664062}
            height={484.0133056640625}
            labelImage="/svg/Rectangle3.svg"
            lWidth={145.64422607421875}
            lHeight={46.73657989501953}
          />
        </div>
      </div>
      <div className="p-5 sm:p-8">
        <p className="mt-3 text-[#4A5054] text-lg leading-7">
          با زیرساختی سریع، پلتفرمی امن، و تحلیل‌هایی مبتنی بر داده‌های لحظه‌ای،
          ما به تو کمک می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر تحلیل کنی و
          هوشمندانه‌تر معامله کنی.
        </p>
      </div>{" "}
      <SummaryDropdown
        title="خلاصه انچه در مقاله میخوانیم"
        items={[
          { id: 1, text: "چگونه در فارکس ضرر نکنیم", href: "#" },
          { id: 2, text: "مدیریت ریسک در معاملات" },
        ]}
      />
    </article>
  );
}

function Thumbnail({
  mainImage,
  labelImage,
  label,
  width,
  height,
  lWidth,
  lHeight,
}: {
  mainImage: string;
  labelImage: string;
  label: string;
  lWidth: number;
  width: number;
  height: number;
  lHeight: number;
}) {
  return (
    <div
      className="relative rounded-lg overflow-hidden border border-gray-200"
      style={{ width, height }}
    >
      <Image
        src={mainImage}
        alt="main"
        width={width}
        height={height}
        className="object-cover"
      />
      <Image
        src={labelImage}
        alt="main"
        width={lWidth}
        height={lHeight}
        className=" absolute object-cover border-[4.35px]"
      />
      {label}
    </div>
  );
}

function ArticleBody() {
  return (
    <div className=" bg-white  space-y-6 leading-8 text-lg text-slate-700">
      <p>
        اجرای بی‌نقص استراتژی معاملاتی به مدیریت ریسک وابسته است. اینجا صرفاً
        متن نمونه قرار گرفته است تا ترکیب فاصله‌گذاری و تایپوگرافی را نشان دهد.
        لطفاً با محتوای واقعی خود جایگزین کنید.
      </p>
      <div className="border border-[#EBEBEB] px-6 ">
        <Image
          src="/svg/Frame.svg"
          alt="cover"
          width={32.57483673095703}
          height={32.57483673095703}
          className="my-5"
        />
        <p className="mx-4">
          علیرضا عسکری در گفت و گو با خبرنگار مهر با بیان اینکه خبر ریزش سقف
          آرامگاه اردشیر دوم در تخت جمشید صحت ندارد، گفت: بررسی‌های کارشناسان
          این مجموعه از این آرامگاه عوارضی که بر سقف و دیواره این بنا مشاهده
          می‌شود.
        </p>
        <Image
          src="/svg/Frame.svg"
          alt="cover"
          width={32.57483673095703}
          height={32.57483673095703}
          className="block my-5 mr-auto rotate-180"
        />
      </div>
      <p>
        با زیرساختی سریع، پلتفرمی امن، و تحلیل‌هایی مبتنی بر داده‌های لحظه‌ای،
        ما به تو کمک می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر تحلیل کنی و
        هوشمندانه‌تر معامله کنی.با زیرساختی سریع، پلتفرمی امن، و تحلیل‌هایی
        مبتنی بر داده‌های لحظه‌ای، ما به تو کمک می‌کنیم تا فرصت‌ها را زودتر
        ببینی، دقیق‌تر تحلیل کنی و هوشمندانه‌تر معامله کنی.با زیرساختی سریع،
        پلتفرمی امن، و تحلیل‌هایی مبتنی بر داده‌های لحظه‌ای، ما به تو کمک
        می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر تحلیل کنی و هوشمندانه‌تر
        معامله کنی.با زیرساختی سریع، پلتفرمی امن، و تحلیل‌هایی مبتنی بر داده‌های
        لحظه‌ای، ما به تو کمک می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر تحلیل
        کنی و هوشمندانه‌تر معامله کنی.
      </p>
      <div className="flex gap-1">
        <div className=" border border-[#E4E4E4] "></div>
      </div>
    </div>
  );
}

function InlineNextCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex items-center gap-4">
      <div className="relative w-28 sm:w-36 aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-slate-200 bg-slate-50">
        <Image
          src="/placeholder-640x480.jpg"
          alt="next"
          fill
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] text-slate-500">مقاله مرتبط</p>
        <h4 className="font-bold text-slate-900 truncate">
          چگونه در فارکس ضرر نکنیم؛ راهکارهای موثر برای معامله‌گران موفق
        </h4>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
          <span>یک روز پیش</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>7 دقیقه مطالعه</span>
        </div>
      </div>
      <button className="ms-auto shrink-0 px-3 py-1.5 text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
        ادامه مطلب
      </button>
    </div>
  );
}

function CommentsBlock({ comments }: { comments: any[] }) {
  return (
    <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 sm:p-8">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900">نظرات کاربران</h3>
        <button className="text-sm px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50">
          افزودن نظر
        </button>
      </div>

      <div className="mt-6 space-y-5">
        {comments.map((c) => (
          <CommentItem key={c.id} {...c} />
        ))}
      </div>
    </section>
  );
}

function CommentItem({
  author,
  avatar,
  time,
  text,
}: {
  author: string;
  avatar: string;
  time: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 p-4 shadow-xs bg-white">
      <div className="flex items-start gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-slate-200 bg-slate-100">
          <Image
            src={avatar || "/placeholder-avatar.png"}
            alt={author}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-slate-900">{author}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{time}</span>
          </div>
          <p className="mt-1 text-[15px] leading-7 text-slate-700">{text}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <button className="px-2 py-1 rounded-lg hover:bg-slate-50">
              پاسخ
            </button>
            <button className="px-2 py-1 rounded-lg hover:bg-slate-50">
              گزارش
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function RelatedArticles({ posts }: { posts: any[] }) {
  return (
    <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 sm:p-8">
      <h3 className="font-extrabold text-slate-900">مقالات مشابه</h3>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((p) => (
          <RelatedCard key={p.id} {...p} />
        ))}
      </div>
    </section>
  );
}

function RelatedCard({
  title,
  date,
  readTime,
}: {
  title: string;
  date: string;
  readTime: string;
}) {
  return (
    <article className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/9] bg-slate-50">
        <Image
          src="/placeholder-1280x720.jpg"
          alt="related"
          fill
          className="object-cover"
        />
        <button className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs shadow">
          آموزش
        </button>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
          {title}
        </h4>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
          <span>{date}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{readTime}</span>
        </div>
      </div>
    </article>
  );
}

function FooterMeta() {
  return (
    <section className="space-y-6">
      <ShareStrip />
      <RiskWarning />
      <JurisdictionDisclaimer />
    </section>
  );
}

function ShareStrip() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          این مطلب را در شبکه‌های اجتماعی به اشتراک بگذارید
        </div>
        <div className="flex items-center gap-2">
          {["instagram", "telegram", "x", "whatsapp"].map((k) => (
            <button
              key={k}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50"
              aria-label={k}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RiskWarning() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <h4 className="font-bold text-amber-900">Risk Warning</h4>
      <p className="mt-2 text-amber-900/80 text-sm leading-7">
        معاملات ابزارهای مالی با ریسک بالایی همراه است و ممکن است منجر به از دست
        رفتن تمام سرمایه شما شود. این یک متن نمایشی است. قبل از هرگونه
        سرمایه‌گذاری با مشاور مالی خود مشورت کنید.
      </p>
    </div>
  );
}

function JurisdictionDisclaimer() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="font-bold text-slate-900">Jurisdiction Disclaimer</h4>
      <p className="mt-2 text-slate-600 text-sm leading-7">
        خدمات ممکن است در برخی کشورها در دسترس نباشد. این متن صرفاً نمونه است و
        باید با محتوای حقوقی واقعی جایگزین شود.
      </p>
      <details className="mt-2 text-sm text-slate-600">
        <summary className="cursor-pointer select-none">
          مشاهده جزئیات بیشتر
        </summary>
        <div className="mt-2 text-slate-600 leading-7">
          توضیحات تکمیلی درباره محدودیت‌های ارائه خدمات و قوانین محلی.
        </div>
      </details>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-extrabold text-slate-900">{children}</h3>;
}

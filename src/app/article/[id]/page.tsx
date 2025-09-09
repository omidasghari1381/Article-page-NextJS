"use client";
import Breadcrumb from "@/components/Breadcrumb";
import RepliesAccordion from "@/components/Reply";
import SummaryDropdown from "@/components/Summery";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { timeAgoFa } from "@/app/utils/date";

type ArticleDetail = {
  id: string;
  title: string;
  subject: string;
  category: string;
  readingPeriod: string;
  showStatus: boolean;
  viewCount: number;
  thumbnail: string | null;
  Introduction: string | null;
  mainText: string;
  secondryText: string;
  author: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
};

type LiteArticle = {
  id: string;
  title: string;
  createdAt: string;
  readingPeriod: string;
  category: string;
  thumbnail: string | null;
};

type HeroCardProps = {
  title: string;
  subject: string;
  introduction?: string | null;
  thumbnail?: string | null;
  createdAt: string;
  viewCount: number;
  category?: string | null;
};

type ThumbnailProps = {
  thumbnail?: string | null;
  category?: string | null;
};

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [latest, setLatest] = useState<LiteArticle[]>([]);
  const [related, setRelated] = useState<LiteArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancel = false;
    const source = axios.CancelToken.source();

    (async () => {
      try {
        setLoading(true);

        const { data: a } = await axios.get<ArticleDetail>(
          `/api/articles/${encodeURIComponent(id)}`,
          { cancelToken: source.token }
        );
        console.log("📄 Article detail:", a);
        if (!cancel) setArticle(a);

        const { data: l } = await axios.get<{ items: LiteArticle[] }>(
          `/api/articles`,
          { params: { perPage: 4, showStatus: 1 }, cancelToken: source.token }
        );
        console.log("📰 Latest articles:", l);
        if (!cancel) setLatest(l.items || []);

        if (a?.category) {
          const { data: r } = await axios.get<{ items: LiteArticle[] }>(
            `/api/articles`,
            {
              params: { perPage: 3, showStatus: 1, category: a.category },
              cancelToken: source.token,
            }
          );
          console.log("🔗 Related articles:", r);

          const rel = (r.items || []).filter((x) => x.id !== a.id);
          if (!cancel) setRelated(rel);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("axios error:", err);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
      source.cancel("route changed");
    };
  }, [id]);

  const latestPosts = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
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
        time: "دوشنبه 17 بهمن 1401 ساعت 12:40",
        text: "چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق",
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
    <main className="  px-3 lg:px-8 py-6">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "مقالات", href: "/" },
          { label: article?.category || "—", href: "/" },
          { label: article?.title || "..." },
        ]}
      />
      <div className="hidden lg:grid lg:grid-cols-13 gap-2 mt-6">
        <section className="lg:col-span-9 space-y-8">
          <div>
            {article && (
              <HeroCard
                title={article.title}
                subject={article.subject}
                introduction={article.Introduction}
                thumbnail={article.thumbnail}
                createdAt={article.createdAt}
                viewCount={article.viewCount}
                category={article.category}
              />
            )}

            <ArticleBody
              mainText={article?.mainText}
              secondryText={article?.secondryText}
            />

            <div className="flex items-start gap-4 my-6">
              <Thumbnaill />
              <InlineNextCard />
            </div>
          </div>
        </section>
        <aside className="lg:col-span-3 space-y-9 ">
          <SidebarLatest posts={latestPosts} />
        </aside>{" "}
      </div>{" "}
      <div>
        <CommentsBlock comments={comments} />
        <RelatedArticles posts={relatedPosts} />
      </div>
      <Divider />
    </main>
  );
}

// —————————————————————————————————————————
// Components
// —————————————————————————————————————————

// function HeaderBar() {
//   return (
//     <div className="flex items-center justify-between py-2">
//       <div className="flex items-center gap-2.5 text-base text-[#757878] font-normal">
//         <span className="i-tabler-home-2" />
//         <span>مای پراپ</span>
//         <span className="mx-1">&gt;</span>
//         <span>مقالات</span>
//         <span className="mx-1">&gt;</span>
//         <span>آموزش فارکس</span>
//         <span className="mx-1">&gt;</span>
//         <span className="text-slate-900 font-medium">
//           چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
//         </span>
//       </div>
//       <div className="hidden sm:flex items-center gap-2"></div>
//     </div>
//   );
// }

function Divider() {
  return (
    <div className="w-full h-0.5 bg-gray-200 relative my-20">
      <div className="absolute right-0 top-0 h-0.5 bg-emerald-400 w-1/3"></div>
    </div>
  );
}

function SidebarLatest({ posts }: { posts: any[] }) {
  return (
    <div className="">
      <div className="flex items-center gap-3 px-4 py-8 ">
        <Image
          src="/svg/Rectangle.svg"
          alt="thumb"
          width={6.69}
          height={36.3}
        />
        <h3 className="text-xl font-semibold text-[#1C2121]">
          محبوب ترین مقالات
        </h3>
      </div>

      <div className="px-4 pb-4 space-y-8">
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
    <article className="group">
      <div className="w-[361.66650390625px] h-[236.80545043945312px]">
        {" "}
        <div className="relative w-[361.66650390625px] h-[236.80545043945312px] rounded-md overflow-hidden">
          <Image
            src="/image/hero1.jpg"
            alt="thumb"
            fill
            className="object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="absolute top-3 right-3" dir="rtl">
            <div className="relative inline-block">
              <Image
                src="/svg/arrowLeftBlack.svg"
                alt="badge"
                width={108}
                height={34.66}
                className="block"
                priority
              />
              <span
                className="absolute inset-0 flex items-center justify-center
                   text-white text-xs font-semibold leading-none px-2"
              >
                آموزش فارکس
              </span>
            </div>
          </div>
          <div className="absolute bottom-3 right-4 text-white">
            <h5 className="sm:text-base font-medium leading-7">
              چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
            </h5>
          </div>
        </div>
      </div>
    </article>
  );
}

function HeroCard({
  title,
  introduction,
  thumbnail,
  createdAt,
  viewCount,
  subject,
  category,
}: HeroCardProps) {
  return (
    <article className="overflow-hidden">
      {introduction && (
        <h3 className="my-3 text-base font-medium leading-9 text-slate-900">
          {introduction}
        </h3>
      )}

      <h1 className="my-3 text-2xl font-bold leading-9 text-slate-900">
        {title}
      </h1>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-3 my-3 text-xs text-[#2E3232]">
          <Image src="/svg/time.svg" alt="time" width={24} height={24} />
          <span>منتشر شده: {timeAgoFa(createdAt)}</span>
          <span>,</span>
          <Image src="/svg/eye.svg" alt="views" width={18} height={14} />
          <span>{(viewCount ?? 0).toLocaleString("fa-IR")} بازدید</span>
        </div>

        <div className="relative h-72 sm:h-96">
          <Thumbnail thumbnail={thumbnail} category={category ?? undefined} />
        </div>
      </div>

      {introduction && (
        <div className="my-6">
          <p className="mt-3 text-[#4A5054] text-lg leading-7">
            {introduction}
          </p>
        </div>
      )}

      <SummaryDropdown
        title="خلاصه آنچه در مقاله می‌خوانیم"
        items={[
          { id: 1, text: title ?? "—", href: "#" },
          { id: 2, text: "مدیریت ریسک در معاملات" },
        ]}
      />
    </article>
  );
}

function Thumbnail({ thumbnail, category }: ThumbnailProps) {
  return (
    <div>
      <div className="relative h-72 sm:h-96">
        <Image
          src={thumbnail || "/image/a.png"}
          alt="cover"
          fill
          className="object-cover rounded-xl"
        />
      </div>
      <div>
        <Image
          src="/svg/Rectangle3.svg"
          alt="cover"
          width={145.64422607421875}
          height={46.73657989501953}
          className="absolute bottom-4 right-4 z-10 text-white text-xs px-3 py-1.5 rounded-sm"
        />
        <span className="absolute bottom-8 right-10 z-10 text-base font-semibold">
          {category || "—"}
        </span>
      </div>
    </div>
  );
}
function ArticleBody({
  mainText,
  secondryText,
}: {
  mainText?: string | null;
  secondryText?: string | null;
}) {
  const firstText = mainText?.trim();
  const isHTML = !!firstText && firstText.startsWith("<");

  return (
    <div className=" bg-white  space-y-6 leading-8 text-lg text-slate-700">
      {firstText ? (
        isHTML ? (
          <div
            className="leading-8 text-lg text-slate-700"
            dangerouslySetInnerHTML={{ __html: firstText }}
          />
        ) : (
          <p className="my-6 whitespace-pre-line">{firstText}</p>
        )
      ) : (
        <>
          <p className="my-6">
            اجرای بی‌نقص استراتژی معاملاتی به مدیریت ریسک وابسته است...
          </p>
          <div className="border border-[#EBEBEB] px-6 ">
            <Image
              src="/svg/Frame.svg"
              alt="cover"
              width={32.57}
              height={32.57}
              className="my-5"
            />
            <p className="mx-4 text-lg font-bold text-[#1C2121]">
              علیرضا عسکری ... مشاهده می‌شود.
            </p>
            <Image
              src="/svg/Frame.svg"
              alt="cover"
              width={32.57}
              height={32.57}
              className="block my-5 mr-auto rotate-180"
            />
          </div>
          <p className="mt-10">
            با زیرساختی سریع، پلتفرمی امن، و تحلیل‌هایی مبتنی بر داده‌های
            لحظه‌ای...
          </p>
        </>
      )}
    </div>
  );
}

function InlineNextCard() {
  return (
    <div className="flex-1 min-w-0 rounded-2xl border border-[#E4E4E4] shadow-sm px-5 ">
      <div className="flex items-center text-[#3B3F3F] my-5">
        <Image
          src="/image/author.png"
          alt="next"
          width={33.35630798339844}
          height={33.35630798339844}
          className="object-cover rounded-full ml-3"
        />
        <span className="text-xs font-medium ">نوشته شده توسط </span>
        <span className="text-xs font-medium">آرش موسوی</span>
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-slate-900 text-base truncate my-4">
          چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
        </h4>
        <div className="flex gap-4">
          <div className="mt-1 text-xs rounded-sm font-medium text-black  bg-[#E4E4E43B] w-[97.59028625488281px] h-[32.23965072631836px] flex items-center gap-2 my-4 px-2">
            <Image
              src="/svg/time.svg"
              alt="time"
              width={14.377140045166016}
              height={14.377140045166016}
            />
            <span className="">یک روز پیش</span>
          </div>
          <div className="mt-1 text-xs rounded-sm font-medium text-black  bg-[#E4E4E43B] w-[97.59028625488281px] h-[32.23965072631836px] flex items-center gap-2 my-4 px-2">
            <Image
              src="/svg/calender.svg"
              alt="time"
              width={14.377140045166016}
              height={14.377140045166016}
            />
            <span className="">5 روز پیش</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Thumbnaill() {
  return (
    <div className="relative h-[163.5px] w-[291.14px] shrink-0">
      <Image
        src="/image/a.png"
        alt="cover"
        fill
        className="object-cover rounded-xl"
      />
      <Image
        src="/svg/Rectangle3.svg"
        alt="badge"
        width={92}
        height={30}
        className="absolute bottom-2 right-2 pointer-events-none"
      />
      <span className="absolute bottom-3.5 right-5 z-10 text-xs font-semibold">
        آموزش فارکس
      </span>
    </div>
  );
}

function CommentsBlock({ comments }: { comments: any[] }) {
  return (
    <div className="rounded-sm bg-white border border-slate-200 p-5 sm:p-8 ">
      <section>
        <div className="flex items-center gap-3">
          <Image
            src="/svg/Rectangle2.svg"
            alt="thumb"
            width={5.731499671936035}
            height={31.113859176635742}
          />
          <Image
            src="/svg/comment.svg"
            alt="thumb"
            width={20.363636016845703}
            height={20.363636016845703}
          />
          <h3 className="font-extrabold text-lg text-slate-900">
            نظرات کاربران
          </h3>
        </div>
        <AddComment />
      </section>{" "}
      <div className="mt-6 space-y-5">
        {comments.map((c) => (
          <CommentItem key={c.id} {...c} />
        ))}
      </div>
    </div>
  );
}

function AddComment() {
  return (
    <div className="border bg-[#F5F5F5] h-[69.81818389892578px] w-full order-[#DADADA] my-9 px-4 flex justify-between items-center rounded-lg">
      <span className="text-sm font-medium text-[#171717]">
        برای ثبت نظر خود وارد شوید.
      </span>
      <button className="bg-[#19CCA7] flex items-center justify-center w-[137px] h-[51px] rounded-md gap-1 text-sm">
        ورود و ثبت نام
        <Image
          src="/svg/userWrite.svg"
          alt="thumb"
          width={20.363636016845703}
          height={20.363636016845703}
        />
      </button>
    </div>
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
    <article className="rounded-2xl border border-slate-200 p-4 shadow-xs bg-[#FBFBFB]">
      <div className=" gap-3">
        <div className="flex justify-between items-center ">
          <div className="flex gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-slate-200 bg-slate-100">
              <Image
                src={"/image/guy2.png"}
                alt={author}
                width={45.57575607299805}
                height={45.57575607299805}
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-base text-slate-900">
                {author}
              </span>
              <span className="text-slate-400">,</span>
              <Image
                src={"/svg/CalendarM.svg"}
                alt={author}
                width={20.36363410949707}
                height={20.36363410949707}
                className="object-cover rounded-sm"
              />
              <span className="text-[#1C2121] text-sm font-medium">{time}</span>
            </div>
          </div>
          <div className=" flex justify-between items-center gap-3">
            <button className="w-[42.666526794433594px] h-[42.666526794433594px] rounded-md flex justify-center items-center">
              {" "}
              <Image
                src={"/svg/dislike.svg"}
                alt="dislike"
                width={18.131977081298896}
                height={17.066246032714908}
                className="object-cover rounded-sm"
              />
            </button>
            <button className="w-[42.666526794433594px] h-[42.666526794433594px] rounded-md bg-[#E8FAF6] flex justify-center items-center">
              {" "}
              <Image
                src={"/svg/like.svg"}
                alt="like"
                width={18.131977081298896}
                height={17.066246032714908}
                className="object-cover rounded-sm"
              />
            </button>
            <button className="h-[42.666526794433594px] w-[84.26638793945312px] rounded-md flex justify-center items-center bg-[#E8FAF6]">
              <span className="text-[#19CCA7] text-base">پاسخ</span>
              <Image
                src={"/svg/reply.svg"}
                alt="dislike"
                width={18.131977081298896}
                height={17.066246032714908}
                className="object-cover rounded-sm"
              />
            </button>
          </div>
        </div>
        <p className="mt-1 text-[18px] font-semibold leading-7  text-[#3B3F3F]">
          {text}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"></div>
      </div>
      <RepliesAccordion className="mt-1" />{" "}
    </article>
  );
}

function RelatedArticles({ posts }: { posts: any[] }) {
  return (
    <section className="mt-14">
      <div className="flex items-center mb-6 gap-4 ">
        <Image
          src="/svg/Rectangle2.svg"
          alt="thumb"
          width={5.731499671936035}
          height={31.113859176635742}
        />
        <h3 className="font-bold text-2xl text-[#2E3232] whitespace-nowrap mt-2">
          مقالات مشابه
        </h3>
      </div>
      <div className="space-y-6">
        {posts.map((p) => (
          <div key={p.id} className="flex items-start gap-4">
            <Thumbnaill />
            <InlineNextCard />
          </div>
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
    <article className="group ">
      {/* <div className="relative aspect-[16/9] bg-slate-50">
        <Image
          src="/placeholder-1280x720.jpg"
          alt="related"
          fill
          className="object-cover"
        />
        <button className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs shadow">
          آموزش
        </button>
      </div> */}
      {/* <div className="p-4">
        <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
          {title}
        </h4>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
          <span>{date}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{readTime}</span>
        </div>
      </div> */}
      <div className="flex items-start gap-4 my-6">
        <Thumbnaill />
        <InlineNextCard />
      </div>
    </article>
  );
}

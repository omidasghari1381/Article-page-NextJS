"use client";
import HeroSection from "@/components/HeroSection";
import { articleCategoryEnum } from "@/server/modules/articles/enums/articleCategory.enum";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { timeAgoFa } from "./utils/date";
import SidebarLatest from "@/components/SidebarLatest";

type ArticleDetail = {
  id: string;
  title: string;
  subject: string;
  category: string;
  viewCount: number;
  thumbnail: string | null;
  Introduction: string | null;
  author: { id: string; firstName: string; lastName: string };
  createdAt: string;
};

type Latest = {
  thumbnail: string | null;
  viewCount: number;
  subject: string;
  createdAt: string;
};
type ApiList<T> = { items: T[]; total?: number };
export default function HomePage() {
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState<Latest[] | null>([]);
  const [selected, setSelected] = useState<articleCategoryEnum | null>(null);

  const categories = Object.values(
    articleCategoryEnum
  ) as articleCategoryEnum[];

  useEffect(() => {
    let cancel = false;
    const source = axios.CancelToken.source();

    (async () => {
      try {
        setLoading(true);
        const { data: l } = await axios.get<{ items: Latest[] }>(
          `/api/articles`,
          { params: { perPage: 4 }, cancelToken: source.token }
        );
        if (!cancel) setLatest(l.items || []);

        const { data: hero } = await axios.get<ApiList<ArticleDetail>>(
          "/api/articles",
          { params: { perPage: 1 }, cancelToken: source.token }
        );
        if (!cancel) {
          const first = Array.isArray(hero.items)
            ? hero.items[0] ?? null
            : null;
          setArticle(first);
        }
      } catch (err) {
        if (!axios.isCancel(err)) console.error("axios error:", err);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
      source.cancel("route changed");
    };
  }, []);
  const related = [
    {
      id: "1a591415-538a-462a-990d-ef3d390c1289",
      title: "DSAFADSFASDF",
      createdAt: " 2025-09-10 14:10:52.900681",
      category: " پراپ تریدینگ",
      author: {
        id: "1a591415-538a-466a-990d-ef3d390c1289",
        firstName: "امید",
        lastName: "اصغری",
      },
      thumbnail: "/image/a.png",
      readingPeriod: "7 min",
    },
    {
      id: "1a591415-538a-461a-990d-ef3d390c1289",
      title: "DSAFADSFASDF",
      createdAt: " 2025-09-10 14:10:52.900681",
      category: " پراپ تریدینگ",
      author: {
        id: "1a591415-538a-466a-990d-ef3d390c1289",
        firstName: "امید",
        lastName: "اصغری",
      },
      thumbnail: "/image/a.png",
      readingPeriod: "7 min",
    },
    {
      id: "1a591415-538a-466a-990d-ef3d390c1289",
      title: "DSAFADSFASDF",
      createdAt: " 2025-09-10 14:10:52.900681",
      category: " پراپ تریدینگ",
      author: {
        id: "1a591415-538a-466a-990d-ef3d390c1289",
        firstName: "امید",
        lastName: "اصغری",
      },
      thumbnail: "/image/a.png",
      readingPeriod: "7 min",
    },
  ];
  return (
    <main className="w-full">
      <HeroSection article={article} items={latest} />
      <div className="px-20 pb-10">
        <Chosen
          categories={categories}
          article={article}
          selected={selected}
          onSelect={setSelected}
        />
        <Markets />
        <Educational />
        <Image
          src="/image/banner.png"
          alt="thumb"
          width={1285}
          height={367}
          className="rounded-lg"
        />
        <div className="flex justify-between ">
          <LatestArticle />
          <SidebarLatest posts={related} />
        </div>
        <Video />
      </div>
    </main>
  );
}

function Chosen({
  article,
  categories,
  selected,
  onSelect,
}: {
  article: Latest | null;
  categories: articleCategoryEnum[];
  selected: articleCategoryEnum | null;
  onSelect: (v: articleCategoryEnum | null) => void;
}) {
  const baseBtn =
    "text-sm font-semibold w-[122.58209228515625px] h-[39.1px] rounded-sm border flex justify-center items-center transition whitespace-nowrap";
  const active =
    "text-white bg-gradient-to-r from-[#111414] to-[#272F2F] border-transparent";
  const inactive = "text-black border-[#D7D7D7]";

  return (
    <div>
      <div className="flex items-center gap-3">
        <Image
          src="/svg/Rectangle.svg"
          alt="thumb"
          width={6.69}
          height={36.3}
        />
        <h3 className="text-xl font-semibold text-[#1C2121]">انتخاب سردبیر</h3>
      </div>

      <div className="my-7 flex gap-3">
        <button
          onClick={() => onSelect(null)}
          className={`${baseBtn} ${selected === null ? active : inactive}`}
        >
          همه
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`${baseBtn} ${selected === cat ? active : inactive}`}
          >
            {cat}
          </button>
        ))}
      </div>
      <Article article={article} />
    </div>
  );
}

function Article({ article }: { article: Latest | null }) {
  return (
    <div className="flex items-center mb-15">
      <Image
        src={article?.thumbnail ?? "/image/a.png"}
        alt="thumb"
        width={159.5223846435547}
        height={88.8358154296875}
        className="rounded-sm"
      />
      <div className="mx-4">
        <span className="text-xl font-semibold text-[#1C2121]">
          {article?.subject}
        </span>
        <div className="flex items-center gap-3 ">
          <div className="gap-2 flex items-center ">
            <Image
              src={"/svg/calender.svg"}
              alt="thumb"
              width={21}
              height={21}
              className="rounded-sm"
            />
            <span className="text-sm text-[#373A41]">
              {article?.createdAt && timeAgoFa(article?.createdAt)}
            </span>{" "}
          </div>
          <div className="gap-2 flex items-center ">
            {" "}
            <Image
              src={"/svg/eye.svg"}
              alt="thumb"
              width={17.194028854370117}
              height={13.373133659362793}
              className="rounded-sm"
            />
            <span className="text-sm text-[#373A41]">
              بازدید {article?.viewCount}
            </span>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}

function Markets() {
  const defaultPairs: Pair[] = [
    {
      icon: "/svg/pair.svg",
      name: "EURUSD",
      price: 268,
      market: "Forex",
      difference: 5.71,
    },
    {
      icon: "/svg/pair.svg",
      name: "USDJPY",
      price: 14.32,
      market: "Forex",
      difference: -0.82,
    },
    {
      icon: "/svg/pair.svg",
      name: "BTCUSD",
      price: 280.45,
      market: "Crypto",
      difference: 2.14,
    },
  ];
  return (
    <div className="flex gap-4">
      <Market title={"بازار فارکس"} pair={defaultPairs} />
      <Market title={"ارز دیجیتال"} pair={defaultPairs} />
    </div>
  );
}
type Pair = {
  icon: string;
  name: string;
  price: number;
  market: string;
  difference: number;
};
function Market({ title, pair }: { title: string; pair: Pair[] }) {
  return (
    <div className="gap-4 ">
      <div className="flex items-center gap-3 mb-4">
        <Image
          src="/svg/Rectangle.svg"
          alt="thumb"
          width={6.69}
          height={36.3}
        />
        <h3 className="text-xl font-bold text-[#1C2121]">{title}</h3>
      </div>
      <div className="flex items-center ">
        <div>
          <Pair item={pair[0]} />
          <Pair item={pair[1]} />
          <Pair item={pair[2]} />
        </div>
        <div>
          <Pair item={pair[0]} />
          <Pair item={pair[1]} />
          <Pair item={pair[2]} />
        </div>
      </div>
    </div>
  );
}

function Pair({ item }: { item: Pair }) {
  return (
    <div className="flex  items-center justify-end gap-6 px-4  border-b w-[292.3131103515625px] h-[80.1661376953125px]">
      <div>
        <div className="text-sm font-semibold text-left text-[#2E3232]">
          ${item?.price}
        </div>
        <div className="text-sm font-semibold text-left text-[#38CB89]">
          ${item?.difference}
        </div>
      </div>
      <div className="items-center text-left">
        <h1 className="text-sm font-semibold text-[#2E3232]">{item?.name}</h1>
        <h1 className="text-xs font-normal text-[#666969]">{item?.market}</h1>
      </div>
      <Image
        src={item?.icon}
        alt="thumb"
        width={56.92251205444336}
        height={39.30363845825195}
      />
    </div>
  );
}

function Educational() {
  return (
    <div className=" mt-13">
      <div className="flex items-center gap-3 ">
        <Image
          src="/svg/Rectangle.svg"
          alt="thumb"
          width={6.69}
          height={36.3}
        />
        <h3 className="text-xl font-semibold text-[#1C2121]">مقالات آموزشی</h3>
      </div>
      <div className="flex justify-between mt-8 relative">
        <div className="relative">
          <button
            className={
              "w-[43.871158599853516px] h-[43.871158599853516px] bg-gradient-to-r from-[#111414] to-[#272F2F] flex items-center justify-center rounded-md top-5 right-5 absolute"
            }
          >
            {" "}
            <Image
              src="/svg/share.svg"
              alt="thumb"
              width={26.807537078857422}
              height={26.807537078857422}
            />
          </button>

          <Image
            src="/image/chart.png"
            alt="thumb"
            width={498}
            height={434}
            className="rounded-md "
          />
        </div>
        <div className="absolute bottom-11 right-5">
          <div className="flex items-center gap-7">
            <div className="gap-2 flex items-center ">
              <Image
                src={"/svg/whiteCalender.svg"}
                alt="thumb"
                width={29.930784225463867}
                height={29.930784225463867}
                className="rounded-sm"
              />
              <span className="text-sm text-[#FAFAFA]">3 روز پیش</span>{" "}
            </div>
            <div className="gap-2 flex items-center ">
              {" "}
              <Image
                src={"/svg/whiteEye.svg"}
                alt="thumb"
                width={24.48882293701172}
                height={19.046863555908203}
                className="rounded-sm"
              />
              <span className="text-sm text-[#FAFAFA]">44 بازدید</span>{" "}
            </div>
          </div>
          <h1 className="mt-3">چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر</h1>
        </div>{" "}
        <div>
          <Boxes />
          <Boxes />
        </div>
        <div>
          <Boxes />
          <Boxes />
        </div>
      </div>
    </div>
  );
}

function Boxes() {
  return (
    <div className=" relative">
      <Image
        src={"/image/towers.png"}
        alt="thumb"
        width={384.4200134277344}
        height={210.2225341796875}
        className="rounded-md"
      />
      <div className="absolute bottom-5 right-5">
        <div className="flex items-center gap-5">
          <div className="gap-2 flex items-center ">
            <Image
              src={"/svg/whiteCalender.svg"}
              alt="thumb"
              width={22.51401138305664}
              height={22.51401138305664}
              className="rounded-sm"
            />
            <span className="text-sm text-[#FAFAFA]">3 روز پیش</span>{" "}
          </div>
          <div className="gap-2 flex items-center ">
            {" "}
            <Image
              src={"/svg/whiteEye.svg"}
              alt="thumb"
              width={18.420555114746094}
              height={14.327098846435547}
              className="rounded-sm"
            />
            <span className="text-sm text-[#FAFAFA]">44 بازدید</span>{" "}
          </div>
        </div>
        <h1 className="mt-3">چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر</h1>
      </div>{" "}
    </div>
  );
}
function LatestArticle() {
  return (
    <div className="">
      <div className="flex items-center gap-3 py-8">
        <Image
          src="/svg/Rectangle.svg"
          alt="thumb"
          width={6.69}
          height={36.3}
        />
        <h3 className="text-xl font-semibold text-[#1C2121]">آخرین مقالات</h3>
      </div>
      <div className="">
        <div className=" gap-5 flex">
          <LateArticle />
          <LateArticle />
        </div>
        <div className="gap-5 flex">
          <LateArticle />
          <LateArticle />
        </div>
      </div>
      <div className="flex justify-center items-center">
        <button className="w-[211px] h-[56px] bg-[#19CCA7] gap-2 rounded-md flex items-center justify-center">
          {" "}
          <Image
            src={"/svg/whiteEye.svg"}
            alt="thumb"
            width={24.48882293701172}
            height={19.046863555908203}
            className="rounded-sm "
          />
          <span className="text-base font-medium">مشاهده همه مقالات</span>
        </button>{" "}
      </div>
    </div>
  );
}

function LateArticle() {
  return (
    <div className="mb-4 mx-3 justify-center">
      <Image
        src="/image/chart.png"
        alt="thumb"
        width={433.4188232421875}
        height={240.58114624023438}
        className="rounded-sm"
      />
      <div className="flex justify-between">
        {" "}
        <div className="flex items-center my-4 gap-3">
          <div className="relative inline-block">
            {" "}
            <Image
              src="/svg/arrowLeftBlack.svg"
              alt="badge"
              width={108}
              height={34.66}
              className="block rounded-sm"
              priority
            />
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold leading-none px-2">
              اموزش فارکس
            </span>
          </div>
          <span className="text-[#373A41] text-base font-medium ">
            3 روز پیش
          </span>
        </div>{" "}
        <div className="gap-2 flex items-center pl-7">
          {" "}
          <Image
            src={"/svg/eye.svg"}
            alt="thumb"
            width={17.194028854370117}
            height={13.373133659362793}
            className="rounded-sm"
          />
          <span className="text-sm text-[#373A41] ">بازدید 3</span>{" "}
        </div>
      </div>
      <p className="text-lg text-[#121212] font-bold">
        چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
      </p>
      <p className="text-sm font-normal text-[#121212] my-6">
        با زیرساختی سریع، پلتفرمی امن، و تحلیل‌هایی مبتنی بر داده‌های لحظه‌ای،
        ما به تو کمک می‌کنیم تا فرصت‌ها را زودتر ببینی، دقیق‌تر تحلیل کنی و
        هوشمندانه‌تر معامله کنی.با زیرساختی سریع{" "}
      </p>
    </div>
  );
}

function Video() {
  return (
    <div className="my-20">
      <div className="flex justify-between items-center ">
        <div className="flex items-center gap-3 mt-4">
          <Image
            src="/svg/Rectangle.svg"
            alt="thumb"
            width={6.69}
            height={36.3}
          />
          <h3 className="text-xl font-semibold text-[#1C2121]">
            آخرین ویدیو ها
          </h3>
        </div>{" "}
        <button className="w-[211px] h-[56px] bg-[#19CCA7] gap-2 rounded-md flex items-center justify-center">
          {" "}
          <Image
            src={"/svg/whiteEye.svg"}
            alt="thumb"
            width={24.48882293701172}
            height={19.046863555908203}
            className="rounded-sm "
          />
          <span className="text-base font-medium">مشاهده همه ویدیو ها</span>
        </button>{" "}
      </div>
      <div className="flex justify-between gap-4 mt-7">
        <div>
          <VideoCart />
          <VideoCart />
        </div>
        <div>
          <VideoCart />
          <VideoCart />
        </div>
        <div className="relative ">
          <Image
            src="/image/mac.png"
            alt="thumb"
            width={626.6666870117188}
            height={572.3809814453125}
          />
          <Image
            src="/svg/play.svg"
            alt="thumb"
            width={180.19835662841797}
            height={180}
            className="absolute bottom-[35%] right-[35%] "
          />
        </div>
      </div>
    </div>
  );
}

function VideoCart() {
  return (
    <div className="bg-white border rounded-sm h-[280px] w-[304.76190185546875px] p-3 mb-3 ">
      <div className="mb-6 relative">
        <Image
          src="/image/a.png"
          alt="thumb"
          width={277.40740966796875}
          height={186.6666717529297}
          className="object-cover"
        />
        <Image
          src="/svg/play.svg"
          alt="thumb"
          width={80.19835662841797}
          height={80}
          className="absolute bottom-[27%] right-[35%] "
        />
      </div>
      <span className="text-[#1C2121] text-lg font-semibold">
        چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
      </span>
    </div>
  );
}

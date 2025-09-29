import React from "react";
import { timeAgoFa } from "@/app/utils/date";

type LiteArticle = {
  id: string;
  title: string;
  subject: string;
  mainText: string;
  createdAt: string;
  category: string;
  author: { id: string; firstName: string; lastName: string };
  thumbnail: string | null;
  readingPeriod: string;
};

function Article({ article }: { article: LiteArticle | null }) {
  console.log("text",article?.mainText)
  return (
    <section>
      <div className="flex bg-gray-100 rounded-md my-10 p-4 ">
        <div>
          <img src="/image/a.png" className="w-sm h-fit"></img>
        </div>
        <div className="mr-5">
          <div className="text-black text-sm my-4 flex gap-4">
            <span>
              {article?.title
                ? article.title
                : `              چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
`}
            </span>
            <div className="text-md">
              {article?.createdAt ? timeAgoFa(article?.createdAt) : null}
            </div>
          </div>
          <div className="text-black font-bold">
            <span>
              {article?.subject
                ? article.subject
                : `              چگونه در فارکس ضرر نکنیم: راهکارهای مؤثر برای معامله‌گران موفق
`}
            </span>
          </div>
          <div className="text-black font-light text-xs my-4">
            {article?.mainText
              ? article.mainText.length > 350
                ? article.mainText.slice(0, 350) + "..."
                : article.mainText
              : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Article;

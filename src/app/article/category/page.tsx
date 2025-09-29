import Article from "./CategoryCart";

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

export default async function Page() {
  const res = await fetch(`http://localhost:3000/api/category`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to load articles");

  const articles: LiteArticle[] = data.items

  return (
    <main>
      <div className="mx-20 py-4 my-10" dir="rtl">
        <div className="text-black text-2xl">
          <span>تعداد مقالات </span>
          <span>({data.total})</span>
        </div>
        <div className="mt-6 gap-6">
          {articles.map((a) => (
            <Article key={a.id} article={a} />
          ))}
        </div>
      </div>
    </main>
  );
}

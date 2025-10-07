import Image from "next/image";

type LiteArticle = {
  id?: string;
  title?: string;
  createdAt?: string;
  category?: string;
  author?: { id: string; firstName: string; lastName: string };
  thumbnail?: string | null;
  readingPeriod?: string;
};

export default function SidebarLatest({ posts }: { posts: LiteArticle[] }) {
  return (
    <div>
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
          <SidebarCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

function SidebarCard({ post }: { post: LiteArticle }) {
  return (
    <article className="group">
      <div className="w-[361.67px] h-[236.81px]">
        <div className="relative w-[361.67px] h-[236.81px] rounded-md overflow-hidden">
          <Image
            src={post.thumbnail || "/image/hero1.jpg"}
            alt="thumb"
            fill
            className="object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="absolute top-3 right-3">
            <div className="relative inline-block">
              <Image
                src="/svg/arrowLeftBlack.svg"
                alt="badge"
                width={108}
                height={34.66}
                className="block"
                priority
              />
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold leading-none px-2">
                {post.category}
              </span>
            </div>
          </div>
          <div className="absolute bottom-3 right-4 text-white">
            <h5 className="sm:text-base font-medium leading-7">{post.title}</h5>
          </div>
        </div>
      </div>
    </article>
  );
}
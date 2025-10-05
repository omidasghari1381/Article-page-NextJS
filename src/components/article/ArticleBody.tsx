// components/article/ArticleBody.tsx
import Image from "next/image";

export default function ArticleBody({
  quotes,
  mainText,
  secondryText,
}: {
  quotes?: string | null;
  mainText?: string | null;
  secondryText?: string | null;
}) {
  return (
    <div className="bg-white space-y-6 leading-8 text-lg text-slate-700">
      <p className="my-6">{mainText || ""}</p>

      {quotes ? (
        <div className="border border-[#EBEBEB] px-6 ">
          <Image src="/svg/Frame.svg" alt="cover" width={32.57} height={32.57} className="my-5" />
          <p className="mx-4 text-lg font-bold text-[#1C2121]">{quotes}</p>
          <Image
            src="/svg/Frame.svg"
            alt="cover"
            width={32.57}
            height={32.57}
            className="block my-5 mr-auto rotate-180"
          />
        </div>
      ) : null}

      <p className="mt-10">{secondryText || ""}</p>
    </div>
  );
}

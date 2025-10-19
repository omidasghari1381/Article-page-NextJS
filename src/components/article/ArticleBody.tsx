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
    <div className="space-y-6 leading-8 text-lg text-slate-700 dark:text-skin-base transition-colors">
      <p className="my-6">{mainText || ""}</p>

      {quotes ? (
        <div className="border border-[#EBEBEB] dark:border-skin-border px-6 rounded-md">
          <Image
            src="/svg/Frame.svg"
            alt="cover"
            width={32.57}
            height={32.57}
            className="my-5 dark:invert"
          />
          <p className="mx-4 text-lg font-bold text-[#1C2121] dark:text-white">
            {quotes}
          </p>
          <Image
            src="/svg/Frame.svg"
            alt="cover"
            width={32.57}
            height={32.57}
            className="block my-5 mr-auto rotate-180 dark:invert"
          />
        </div>
      ) : null}

      <p className="mt-10">{secondryText || ""}</p>
    </div>
  );
}
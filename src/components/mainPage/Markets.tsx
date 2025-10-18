import Image from "next/image";

type Pair = {
  icon: string;
  name: string;
  price: number;
  market: string;
  difference: number;
};

export default function Markets() {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Market title="بازار فارکس" pair={defaultPairs} />
      <Market title="ارز دیجیتال" pair={defaultPairs} />
    </div>
  );
}

function Market({ title, pair }: { title: string; pair: Pair[] }) {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <Image src="/svg/Rectangle.svg" alt="thumb" width={8} height={36} />
        <h3 className="text-lg sm:text-xl font-bold text-[#1C2121] dark:text-white">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {pair.concat(pair).map((p, i) => (
          <PairRow key={`${p.name}-${i}`} item={p} />
        ))}
      </div>
    </div>
  );
}

function PairRow({ item }: { item: Pair }) {
  const diffPositive = item.difference >= 0;
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-3 border-b border-[#E6E9EE] dark:border-skin-divider text-[#2E3232] dark:text-white">
      <div className="flex items-center gap-3">
        <Image src={item.icon} alt={item.name} width={48} height={34} />
        <div className="text-left">
          <div className="text-sm font-semibold">{item.name}</div>
          <div className="text-xs text-[#666969] dark:text-skin-muted">
            {item.market}
          </div>
        </div>
      </div>

      <div className="text-left min-w-[90px]">
        <div className="text-sm font-semibold text-[#2E3232] dark:text-white">
          ${item.price}
        </div>
        <div
          className={`text-sm font-semibold ${
            diffPositive ? "text-[#38CB89]" : "text-red-500"
          }`}
        >
          {diffPositive ? "+" : ""}
          {item.difference}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PeriodLabel = "دیروز" | "امروز" | "۷ روز گذشته" | "۳۰ روز گذشته" | "۹۰ روز گذشته";

type UsersAreaCardProps = {
  endpoint?: string;
  periodOptions?: PeriodLabel[];
  defaultPeriod?: PeriodLabel;
  title?: string;
  subtitle?: string;
  onPeriodChange?: (value: PeriodLabel) => void;
};

type DailyMapResponse = {
  from: string;
  to: string;
  counts: Record<string, number>;
};

export default function UsersAreaCard({
  endpoint = "/api/analytics/users/daily",
  periodOptions = ["دیروز", "امروز", "۷ روز گذشته", "۳۰ روز گذشته", "۹۰ روز گذشته"],
  defaultPeriod = "۷ روز گذشته",
  title = "کاربران جدید",
  subtitle = "Users joined",
  onPeriodChange,
}: UsersAreaCardProps) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodLabel>(defaultPeriod);
  const [labels, setLabels] = useState<string[]>([]);
  const [series, setSeries] = useState<number[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const router = useRouter();

  const periodKeyMap: Record<PeriodLabel, "yesterday" | "today" | "last_7" | "last_30" | "last_90"> =
    {
      دیروز: "yesterday",
      امروز: "today",
      "۷ روز گذشته": "last_7",
      "۳۰ روز گذشته": "last_30",
      "۹۰ روز گذشته": "last_90",
    };

  const options = useMemo(
    () => ({
      chart: {
        height: "100%",
        maxWidth: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: { enabled: false },
        toolbar: { show: false },
      },
      tooltip: { enabled: true, x: { show: false } },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      },
      dataLabels: { enabled: false },
      stroke: { width: 6 },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: { left: 2, right: 2, top: 0 },
      },
      series: [{ name: "New users", data: series, color: "#1A56DB" }],
      xaxis: {
        categories: labels,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { show: false },
    }),
    [series, labels]
  );

  useEffect(() => {
    let apex: any;
    let mounted = true;
    (async () => {
      const ApexCharts = (await import("apexcharts")).default;
      if (!mounted || !wrapRef.current) return;
      apex = new ApexCharts(wrapRef.current, options as any);
      chartRef.current = apex;
      apex.render();
    })();
    return () => {
      mounted = false;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [options]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const p = periodKeyMap[period];
        const res = await fetch(`${endpoint}?period=${p}`, { cache: "no-store" });
        const data: DailyMapResponse = await res.json();

        const buckets = makeDailyBuckets(data.from, data.to);
        const s = buckets.map((d) => data.counts[keyFromDate(d)] ?? 0);
        const l = buckets.map((d) =>
          new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "2-digit", month: "short" }).format(d)
        );

        if (!ignore) {
          setSeries(s);
          setLabels(l);
          setTotal(s.reduce((a, b) => a + b, 0));
        }
      } catch {
        if (!ignore) {
          setSeries([]);
          setLabels([]);
          setTotal(0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [endpoint, period]);

  const handlePick = (v: PeriodLabel) => {
    setPeriod(v);
    setOpen(false);
    onPeriodChange?.(v);
  };

  const handleReportClick = () => {
    router.push("/admin/users");
  };

  return (
    <div className="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
      <div className="flex justify-between">
        <div>
          <h5 className="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">
            {loading ? "…" : total}
          </h5>
          <p className="text-base font-normal text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>

        <button
          onClick={handleReportClick}
          className="self-start uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2"
        >
          Users Report
          <svg className="w-2.5 h-2.5 ms-1.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
          </svg>
        </button>
      </div>

      <div className="mt-2">
        <div ref={wrapRef} className="w-full h-40" />
      </div>

      <div className="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between">
        <div className="flex justify-between items-center pt-5">
          <div className="relative">
            <button
              onClick={() => setOpen((s) => !s)}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white"
              type="button"
            >
              {period}
              <svg className="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
              </svg>
            </button>
            <div
              className={`z-10 ${open ? "block" : "hidden"} absolute right-0 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700`}
            >
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                {periodOptions.map((opt) => (
                  <li key={opt}>
                    <button
                      onClick={() => handlePick(opt)}
                      className="w-full text-right block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <span className="text-xs text-gray-400 dark:text-gray-500">{loading ? "در حال بارگذاری…" : ""}</span>
        </div>
      </div>
    </div>
  );
}

function makeDailyBuckets(fromISO: string, toISO: string) {
  const start = new Date(fromISO);
  const end = new Date(toISO);
  const out: Date[] = [];
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (d < last) {
    out.push(new Date(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function keyFromDate(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
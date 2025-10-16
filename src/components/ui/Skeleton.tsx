import React, { type ElementType } from "react";
import clsx from "clsx";
export type SkeletonBaseProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  shimmer?: boolean;
  rounded?:
    | "none"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "full"
    | `-[${string}]`;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children">;

function BaseSkeleton<T extends ElementType = "div">({
  as,
  className,
  shimmer = true,
  rounded = "md",
  ...rest
}: SkeletonBaseProps<T>) {
  const Comp = (as || "div") as ElementType;
  return (
    <Comp
      aria-hidden
      className={clsx(
        "bg-gray-200/70 dark:bg-gray-700/50",
        rounded === "none"
          ? "rounded-none"
          : rounded === "sm"
          ? "rounded-sm"
          : rounded === "md"
          ? "rounded-md"
          : rounded === "lg"
          ? "rounded-lg"
          : rounded === "xl"
          ? "rounded-xl"
          : rounded === "2xl"
          ? "rounded-2xl"
          : rounded === "3xl"
          ? "rounded-3xl"
          : rounded === "full"
          ? "rounded-full"
          : typeof rounded === "string" && rounded.startsWith("-[")
          ? `rounded${rounded}`
          : "rounded-md",
        shimmer ? "skeleton-shimmer skeleton-animate" : "animate-pulse",
        className
      )}
      {...rest}
    />
  );
}

type LineProps = SkeletonBaseProps & {
  height?: number;
  width?: number | string;
};

function Line({ height = 12, width = "100%", className, ...rest }: LineProps) {
  const style: React.CSSProperties = {
    height,
    width: typeof width === "number" ? `${width}px` : width,
  };
  return (
    <BaseSkeleton
      style={style}
      className={clsx("block", className)}
      {...rest}
    />
  );
}

type LinesProps = Omit<LineProps, "width" | "height"> & {
  lines?: number;
  heights?: number[];
  widths?: Array<number | string>;
  gap?: number;
};

function Lines({
  lines = 3,
  heights,
  widths,
  gap = 10,
  className,
  ...rest
}: LinesProps) {
  const defaultWidths = ["100%", "92%", "76%", "88%"];
  return (
    <div className={clsx("flex flex-col", className)} style={{ gap }}>
      {Array.from({ length: Math.max(1, lines) }).map((_, i) => (
        <Line
          key={i}
          height={heights?.[i] ?? 12}
          width={widths?.[i] ?? defaultWidths[i % defaultWidths.length]}
          {...rest}
        />
      ))}
    </div>
  );
}

type BlockProps = SkeletonBaseProps & {
  width?: number | string;
  height?: number | string;
};

function Block({ width, height, className, ...rest }: BlockProps) {
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };
  return (
    <BaseSkeleton
      style={style}
      className={clsx("block", className)}
      {...rest}
    />
  );
}

type AvatarProps = SkeletonBaseProps & {
  size?: number;
};

function Avatar({ size = 40, className, ...rest }: AvatarProps) {
  return (
    <BaseSkeleton
      className={clsx("rounded-full", className)}
      style={{ width: size, height: size }}
      {...rest}
    />
  );
}

export const Skeleton = Object.assign(BaseSkeleton, {
  Line,
  Lines,
  Block,
  Avatar,
});

export default Skeleton;

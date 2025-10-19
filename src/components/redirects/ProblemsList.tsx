import React from "react";

type Props = {
  problems: string[];
  className?: string;
  itemClassName?: string;
};

export default function ProblemsList({ problems, className = "", itemClassName = "" }: Props) {
  if (!problems?.length) return null;
  return (
    <ul className={`mt-4 text-xs text-red-600 dark:text-red-400 list-disc pr-5 space-y-1 ${className}`}>
      {problems.map((p, i) => (
        <li key={i} className={itemClassName}>
          {p}
        </li>
      ))}
    </ul>
  );
}
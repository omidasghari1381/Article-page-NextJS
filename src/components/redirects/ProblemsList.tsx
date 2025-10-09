import React from "react";

type Props = { problems: string[] };

export default function ProblemsList({ problems }: Props) {
  if (!problems?.length) return null;
  return (
    <ul className="mt-4 text-xs text-red-600 list-disc pr-5 space-y-1">
      {problems.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  );
}
import React from "react";

export const STATUS_OPTIONS = [301, 302, 307, 308] as const;

type Props = {
  label: string;
  value: (typeof STATUS_OPTIONS)[number];
  options?: readonly number[];
  onChange: (v: number) => void;
  helper?: React.ReactNode;
};

export default function StatusSelect({ label, value, options = STATUS_OPTIONS, onChange, helper }: Props) {
  return (
    <div>
      <label className="block text-sm text-black mb-2">{label}</label>
      <select
        className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {helper}
    </div>
  );
}
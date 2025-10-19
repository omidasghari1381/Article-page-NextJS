import React from "react";

export const STATUS_OPTIONS = [301, 302, 307, 308] as const;

type Props = {
  label: string;
  value: (typeof STATUS_OPTIONS)[number];
  options?: readonly number[];
  onChange: (v: number) => void;
  helper?: React.ReactNode;
  labelClassName?: string;
  selectClassName?: string;
};

export default function StatusSelect({
  label,
  value,
  options = STATUS_OPTIONS,
  onChange,
  helper,
  labelClassName = "",
  selectClassName = "",
}: Props) {
  return (
    <div>
      <label className={`block text-sm text-skin-muted mb-2 ${labelClassName}`}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70 ${selectClassName}`}
      >
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {helper && <div className="text-xs mt-1 text-skin-muted">{helper}</div>}
    </div>
  );
}
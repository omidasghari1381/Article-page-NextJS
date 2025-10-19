import React from "react";

type Props = {
  label: string;
  value: string;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | string
      | number
      | boolean
  ) => void;
  placeholder?: string;
  helper?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
};

export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
  helper,
  className = "",
  labelClassName = "",
  inputClassName = "",
}: Props) {
  return (
    <div className={className}>
      <label className={`block text-sm text-skin-muted mb-2 ${labelClassName}`}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-skin-border text-skin-base bg-skin-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skin-border/70 ltr ${inputClassName}`}
      />
      {helper && <div className="text-xs mt-1 text-skin-muted">{helper}</div>}
    </div>
  );
}
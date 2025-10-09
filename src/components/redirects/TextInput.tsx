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
};

export default function TextInput({ label, value, onChange, placeholder, helper, className }: Props) {
  return (
    <div className={className}>
      <label className="block text-sm text-black mb-2">{label}</label>
      <input
        type="text"
        className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {helper}
    </div>
  );
}

import React from "react";

type Props = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | string
      | number
      | boolean
  ) => void;
};

export default function ActiveCheckbox({ id, label, checked, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 pt-6">
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4" />
      <label htmlFor={id} className="text-sm text-black">
        {label}
      </label>
    </div>
  );
}

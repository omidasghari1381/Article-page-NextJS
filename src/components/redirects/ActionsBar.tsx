import React from "react";

type Props = {
  isEdit: boolean;
  saving: boolean;
  deleting: boolean;
  onClear: () => void;
  onDelete: () => void;
};

export default function ActionsBar({ isEdit, saving, deleting, onClear, onDelete }: Props) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button type="button" className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50" onClick={onClear}>
        پاک‌سازی
      </button>

      <button
        type="submit"
        className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
        disabled={saving}
      >
        {saving ? "در حال ذخیره…" : isEdit ? "ثبت تغییرات" : "ثبت ریدایرکت"}
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
        disabled={deleting || !isEdit}
      >
        {deleting ? "در حال حذف..." : "حذف ریدایرکت"}
      </button>
    </div>
  );
}
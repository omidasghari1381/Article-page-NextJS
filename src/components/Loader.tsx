"use client";

import React from "react";

type Props = {
  fullscreen?: boolean;
};

export default function Loader({ fullscreen }: Props) {
  return (
    <div
      className={`${
        fullscreen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80"
          : ""
      }`}
    >
      <div className="loading">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
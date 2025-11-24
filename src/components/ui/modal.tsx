"use client";
import React from "react";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow dark:bg-zinc-900">
        <div className="mb-3 text-lg font-semibold">{title}</div>
        <div className="space-y-3">{children}</div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="rounded-md border px-3 py-1 text-sm">关闭</button>
        </div>
      </div>
    </div>
  );
}
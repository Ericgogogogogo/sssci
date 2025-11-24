"use client";
import { useState } from "react";
import { useCreateProject } from "@/lib/hooks/projects";
import { Modal } from "@/components/ui/modal";
import { useTranslations } from "next-intl";

export function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("projects");
  const createMutation = useCreateProject();
  const [title, setTitle] = useState("");
  const [field, setField] = useState("AI");
  return (
    <Modal open={open} title={t("create")} onClose={onClose}>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("title_placeholder")} className="w-full rounded-md border px-3 py-2 text-sm" />
        <select value={field} onChange={(e) => setField(e.target.value)} className="rounded-md border px-2 py-1 text-sm">
          {["AI","Biology","Economics","Education"].map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-3 py-1 text-sm">{t("cancel")}</button>
          <button
            onClick={async () => { await createMutation.mutateAsync({ title, field }); setTitle(""); onClose(); }}
            disabled={!title || createMutation.isPending}
            className="rounded-md bg-black px-3 py-1 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {t("create_btn")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
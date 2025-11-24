"use client";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { UsageLimitWarning } from "@/components/UsageLimitWarning";
import { useTranslations } from "next-intl";
import { UsageProgress } from "@/components/UsageProgress";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { useProjectsQuery, useDeleteProject, useUpdateProject } from "@/lib/hooks/projects";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";

type Project = { id: string; title: string; status: string; currentModule: number; createdAt: string };

export default function ProjectsPage() {
  const tp = useTranslations("projects");
  const { canUse, remaining, limit, check } = useUsageLimit("topic_generation");
  const { data } = useProjectsQuery();
  const projects = (data?.projects ?? []) as Project[];
  const allowed = data?.allowed ?? null;
  const [createOpen, setCreateOpen] = useState(false);
  const [msgKey, setMsgKey] = useState<string | null>(null);
  const [errKey, setErrKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const deleteMutation = useDeleteProject();
  const updateMutation = useUpdateProject();
  const updateModule = async (id: string, m: number) => {
    setMsgKey(null); setErrKey(null);
    try {
      await updateMutation.mutateAsync({ id, currentModule: m });
      setMsgKey("projects.messages.updated");
    } catch (e: unknown) {
      setErrKey(e instanceof Error ? e.message : "projects.errors.server_error");
    }
  };
  const deleteProject = async (id: string) => {
    setMsgKey(null); setErrKey(null);
    try {
      await deleteMutation.mutateAsync(id);
      setMsgKey("projects.messages.deleted");
      setConfirmId(null);
    } catch (e: any) {
      setErrKey(e?.message ?? "projects.errors.server_error");
    }
  };
  useEffect(() => { check(); }, [check]);
  const startEdit = (p: Project) => { setEditingId(p.id); setEditingTitle(p.title); };
  const cancelEdit = () => { setEditingId(null); setEditingTitle(""); };
  const saveEdit = async () => {
    if (!editingId) return;
    setMsgKey(null); setErrKey(null);
    try {
      await updateMutation.mutateAsync({ id: editingId, title: editingTitle });
      setMsgKey("projects.messages.title_updated");
      cancelEdit();
    } catch (e: any) {
      setErrKey(e?.message ?? "projects.errors.server_error");
    }
  };
  const archiveProject = async (id: string) => {
    setMsgKey(null); setErrKey(null);
    try {
      await updateMutation.mutateAsync({ id, status: "ARCHIVED" });
      setMsgKey("projects.messages.archived");
    } catch (e: any) {
      setErrKey(e?.message ?? "projects.errors.server_error");
    }
  };
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{tp("title")}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{tp("description")}</p>
      {canUse && remaining !== null && limit !== null && limit !== Infinity && (
        <UsageProgress remaining={remaining} limit={limit} />
      )}
      {!canUse && remaining !== null && limit !== null && (
        <UsageLimitWarning
          remaining={remaining}
          limit={limit}
          onUpgrade={() => fetch("/api/stripe/create-checkout-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planType: "PRO" }) })
            .then(res => res.json())
            .then(data => { if (data.url) location.href = data.url; })}
        />
      )}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{tp("create")}</div>
          <button onClick={() => setCreateOpen(true)} disabled={(allowed !== null && projects.length >= allowed)} className="rounded-md bg-black text-white px-3 py-1 text-sm disabled:opacity-50 dark:bg-white dark:text-black">{tp("create_btn")}</button>
        </div>
        {errKey && <div className="text-sm text-red-600">{tp(errKey)}</div>}
        {msgKey && <div className="text-sm text-green-600">{tp(msgKey)}</div>}
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">{tp("list")}</div>
        <ul className="mt-2 space-y-2">
          {projects.map(p => (
            <li key={p.id} className="flex items-center justify-between rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
              <div>
                <div className="font-medium">
                  {editingId === p.id ? (
                    <input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm outline-none ring-0 dark:bg-black dark:text-zinc-100 dark:border-zinc-700" />
                  ) : (
                    p.title
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {tp("status")}: <StatusBadge status={p.status} label={tp(p.status === "COMPLETED" ? "status_completed" : p.status === "ARCHIVED" ? "status_archived" : "status_in_progress")} /> · {tp("module")}: {p.currentModule}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">{new Date(p.createdAt).toLocaleString()}</div>
                {p.status !== "ARCHIVED" && (
                  editingId === p.id ? (
                    <>
                      <button onClick={saveEdit} className="rounded-md bg-black text-white px-2 py-1 text-xs dark:bg-white dark:text-black">{tp("save")}</button>
                      <button onClick={cancelEdit} className="rounded-md border px-2 py-1 text-xs">{tp("cancel")}</button>
                    </>
                  ) : (
                    <>
                      <select value={p.currentModule} onChange={(e) => updateModule(p.id, Number(e.target.value))} className="rounded-md border px-2 py-1 text-xs">
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{tp("module")} {n}</option>)}
                      </select>
                      <a href={`/projects/${p.id}/paper/setup`} className="rounded-md border px-2 py-1 text-xs">{tp("paper_entry")}</a>
                      <button onClick={() => startEdit(p)} className="rounded-md border px-2 py-1 text-xs">{tp("edit")}</button>
                      <button onClick={() => archiveProject(p.id)} className="rounded-md border px-2 py-1 text-xs">{tp("archive")}</button>
                      <button onClick={() => setConfirmId(p.id)} className="rounded-md border px-2 py-1 text-xs">{tp("delete")}</button>
                    </>
                  )
                )}
              </div>
            </li>
          ))}
          {projects.length === 0 && <li className="text-sm text-zinc-600 dark:text-zinc-400">{tp("empty")}</li>}
        </ul>
      </div>
      <NewProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <Modal open={!!confirmId} title={tp("confirm_delete_title")} onClose={() => setConfirmId(null)}>
        <div className="text-sm text-zinc-700 dark:text-zinc-300">{tp("confirm_delete_message")}</div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirmId(null)} className="rounded-md border px-3 py-1 text-sm">{tp("cancel")}</button>
          <button onClick={() => deleteProject(confirmId!)} className="rounded-md bg-red-600 text-white px-3 py-1 text-sm">{tp("confirm_delete_ok")}</button>
        </div>
      </Modal>
    </div>
  );
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Project = { id: string; title: string; field?: string; status: string; currentModule: number; createdAt: string };
type ProjectsResponse = { projects: Project[]; plan?: string; allowed?: number | null };

export function useProjectsQuery() {
  return useQuery<ProjectsResponse>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "error");
      return { projects: data.projects ?? [], plan: data.plan, allowed: data.allowed };
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; field?: string }) => {
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "error");
      return data.project as Project;
    },
    onSuccess: (project) => {
      qc.setQueryData(["projects"], (prev: any) => ({ ...prev, projects: [project, ...(prev?.projects ?? [])] }));
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "error");
      return { id };
    },
    onSuccess: ({ id }) => {
      qc.setQueryData(["projects"], (prev: any) => ({ ...prev, projects: (prev?.projects ?? []).filter((p: Project) => p.id !== id) }));
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; title?: string; field?: string; currentModule?: number; status?: string }) => {
      const res = await fetch(`/api/projects/${payload.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "error");
      return data.project as Project;
    },
    onSuccess: (project) => {
      qc.setQueryData(["projects"], (prev: any) => ({
        ...prev,
        projects: (prev?.projects ?? []).map((p: Project) => (p.id === project.id ? project : p)),
      }));
    },
  });
}
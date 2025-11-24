"use client";
import { create } from "zustand";

type UIState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  language: "zh" | "en";
  setLanguage: (l: "zh" | "en") => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  language: "zh",
  setLanguage: (l) => set({ language: l }),
}));
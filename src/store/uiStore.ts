import { create } from "zustand";

type UiState = {
  toast: { message: string; type: "success" | "error" } | null;
  showToast: (message: string, type?: "success" | "error") => void;
  clearToast: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  showToast: (message, type = "success") => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));

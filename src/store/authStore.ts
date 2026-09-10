import { create } from "zustand";
import {
  fetchProfile,
  logoutFromBackend,
} from "@/services/authService";
import { getStoredToken, setStoredToken } from "@/api/tokenStorage";
import type { User } from "@/types/models";

type AuthState = {
  user: User | null;
  loading: boolean;
  bootstrapped: boolean;
  isAuthenticated: boolean;
  setSession: (data: { token?: string; user?: User }) => Promise<void>;
  refreshProfile: () => Promise<User | null>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  bootstrapped: false,
  isAuthenticated: false,

  setSession: async (data) => {
    if (data.token) {
      await setStoredToken(data.token);
    }
    if (data.user) {
      set({ user: data.user, isAuthenticated: true });
    }
  },

  refreshProfile: async () => {
    const token = await getStoredToken();
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return null;
    }

    try {
      const data = await fetchProfile();
      set({ user: data.user, isAuthenticated: !!data.user });
      return data.user;
    } catch {
      await setStoredToken(null);
      set({ user: null, isAuthenticated: false });
      return null;
    }
  },

  logout: async () => {
    try {
      await logoutFromBackend();
    } catch {
      /* cookie/session may already be cleared */
    }
    await setStoredToken(null);
    set({ user: null, isAuthenticated: false });
  },

  bootstrap: async () => {
    if (get().bootstrapped && !get().loading) return;
    set({ loading: true });
    const token = await getStoredToken();
    if (!token) {
      set({ loading: false, bootstrapped: true, user: null, isAuthenticated: false });
      return;
    }
    await get().refreshProfile();
    set({ loading: false, bootstrapped: true });
  },
}));

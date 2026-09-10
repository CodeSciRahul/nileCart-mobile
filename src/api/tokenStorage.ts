import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { TOKEN_STORAGE_KEY } from "@/constants";

/** SecureStore is unavailable on web; fall back to memory + sessionStorage. */
const memory = new Map<string, string>();

export async function getStoredToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      if (typeof sessionStorage !== "undefined") {
        return sessionStorage.getItem(TOKEN_STORAGE_KEY);
      }
      return memory.get(TOKEN_STORAGE_KEY) ?? null;
    }
    return await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
  } catch {
    return memory.get(TOKEN_STORAGE_KEY) ?? null;
  }
}

export async function setStoredToken(token: string | null): Promise<void> {
  try {
    if (!token) {
      memory.delete(TOKEN_STORAGE_KEY);
      if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        return;
      }
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
      }
      return;
    }

    memory.set(TOKEN_STORAGE_KEY, token);
    if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
  } catch {
    if (token) memory.set(TOKEN_STORAGE_KEY, token);
    else memory.delete(TOKEN_STORAGE_KEY);
  }
}

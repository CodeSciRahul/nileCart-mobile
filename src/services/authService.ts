import { apiClient } from "@/api/client";
import { setStoredToken } from "@/api/tokenStorage";
import type { AuthResponse, User } from "@/types/models";

export const sendOtp = (email: string) =>
  apiClient.post("/auth/send-otp", { email }) as Promise<{
    success?: boolean;
    message?: string;
  }>;

export const verifyOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const data = (await apiClient.post("/auth/verify-otp", {
    email,
    otp,
  })) as AuthResponse;

  if (data.token) {
    await setStoredToken(data.token);
  }

  return data;
};

export const fetchProfile = () =>
  apiClient.get("/users/me") as Promise<{ success?: boolean; user: User }>;

export const updateUserProfile = (profile: Partial<User>) =>
  apiClient.put("/users/me", profile) as Promise<{
    success?: boolean;
    user: User;
  }>;

export const deleteAccount = () =>
  apiClient.delete("/users/me") as Promise<{ success?: boolean }>;

export const logoutFromBackend = () =>
  apiClient.post("/auth/logout") as Promise<{ success?: boolean }>;

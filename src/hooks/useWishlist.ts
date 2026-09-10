import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { getWishlist, toggleWishlist } from "@/services/wishlistService";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { ApiError } from "@/api/client";
import { router } from "expo-router";

export function useWishlistQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);

  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: getWishlist,
    enabled: isAuthenticated && !loading,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useUiStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!isAuthenticated) {
        router.push("/auth");
        throw new ApiError("Please sign in to save items.", 401);
      }
      return toggleWishlist(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) return;
      const message =
        error instanceof Error ? error.message : "Could not update wishlist.";
      showToast(message, "error");
    },
  });
}

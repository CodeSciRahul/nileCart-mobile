import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/services/cartService";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { ApiError } from "@/api/client";
import { router } from "expo-router";

export function useCartQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);

  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled: isAuthenticated && !loading,
  });
}

export function useCartCount() {
  const query = useCartQuery();
  return {
    ...query,
    count: query.data?.itemCount ?? 0,
  };
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useUiStore((s) => s.showToast);

  return useMutation({
    mutationFn: async ({
      productId,
      variantSku,
      quantity = 1,
    }: {
      productId: string;
      variantSku: string;
      quantity?: number;
    }) => {
      if (!isAuthenticated) {
        router.push("/auth");
        throw new ApiError("Please sign in to add items to your bag.", 401);
      }
      return addCartItem(productId, variantSku, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      showToast("Item added to bag", "success");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) return;
      const message =
        error instanceof Error ? error.message : "Could not add item to bag.";
      showToast(message, "error");
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update bag.";
      showToast(message, "error");
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not remove item.";
      showToast(message, "error");
    },
  });
}

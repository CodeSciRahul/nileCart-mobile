import { apiClient } from "@/api/client";
import type { CartResponse } from "@/types/models";

export const getCart = () => apiClient.get("/cart") as Promise<CartResponse>;

export const addCartItem = (
  productId: string,
  variantSku: string,
  quantity = 1
) =>
  apiClient.post("/cart/items", {
    productId,
    variantSku,
    quantity,
  }) as Promise<CartResponse>;

export const updateCartItem = (itemId: string, quantity: number) =>
  apiClient.put(`/cart/items/${itemId}`, { quantity }) as Promise<CartResponse>;

export const removeCartItem = (itemId: string) =>
  apiClient.delete(`/cart/items/${itemId}`) as Promise<CartResponse>;

export const applyCouponToCart = (code: string) =>
  apiClient.post("/cart/coupon", { code }) as Promise<CartResponse>;

export const removeCartCoupon = () =>
  apiClient.delete("/cart/coupon") as Promise<CartResponse>;

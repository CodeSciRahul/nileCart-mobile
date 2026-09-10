import { apiClient } from "@/api/client";
import type { CartResponse } from "@/types/models";

export type CouponValidateResponse = {
  success?: boolean;
  discount?: number;
  coupon?: {
    code?: string;
    description?: string;
    discountType?: string;
    value?: number;
  };
  message?: string;
};

export const validateCoupon = (code: string, orderAmount: number) =>
  apiClient.post("/coupons/validate", {
    code,
    orderAmount,
  }) as Promise<CouponValidateResponse>;

export const applyCouponToCart = (code: string) =>
  apiClient.post("/cart/coupon", { code }) as Promise<CartResponse>;

export const removeCartCoupon = () =>
  apiClient.delete("/cart/coupon") as Promise<CartResponse>;

export const getActiveCoupons = () =>
  apiClient.get("/coupons/active") as Promise<{
    success?: boolean;
    coupons?: Array<{
      code?: string;
      description?: string;
    }>;
  }>;

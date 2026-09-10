import { apiClient } from "@/api/client";
import type {
  Address,
  AddressesResponse,
  Order,
  OrderResponse,
  OrdersResponse,
  PaymentConfig,
} from "@/types/models";

export type CheckoutInitResponse = {
  success?: boolean;
  checkoutUrl?: string;
  txRef?: string;
  order?: Order;
};

export type PaymentVerifyResponse = {
  success?: boolean;
  order?: Order;
  paid?: boolean;
  alreadyPaid?: boolean;
  failed?: boolean;
  cancelled?: boolean;
};

export const getAddresses = () =>
  apiClient.get("/addresses") as Promise<AddressesResponse>;

export const createAddress = (address: Omit<Address, "_id">) =>
  apiClient.post("/addresses", address) as Promise<{
    success?: boolean;
    address?: Address;
  }>;

export const updateAddress = (id: string, address: Partial<Omit<Address, "_id">>) =>
  apiClient.put(`/addresses/${id}`, address) as Promise<{
    success?: boolean;
    address?: Address;
  }>;

export const deleteAddress = (id: string) =>
  apiClient.delete(`/addresses/${id}`) as Promise<{ success?: boolean }>;

export const setDefaultAddress = (id: string) =>
  apiClient.patch(`/addresses/${id}/default`) as Promise<{
    success?: boolean;
    address?: Address;
  }>;

export const placeOrder = ({
  addressId,
  paymentMethod = "cod",
}: {
  addressId: string;
  paymentMethod?: string;
}) =>
  apiClient.post("/orders", {
    addressId,
    paymentMethod,
  }) as Promise<OrderResponse>;

export const getMyOrders = (params: Record<string, string | number> = {}) =>
  apiClient.get("/orders", { params }) as Promise<OrdersResponse>;

export const getOrderById = (orderId: string) =>
  apiClient.get(`/orders/${orderId}`) as Promise<OrderResponse>;

export const cancelOrder = (orderId: string, reason?: string) =>
  apiClient.patch(`/orders/${orderId}/cancel`, {
    reason: reason || "Cancelled by customer",
  }) as Promise<OrderResponse>;

export const getPaymentConfig = () =>
  apiClient.get("/payments/config") as Promise<PaymentConfig>;

export const initializeCheckout = ({
  addressId,
  platform = "mobile",
}: {
  addressId: string;
  platform?: "mobile" | "web";
}) =>
  apiClient.post("/payments/checkout", {
    addressId,
    platform,
  }) as Promise<CheckoutInitResponse>;

export const verifyPayment = ({
  txRef,
  transactionId,
  status,
}: {
  txRef: string;
  transactionId?: string | null;
  status?: string | null;
}) =>
  apiClient.get("/payments/verify", {
    params: {
      tx_ref: txRef,
      ...(transactionId ? { transaction_id: transactionId } : {}),
      ...(status ? { status } : {}),
    },
  }) as Promise<PaymentVerifyResponse>;

export const retryCheckout = (orderId: string, platform: "mobile" | "web" = "mobile") =>
  apiClient.post(`/payments/retry/${orderId}`, {
    platform,
  }) as Promise<CheckoutInitResponse>;

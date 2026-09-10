import { apiClient } from "@/api/client";
import type {
  HomeResponse,
  ProductDetailResponse,
  ProductsResponse,
} from "@/types/models";

export const getHome = (device: "mobile" | "desktop" = "mobile") =>
  apiClient.get("/home", { params: { device } }) as Promise<HomeResponse>;

export const getBanners = (device: "mobile" | "desktop" = "mobile") =>
  apiClient.get("/banners", {
    params: { device },
  }) as Promise<{ success?: boolean; banners?: HomeResponse["sections"] }>;

export const getProducts = (params: Record<string, string | number | boolean> = {}) =>
  apiClient.get("/products", { params }) as Promise<ProductsResponse>;

export const searchProducts = (
  params: Record<string, string | number | boolean> = {}
) =>
  apiClient.get("/products/search", { params }) as Promise<ProductsResponse>;

export const getProductBySlug = (slug: string) =>
  apiClient.get(`/products/${slug}`) as Promise<ProductDetailResponse>;

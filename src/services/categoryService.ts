import { apiClient } from "@/api/client";
import type { CategoriesResponse } from "@/types/models";

export const getCategoryTree = () =>
  apiClient.get("/categories", {
    params: { tree: "true" },
  }) as Promise<CategoriesResponse>;

export const getCategoryNavigation = () =>
  apiClient.get("/categories", {
    params: { navigation: "true", navOnly: "true" },
  }) as Promise<CategoriesResponse>;

export const getSubCategories = () =>
  apiClient.get("/categories", {
    params: { subcategoriesOnly: "true", navOnly: "true" },
  }) as Promise<CategoriesResponse>;

export const getCategoryShop = (
  slug: string,
  params: Record<string, string | number | boolean> = {}
) =>
  apiClient.get(`/categories/${slug}/shop`, { params }) as Promise<{
    success?: boolean;
    products?: unknown[];
    category?: unknown;
    total?: number;
  }>;

import { apiClient } from "@/api/client";
import type { WishlistResponse } from "@/types/models";

export const getWishlist = () =>
  apiClient.get("/wishlist") as Promise<WishlistResponse>;

export const toggleWishlist = (productId: string) =>
  apiClient.post("/wishlist/toggle", { productId }) as Promise<WishlistResponse>;

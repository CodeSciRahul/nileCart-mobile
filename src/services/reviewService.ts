import { apiClient } from "@/api/client";

export type Review = {
  _id: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase?: boolean;
  createdAt?: string;
  user?: {
    name?: string;
    avatar?: string | { url?: string };
  };
};

export type ReviewsResponse = {
  success?: boolean;
  reviews?: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type ReviewEligibilityResponse = {
  hasPurchased?: boolean;
  orderId?: string;
  existingReview?: Review | null;
  message?: string;
};

export const getProductReviews = (productId: string, params: { page?: number; limit?: number } = {}) =>
  apiClient.get(`/reviews/product/${productId}`, {
    params,
  }) as Promise<ReviewsResponse>;

export const getReviewEligibility = (productId: string) =>
  apiClient.get(`/reviews/product/${productId}/eligibility`) as Promise<ReviewEligibilityResponse>;

export const createReview = (body: {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  orderId?: string;
}) =>
  apiClient.post("/reviews", body) as Promise<{
    success?: boolean;
    review?: Review;
  }>;

export const updateReview = (
  reviewId: string,
  body: {
    rating: number;
    title?: string;
    comment?: string;
  }
) =>
  apiClient.put(`/reviews/${reviewId}`, body) as Promise<{
    success?: boolean;
    review?: Review;
  }>;

export const deleteReview = (reviewId: string) =>
  apiClient.delete(`/reviews/${reviewId}`) as Promise<{ success?: boolean }>;


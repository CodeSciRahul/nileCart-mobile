import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react-native";
import { queryKeys } from "@/constants/queryKeys";
import {
  createReview,
  getProductReviews,
  type Review,
} from "@/services/reviewService";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors, spacing, typography } from "@/theme";
import { router } from "expo-router";
import type { Product } from "@/types/models";

function Stars({ value = 0, size = 14 }: { value?: number; size?: number }) {
  const rating = Math.round(Number(value) || 0);
  return (
    <View style={styles.stars} accessibilityLabel={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={colors.brandAmber}
          fill={star <= rating ? colors.brandAmber : "transparent"}
        />
      ))}
    </View>
  );
}

type Props = {
  product: Product;
};

export function ProductReviewsSection({ product }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const reviewsQuery = useQuery({
    queryKey: queryKeys.reviews.byProduct(product._id),
    queryFn: () => getProductReviews(product._id, { limit: 20 }),
    enabled: Boolean(product._id),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createReview({
        productId: product._id,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      }),
    onSuccess: async () => {
      setTitle("");
      setComment("");
      setShowForm(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byProduct(product._id),
      });
      showToast("Review submitted", "success");
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error ? error.message : "Could not submit review.",
        "error"
      );
    },
  });

  const reviews = (reviewsQuery.data?.reviews || []) as Review[];
  const average =
    typeof product.rating === "object"
      ? Number(product.rating?.average) || 0
      : Number(product.rating) || 0;
  const count =
    typeof product.rating === "object"
      ? Number(product.rating?.count) || reviewsQuery.data?.pagination?.total || 0
      : Number(product.reviewCount) ||
        reviewsQuery.data?.pagination?.total ||
        0;

  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>Ratings & reviews</Text>
      <Text style={styles.heading}>Customer Reviews</Text>

      <View style={styles.summary}>
        <View style={styles.summaryLeft}>
          <Star size={20} color={colors.brandAmber} fill={colors.brandAmber} />
          <Text style={styles.average}>{average.toFixed(1)}</Text>
        </View>
        <Text style={styles.count}>
          {count} {count === 1 ? "rating" : "ratings"}
        </Text>
      </View>

      {reviewsQuery.isLoading ? (
        <Text style={styles.muted}>Loading reviews…</Text>
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.muted}>
            Be the first to share your experience with this product.
          </Text>
        </View>
      ) : (
        reviews.map((review) => (
          <View key={review._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.userName}>
                {review.user?.name || "Customer"}
              </Text>
              <Stars value={review.rating} />
            </View>
            {review.isVerifiedPurchase ? (
              <Text style={styles.verified}>Verified purchase</Text>
            ) : null}
            {review.title ? (
              <Text style={styles.reviewTitle}>{review.title}</Text>
            ) : null}
            {review.comment ? (
              <Text style={styles.comment}>{review.comment}</Text>
            ) : null}
          </View>
        ))
      )}

      {isAuthenticated ? (
        <>
          <Button
            title={showForm ? "Hide review form" : "Write a review"}
            variant="secondary"
            onPress={() => setShowForm((v) => !v)}
          />
          {showForm ? (
            <View style={styles.form}>
              <Text style={styles.formLabel}>Your rating</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Pressable
                    key={value}
                    onPress={() => setRating(value)}
                    hitSlop={6}
                  >
                    <Star
                      size={28}
                      color={colors.brandAmber}
                      fill={value <= rating ? colors.brandAmber : "transparent"}
                    />
                  </Pressable>
                ))}
              </View>
              <Input
                label="Title (optional)"
                value={title}
                onChangeText={setTitle}
              />
              <Input
                label="Comment (optional)"
                value={comment}
                onChangeText={setComment}
                multiline
                style={{ minHeight: 80, textAlignVertical: "top" }}
              />
              <Button
                title="Submit review"
                loading={createMutation.isPending}
                disabled={createMutation.isPending}
                onPress={() => createMutation.mutate()}
              />
            </View>
          ) : null}
        </>
      ) : (
        <Button
          title="Sign in to review"
          variant="secondary"
          onPress={() => router.push("/auth")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing["2xl"],
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 191, 0, 0.15)",
    gap: spacing.sm,
  },
  eyebrow: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.brandGray,
  },
  heading: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xl,
    color: colors.foreground,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.2)",
    backgroundColor: "rgba(255, 245, 209, 0.4)",
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  summaryLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  average: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size["2xl"],
  },
  count: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.brandGray,
  },
  muted: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
  },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255, 191, 0, 0.3)",
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
  },
  card: {
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.2)",
    padding: spacing.md,
    gap: 4,
    backgroundColor: colors.brandWhite,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
  },
  verified: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: colors.success,
  },
  reviewTitle: {
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
  },
  comment: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
    lineHeight: 20,
  },
  stars: { flexDirection: "row" },
  form: { gap: spacing.md, marginTop: spacing.sm },
  formLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
  },
  ratingRow: { flexDirection: "row", gap: spacing.sm },
});

import { Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Edit3, Star } from "lucide-react-native";
import { queryKeys } from "@/constants/queryKeys";
import { getReviewEligibility, type Review } from "@/services/reviewService";
import { colors, radius, spacing, typography } from "@/theme";
import type { OrderItem } from "@/types/models";

export function getOrderItemProductId(item: OrderItem): string | null {
  if (typeof item.product === "object" && item.product?._id) {
    return String(item.product._id);
  }
  if (typeof item.product === "string" && item.product) {
    return String(item.product);
  }
  if ((item as any).productId) {
    return String((item as any).productId);
  }
  return item._id || null;
}

type Props = {
  item: OrderItem;
  orderId: string;
  orderStatus?: string;
  onOpenReview: (item: OrderItem, existingReview?: Review | null) => void;
};

export function OrderItemReviewButton({
  item,
  orderId,
  orderStatus,
  onOpenReview,
}: Props) {
  const isDelivered = orderStatus?.toLowerCase() === "delivered";
  const productId = getOrderItemProductId(item);

  const eligibilityQuery = useQuery({
    queryKey: queryKeys.reviews.eligibility(productId || ""),
    queryFn: () => getReviewEligibility(productId || ""),
    enabled: Boolean(productId) && isDelivered,
    staleTime: 60_000,
  });

  if (!isDelivered || !productId) {
    return null;
  }

  const existingReview = eligibilityQuery.data?.existingReview;
  const hasReviewed = Boolean(existingReview?._id);
  const rating = existingReview ? Number(existingReview.rating) || 5 : null;

  if (hasReviewed && rating != null) {
    return (
      <View style={styles.reviewedContainer}>
        <View style={styles.reviewedLeft}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                color={star <= rating ? colors.brandAmber : colors.borderSoft}
                fill={star <= rating ? colors.brandAmber : "transparent"}
              />
            ))}
            <Text style={styles.ratingValueText}>{rating}.0</Text>
          </View>
          <View style={styles.verifiedRow}>
            <CheckCircle2 size={11} color="#15803D" strokeWidth={2.2} />
            <Text style={styles.verifiedLabel}>Reviewed by you</Text>
          </View>
        </View>

        <Pressable
          onPress={() => onOpenReview(item, existingReview)}
          style={({ pressed }) => [
            styles.editBtn,
            pressed && { opacity: 0.75 },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Edit review"
        >
          <Edit3 size={13} color={colors.brandInk} strokeWidth={2} />
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.actionContainer}>
      <Pressable
        onPress={() => onOpenReview(item, null)}
        style={({ pressed }) => [
          styles.reviewBtn,
          pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Write a review for this product"
      >
        <Star size={14} color={colors.brandAmber} fill={colors.brandAmber} />
        <Text style={styles.reviewBtnText}>Rate & Review Product</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: "rgba(230, 168, 0, 0.3)",
    borderRadius: radius.md,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
  },
  reviewBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.brandInk,
    letterSpacing: 0.2,
  },
  reviewedContainer: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(34, 197, 94, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.18)",
    borderRadius: radius.md,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
  },
  reviewedLeft: {
    gap: 3,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingValueText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: colors.brandInk,
    marginLeft: 4,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    color: "#15803D",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandWhite,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    color: colors.brandInk,
  },
});

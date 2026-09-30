import { Pressable, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, Flame, Star, XCircle } from "lucide-react-native";
import { colors, radius, typography } from "@/theme";
import { formatMoney } from "@/utils/format";

type Props = {
  brand?: string;
  title: string;
  price?: number;
  mrp?: number;
  discountPercent?: number;
  currency?: string;
  ratingAverage?: number;
  reviewCount?: number;
  stockState: {
    key: "oos" | "low" | "available";
    label: string;
    urgency: string | null;
  };
  onScrollToReviews?: () => void;
};

export function ProductPriceBlock({
  brand,
  title,
  price,
  mrp,
  discountPercent = 0,
  currency = "UGX",
  ratingAverage = 4.8,
  reviewCount = 0,
  stockState,
  onScrollToReviews,
}: Props) {
  const hasDiscount = discountPercent > 0 || (mrp != null && price != null && mrp > price);

  return (
    <View style={styles.container}>
      {/* Brand & Category */}
      <View style={styles.topRow}>
        <Text style={styles.brand} numberOfLines={1}>
          {brand || "NILESCART STUDIO"}
        </Text>

        {/* Rating Pill */}
        {reviewCount > 0 ? (
          <Pressable
            accessibilityLabel={`Rating ${ratingAverage.toFixed(1)} stars out of 5 from ${reviewCount} reviews`}
            accessibilityRole="button"
            onPress={onScrollToReviews}
            style={styles.ratingPill}
          >
            <Star size={12} color="#CA8A04" fill="#CA8A04" />
            <Text style={styles.ratingScore}>{ratingAverage.toFixed(1)}</Text>
            <Text style={styles.ratingDivider}>•</Text>
            <Text style={styles.ratingCount}>({reviewCount})</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Product Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Price & Discount */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatMoney(price, currency)}</Text>
        {mrp != null && Number(mrp) > Number(price) ? (
          <Text style={styles.mrp}>{formatMoney(mrp, currency)}</Text>
        ) : null}
        {hasDiscount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {discountPercent > 0 ? `${discountPercent}% OFF` : "SPECIAL PRICE"}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.taxNote}>Inclusive of all taxes</Text>

      {/* Stock Status Badge */}
      <View style={styles.stockRow}>
        {stockState.key === "oos" ? (
          <View style={[styles.stockBadge, styles.stockBadgeOos]}>
            <XCircle size={14} color={colors.destructive} />
            <Text style={[styles.stockText, { color: colors.destructive }]}>
              Out of stock
            </Text>
          </View>
        ) : stockState.key === "low" ? (
          <View style={[styles.stockBadge, styles.stockBadgeLow]}>
            <Flame size={14} color="#D97706" />
            <Text style={[styles.stockText, { color: "#B45309" }]}>
              {stockState.urgency || "Low stock - selling fast!"}
            </Text>
          </View>
        ) : (
          <View style={[styles.stockBadge, styles.stockBadgeAvailable]}>
            <CheckCircle2 size={13} color={colors.success} />
            <Text style={[styles.stockText, { color: colors.success }]}>
              In Stock • Ready to dispatch
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 224, 200, 0.5)",
    backgroundColor: colors.brandWhite,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  brand: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.4)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  ratingScore: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xs,
    color: colors.foreground,
  },
  ratingDivider: {
    fontSize: 10,
    color: colors.brandGray,
  },
  ratingCount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.brandGray,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    color: colors.foreground,
    lineHeight: 26,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
  },
  price: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    color: colors.foreground,
  },
  mrp: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "rgba(22, 163, 74, 0.12)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(22, 163, 74, 0.25)",
  },
  discountText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: colors.success,
    letterSpacing: 0.4,
  },
  taxNote: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.brandGray,
    marginTop: 4,
  },
  stockRow: {
    marginTop: 10,
    flexDirection: "row",
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
  },
  stockBadgeAvailable: {
    backgroundColor: "rgba(22, 163, 74, 0.08)",
  },
  stockBadgeLow: {
    backgroundColor: "rgba(255, 191, 0, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.2)",
  },
  stockBadgeOos: {
    backgroundColor: "rgba(220, 38, 38, 0.08)",
  },
  stockText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
  },
});

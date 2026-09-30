import { Pressable, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, Flame, Star, XCircle } from "lucide-react-native";
import { colors, radius, textStyles, typography } from "@/theme";
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
            <Star size={12} color={colors.star} fill={colors.star} />
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
            <Flame size={14} color={colors.warning} />
            <Text style={[styles.stockText, { color: colors.warning }]}>
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
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  brand: {
    ...textStyles.eyebrow,
    color: colors.brandGray,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  ratingScore: {
    fontFamily: typography.fontFamily.semibold,
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
    ...textStyles.pdpTitle,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
  },
  price: {
    ...textStyles.priceLarge,
  },
  mrp: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: colors.amberMuted,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.amberBorder,
  },
  discountText: {
    ...textStyles.discount,
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
    backgroundColor: colors.successMuted,
  },
  stockBadgeLow: {
    backgroundColor: colors.amberMuted,
    borderWidth: 1,
    borderColor: colors.amberBorder,
  },
  stockBadgeOos: {
    backgroundColor: colors.destructiveMuted,
  },
  stockText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
  },
});

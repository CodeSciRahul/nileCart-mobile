import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Heart, ShoppingBag } from "lucide-react-native";
import { colors, radius, typography } from "@/theme";
import { formatMoney } from "@/utils/format";

type Props = {
  price?: number;
  currency?: string;
  isWishlisted?: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
  isAddingToCart?: boolean;
  isOutOfStock?: boolean;
  cartCount?: number;
};

export function ProductBottomBar({
  price,
  currency = "UGX",
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  isAddingToCart = false,
  isOutOfStock = false,
  cartCount = 0,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 12) + 6 },
      ]}
    >
      {/* Wishlist Button */}
      <Pressable
        accessibilityLabel={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        accessibilityRole="button"
        hitSlop={6}
        onPress={onToggleWishlist}
        style={[styles.iconBtn, isWishlisted && styles.iconBtnActive]}
      >
        <Heart
          size={20}
          color={isWishlisted ? colors.destructive : colors.foreground}
          fill={isWishlisted ? colors.destructive : "transparent"}
          strokeWidth={2}
        />
      </Pressable>

      {/* Bag Shortcut Button */}
      <Pressable
        accessibilityLabel={`View shopping bag with ${cartCount} items`}
        accessibilityRole="button"
        hitSlop={6}
        onPress={() => router.push("/(tabs)/cart")}
        style={styles.iconBtn}
      >
        <ShoppingBag size={20} color={colors.foreground} strokeWidth={2} />
        {cartCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {cartCount > 99 ? "99+" : cartCount}
            </Text>
          </View>
        ) : null}
      </Pressable>

      {/* Add To Bag CTA Button */}
      <Pressable
        accessibilityLabel={isOutOfStock ? "Out of stock" : "Add to bag"}
        accessibilityRole="button"
        disabled={isOutOfStock || isAddingToCart}
        onPress={onAddToCart}
        style={({ pressed }) => [
          styles.ctaButton,
          isOutOfStock && styles.ctaButtonDisabled,
          pressed && !isOutOfStock && !isAddingToCart && styles.ctaButtonPressed,
        ]}
      >
        {isAddingToCart ? (
          <ActivityIndicator color={colors.primaryForeground} size="small" />
        ) : (
          <View style={styles.ctaContent}>
            <ShoppingBag size={18} color={isOutOfStock ? colors.disabledText : colors.primaryForeground} />
            <Text
              style={[
                styles.ctaText,
                isOutOfStock && styles.ctaTextDisabled,
              ]}
            >
              {isOutOfStock ? "OUT OF STOCK" : "ADD TO BAG"}
            </Text>
            {!isOutOfStock && price ? (
              <>
                <Text style={styles.ctaDivider}>|</Text>
                <Text style={styles.ctaPrice}>{formatMoney(price, currency)}</Text>
              </>
            ) : null}
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: colors.foreground,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    position: "relative",
  },
  iconBtnActive: {
    borderColor: colors.destructiveBorder,
    backgroundColor: colors.destructiveMuted,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brandAmber,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.brandWhite,
  },
  badgeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    color: colors.foreground,
    lineHeight: 11,
  },
  ctaButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaButtonDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.border,
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.primaryForeground,
    letterSpacing: 0.8,
  },
  ctaTextDisabled: {
    color: colors.disabledText,
  },
  ctaDivider: {
    fontSize: 12,
    color: colors.inkFaint,
  },
  ctaPrice: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.primaryForeground,
  },
});

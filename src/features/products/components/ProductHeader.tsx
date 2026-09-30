import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Heart, Share2, ShoppingBag } from "lucide-react-native";
import { colors, radius, typography } from "@/theme";

type Props = {
  isWishlisted?: boolean;
  onToggleWishlist: () => void;
  onShare: () => void;
  cartCount?: number;
  scrollY?: number;
};

export function ProductHeader({
  isWishlisted = false,
  onToggleWishlist,
  onShare,
  cartCount = 0,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleCart = () => {
    router.push("/(tabs)/cart");
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 12) + 6 },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={8}
        onPress={handleBack}
        style={styles.iconCircle}
      >
        <ChevronLeft size={22} color={colors.foreground} strokeWidth={2.2} />
      </Pressable>

      <View style={styles.rightActions} pointerEvents="box-none">
        <Pressable
          accessibilityLabel="Share product"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onShare}
          style={styles.iconCircle}
        >
          <Share2 size={18} color={colors.foreground} strokeWidth={2} />
        </Pressable>

        <Pressable
          accessibilityLabel={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onToggleWishlist}
          style={styles.iconCircle}
        >
          <Heart
            size={19}
            color={isWishlisted ? colors.destructive : colors.foreground}
            fill={isWishlisted ? colors.destructive : "transparent"}
            strokeWidth={2}
          />
        </Pressable>

        <Pressable
          accessibilityLabel={`Shopping Bag with ${cartCount} items`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={handleCart}
          style={styles.iconCircle}
        >
          <ShoppingBag size={19} color={colors.foreground} strokeWidth={2} />
          {cartCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(232, 224, 200, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
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
    fontFamily: typography.fontFamily.bold,
    fontSize: 9,
    color: colors.foreground,
    lineHeight: 11,
  },
});

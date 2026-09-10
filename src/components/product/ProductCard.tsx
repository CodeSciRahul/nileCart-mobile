import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Heart, ShoppingBag } from "lucide-react-native";
import { router } from "expo-router";
import type { Product } from "@/types/models";
import { formatMoney, getDiscountPercent, getProductImageUrls } from "@/utils/format";
import { colors, spacing, typography } from "@/theme";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist } from "@/hooks/useWishlist";

type Props = {
  product: Product;
  currency?: string;
};

function ProductCardComponent({ product, currency = "UGX" }: Props) {
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const images = getProductImageUrls(product);
  const imageUri = images[0];
  const price = product.price ?? product.variants?.[0]?.price;
  const mrp = product.mrp ?? product.variants?.[0]?.mrp;
  const discount =
    product.discountPercent ?? getDiscountPercent(price, mrp);
  const defaultSku = product.variants?.[0]?.sku;
  const brandLabel = product.brand || product.category?.name || "Nilescart";

  const openProduct = () => {
    if (!product.slug) return;
    router.push(`/product/${product.slug}`);
  };

  const onAdd = () => {
    if (!product._id || !defaultSku || addToCart.isPending) return;
    addToCart.mutate({
      productId: product._id,
      variantSku: defaultSku,
    });
  };

  const onWishlist = () => {
    if (!product._id || toggleWishlist.isPending) return;
    toggleWishlist.mutate(product._id);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.title}
      onPress={openProduct}
      style={styles.card}
    >
      <View style={styles.imageWrap}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            recyclingKey={product._id}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
        <Pressable
          accessibilityLabel="Save to wishlist"
          hitSlop={8}
          onPress={onWishlist}
          style={styles.wishBtn}
        >
          <Heart size={16} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>
          {brandLabel}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatMoney(price, currency)}</Text>
          {mrp != null && Number(mrp) > Number(price) ? (
            <Text style={styles.mrp}>{formatMoney(mrp, currency)}</Text>
          ) : null}
          {discount > 0 ? (
            <Text style={styles.discount}>{discount}% off</Text>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel="Add to bag"
          disabled={addToCart.isPending || !defaultSku}
          onPress={onAdd}
          style={styles.addBtn}
        >
          <ShoppingBag size={14} color={colors.foreground} />
          <Text style={styles.addLabel}>Add</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.25)",
    backgroundColor: colors.productCard,
    overflow: "hidden",
  },
  imageWrap: {
    aspectRatio: 5 / 4,
    backgroundColor: colors.imagePlaceholder,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: colors.imagePlaceholder,
  },
  wishBtn: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: spacing.md,
    gap: 4,
  },
  brand: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  mrp: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    textDecorationLine: "line-through",
  },
  discount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xs,
    color: colors.success,
  },
  addBtn: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brandAmber,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  addLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xs,
    color: colors.foreground,
  },
});

import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Heart, ShoppingBag } from "lucide-react-native";
import { router } from "expo-router";
import type { Product } from "@/types/models";
import { formatMoney, getDiscountPercent, getProductImageUrls } from "@/utils/format";
import { colors, spacing, textStyles, typography } from "@/theme";
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
          <Heart size={16} color={colors.foreground} strokeWidth={1.75} />
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
          <ShoppingBag size={14} color={colors.foreground} strokeWidth={1.75} />
          <Text style={styles.addLabel}>
            {addToCart.isPending ? "Adding…" : "Add to Bag"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageWrap: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.imagePlaceholder,
    overflow: "hidden",
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
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingTop: 10,
    gap: 2,
  },
  brand: {
    ...textStyles.eyebrow,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  title: {
    ...textStyles.productTitle,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  price: {
    ...textStyles.price,
  },
  mrp: {
    ...textStyles.priceStruck,
  },
  discount: {
    ...textStyles.discount,
  },
  addBtn: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  addLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.foreground,
  },
});

import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingBag } from "lucide-react-native";
import { queryKeys } from "@/constants/queryKeys";
import { getProductBySlug } from "@/services/productService";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/EmptyState";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist } from "@/hooks/useWishlist";
import { formatMoney, getDiscountPercent } from "@/utils/format";
import { getColorOptions, getGalleryMedia, getStockState } from "@/utils/product";
import { ProductReviewsSection } from "@/features/products/ProductReviewsSection";
import { colors, spacing, typography } from "@/theme";
import type { ProductVariant } from "@/types/models";

export function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();

  const productQuery = useQuery({
    queryKey: queryKeys.products.detail(String(slug)),
    queryFn: () => getProductBySlug(String(slug)),
    enabled: Boolean(slug),
  });

  const product = productQuery.data?.product;
  const colorOptions = useMemo(
    () => getColorOptions(product?.variants || []),
    [product?.variants]
  );

  const [colorKey, setColorKey] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  const activeColor =
    colorOptions.find((c) => c.key === colorKey) || colorOptions[0];
  const sizeVariants = activeColor?.variants || product?.variants || [];
  const selectedVariant: ProductVariant | undefined =
    sizeVariants.find((v) => v.sku === selectedSku) || sizeVariants[0];

  const gallery = product
    ? getGalleryMedia(product, selectedVariant)
    : [];
  const price = selectedVariant?.price ?? product?.price;
  const mrp = selectedVariant?.mrp ?? product?.mrp;
  const discount = getDiscountPercent(price, mrp);
  const stock = getStockState(selectedVariant?.stock);

  if (productQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brandAmber} size="large" />
      </View>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <ErrorState
        title="Product unavailable"
        description="This product could not be loaded."
        onRetry={() => productQuery.refetch()}
      />
    );
  }

  const onAdd = () => {
    if (!product._id || !selectedVariant?.sku || addToCart.isPending) return;
    if (stock.key === "oos") return;
    addToCart.mutate({
      productId: product._id,
      variantSku: selectedVariant.sku,
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {(gallery.length ? gallery : [null]).map((uri, index) => (
            <View key={`${uri}-${index}`} style={{ width }}>
              {uri ? (
                <Image
                  source={{ uri }}
                  style={styles.hero}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[styles.hero, styles.placeholder]} />
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.body}>
          <Text style={styles.brand}>
            {product.brand || product.category?.name || "Nilescart"}
          </Text>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatMoney(price)}</Text>
            {mrp != null && Number(mrp) > Number(price) ? (
              <Text style={styles.mrp}>{formatMoney(mrp)}</Text>
            ) : null}
            {discount > 0 ? (
              <Text style={styles.discount}>{discount}% off</Text>
            ) : null}
          </View>

          <Text
            style={[
              styles.stock,
              stock.key === "oos" && { color: colors.destructive },
              stock.key === "low" && { color: "#CA8A04" },
            ]}
          >
            {stock.urgency || stock.label}
          </Text>

          {colorOptions.length > 1 ? (
            <View style={styles.block}>
              <Text style={styles.label}>Color: {activeColor?.color}</Text>
              <View style={styles.swatches}>
                {colorOptions.map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => {
                      setColorKey(option.key);
                      setSelectedSku(option.variants[0]?.sku || null);
                    }}
                    style={[
                      styles.swatch,
                      { backgroundColor: option.colorHex },
                      (colorKey || colorOptions[0]?.key) === option.key &&
                        styles.swatchActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {sizeVariants.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.label}>Size</Text>
              <View style={styles.sizes}>
                {sizeVariants.map((variant) => {
                  const state = getStockState(variant.stock);
                  const active =
                    (selectedSku || selectedVariant?.sku) === variant.sku;
                  return (
                    <Pressable
                      key={variant.sku}
                      disabled={state.key === "oos"}
                      onPress={() => setSelectedSku(variant.sku)}
                      style={[
                        styles.sizeChip,
                        active && styles.sizeChipActive,
                        state.key === "oos" && styles.sizeChipDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeLabel,
                          active && styles.sizeLabelActive,
                        ]}
                      >
                        {variant.size || variant.sku}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {product.description ? (
            <View style={styles.block}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : null}

          <ProductReviewsSection product={product} />
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <Pressable
          accessibilityLabel="Wishlist"
          onPress={() => toggleWishlist.mutate(product._id)}
          style={styles.iconCta}
        >
          <Heart size={20} color={colors.foreground} />
        </Pressable>
        <Button
          title={stock.key === "oos" ? "Out of stock" : "Add to bag"}
          loading={addToCart.isPending}
          disabled={stock.key === "oos" || !selectedVariant?.sku}
          onPress={onAdd}
          style={styles.addCta}
        />
        <Pressable
          accessibilityLabel="View bag"
          onPress={() => router.push("/(tabs)/cart")}
          style={styles.iconCta}
        >
          <ShoppingBag size={20} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: 100 },
  hero: { width: "100%", height: 360, backgroundColor: colors.imagePlaceholder },
  placeholder: { backgroundColor: colors.imagePlaceholder },
  body: { padding: spacing.lg, gap: spacing.sm },
  brand: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xl,
    color: colors.foreground,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  price: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.foreground,
  },
  mrp: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
    textDecorationLine: "line-through",
  },
  discount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.success,
  },
  stock: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.success,
  },
  block: { marginTop: spacing.md, gap: spacing.sm },
  label: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  swatches: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  sizes: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  sizeChip: {
    minWidth: 48,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandWhite,
  },
  sizeChipActive: {
    borderColor: colors.brandAmber,
    backgroundColor: colors.brandCream,
  },
  sizeChipDisabled: { opacity: 0.4 },
  sizeLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  sizeLabelActive: { fontFamily: typography.fontFamily.bold },
  description: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
    lineHeight: 20,
  },
  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.brandWhite,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconCta: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  addCta: { flex: 1 },
});

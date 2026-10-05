import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import {
  useCartQuery,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/useCart";
import { useAuthStore } from "@/store/authStore";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatMoney, getProductImageUrls } from "@/utils/format";
import { colors, radius, spacing, textStyles, typography } from "@/theme";
import type { CartItem } from "@/types/models";

export function CartScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.loading);
  const cartQuery = useCartQuery();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brandAmber} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view your bag"
        description="Your bag syncs across devices once you're signed in."
        actionLabel="Sign in"
        onAction={() => router.push("/auth")}
      />
    );
  }

  if (cartQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brandAmber} />
      </View>
    );
  }

  if (cartQuery.isError) {
    return (
      <ErrorState
        description="Could not load your bag."
        onRetry={() => cartQuery.refetch()}
      />
    );
  }

  const items = (cartQuery.data?.cart?.items || []) as CartItem[];
  const busy = updateItem.isPending || removeItem.isPending;

  if (!items.length) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Browse styles and add your favourites."
        actionLabel="Continue shopping"
        onAction={() => router.push("/(tabs)")}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Bag</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const product = item.product;
          const image = product ? getProductImageUrls(product)[0] : null;
          const variant = product?.variants?.find(
            (v) => v.sku === item.variantSku
          );
          const price = variant?.price ?? product?.price;

          const openProduct = () => {
            if (product?.slug) {
              router.push(`/product/${product.slug}`);
            }
          };

          return (
            <View style={styles.row}>
              <Pressable
                onPress={openProduct}
                disabled={!product?.slug}
                accessibilityRole="button"
                accessibilityLabel={product?.title || "Product image"}
                style={({ pressed }) => [styles.thumbWrap, pressed && { opacity: 0.85 }]}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.thumb} contentFit="cover" />
                ) : (
                  <View style={[styles.thumb, styles.placeholder]} />
                )}
              </Pressable>

              <View style={styles.meta}>
                <Pressable
                  onPress={openProduct}
                  disabled={!product?.slug}
                  accessibilityRole="button"
                  accessibilityLabel={product?.title || "Product details"}
                  style={({ pressed }) => [styles.metaPressable, pressed && { opacity: 0.75 }]}
                >
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {product?.title || "Product"}
                  </Text>
                  <Text style={styles.variant}>
                    {[variant?.color, variant?.size, item.variantSku]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                  <Text style={styles.price}>{formatMoney(price)}</Text>
                </Pressable>

                <View style={styles.qtyRow}>
                  <Pressable
                    disabled={busy || item.quantity <= 1}
                    onPress={() =>
                      updateItem.mutate({
                        itemId: item._id,
                        quantity: item.quantity - 1,
                      })
                    }
                    style={styles.qtyBtn}
                  >
                    <Minus size={14} color={colors.foreground} />
                  </Pressable>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <Pressable
                    disabled={busy}
                    onPress={() =>
                      updateItem.mutate({
                        itemId: item._id,
                        quantity: item.quantity + 1,
                      })
                    }
                    style={styles.qtyBtn}
                  >
                    <Plus size={14} color={colors.foreground} />
                  </Pressable>
                  <Pressable
                    disabled={busy}
                    onPress={() => removeItem.mutate(item._id)}
                    style={styles.trash}
                  >
                    <Trash2 size={16} color={colors.destructive} />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>
            {formatMoney(cartQuery.data?.subtotal)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {formatMoney(cartQuery.data?.shippingFee)}
          </Text>
        </View>
        {(cartQuery.data?.discount || 0) > 0 ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryValue}>
              -{formatMoney(cartQuery.data?.discount)}
            </Text>
          </View>
        ) : null}
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatMoney(cartQuery.data?.total)}
          </Text>
        </View>
        <Button
          title="Checkout"
          onPress={() => router.push("/checkout")}
          style={styles.checkoutBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size["2xl"],
    color: colors.foreground,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 220, gap: spacing.md },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  thumbWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
  },
  thumb: {
    width: 88,
    height: 110,
    backgroundColor: colors.imagePlaceholder,
    borderRadius: radius.md,
  },
  placeholder: { backgroundColor: colors.imagePlaceholder },
  meta: { flex: 1, gap: 4 },
  metaPressable: { gap: 4 },
  itemTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.foreground,
  },
  variant: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
  },
  price: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    minWidth: 20,
    textAlign: "center",
    fontFamily: typography.fontFamily.bold,
  },
  trash: { marginLeft: "auto", padding: spacing.sm },
  summary: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.brandWhite,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontFamily: typography.fontFamily.regular,
    color: colors.brandGray,
    fontSize: typography.size.sm,
  },
  summaryValue: {
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    fontSize: typography.size.sm,
  },
  totalLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
    color: colors.foreground,
  },
  totalValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
    color: colors.foreground,
  },
  checkoutBtn: { marginTop: spacing.sm },
});

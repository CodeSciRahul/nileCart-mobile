import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { ChevronRight, Package, ShoppingBag, Star } from "lucide-react-native";
import { queryKeys } from "@/constants/queryKeys";
import { getMyOrders } from "@/services/checkoutService";
import { useAuthStore } from "@/store/authStore";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatMoney, getOrderItemImage } from "@/utils/format";
import { colors, radius, shadows, spacing, textStyles, typography } from "@/theme";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/types/models";

// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

type StatusStyle = { bg: string; text: string; border: string };

function getStatusStyle(status: string): StatusStyle {
  const s = status?.toLowerCase();
  if (s === "delivered")
    return { bg: "rgba(34, 197, 94, 0.1)", text: "#15803D", border: "rgba(34, 197, 94, 0.2)" };
  if (s === "cancelled" || s === "returned")
    return { bg: colors.destructiveMuted, text: colors.destructive, border: colors.destructiveBorder };
  if (s === "shipped" || s === "out_for_delivery")
    return { bg: "rgba(59, 130, 246, 0.08)", text: "#1D4ED8", border: "rgba(59, 130, 246, 0.18)" };
  return { bg: colors.amberMuted, text: "#92400E", border: colors.amberBorder };
}

function formatOrderDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const status = order.orderStatus || order.status || "placed";
  const statusStyle = getStatusStyle(status);
  const statusLabel = STATUS_LABELS[status] || status;

  const firstItem = order.items?.[0];
  const moreCount = (order.items?.length ?? 0) - 1;
  const itemWithImage = order.items?.find((it) => getOrderItemImage(it)) || firstItem;
  const thumbUri = getOrderItemImage(itemWithImage);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.orderNumber || order._id}`}
    >
      {/* Card Top: order number + status */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardOrderLabel}>ORDER</Text>
          <Text style={styles.cardOrderNumber}>
            #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </Text>
          {order.createdAt ? (
            <Text style={styles.cardDate}>{formatOrderDate(order.createdAt)}</Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Card Bottom: product thumb + title + price */}
      <View style={styles.cardBody}>
        <View style={styles.thumbWrap}>
          {thumbUri ? (
            <Image
              source={{ uri: thumbUri }}
              style={styles.thumb}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <ShoppingBag size={18} color={colors.brandStone} strokeWidth={1.5} />
            </View>
          )}
        </View>

        <View style={styles.cardBodyText}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {firstItem?.title || firstItem?.product?.title || "Order items"}
          </Text>
          {moreCount > 0 ? (
            <Text style={styles.moreItems}>+{moreCount} more item{moreCount > 1 ? "s" : ""}</Text>
          ) : null}
          <Text style={styles.paymentMethod}>
            {order.paymentMethod ? order.paymentMethod.toUpperCase() : "—"}
          </Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.cardTotal}>{formatMoney(order.total)}</Text>
          <ChevronRight size={16} color={colors.brandStone} strokeWidth={1.75} />
        </View>
      </View>

      {/* Delivered review prompt */}
      {status === "delivered" ? (
        <View style={styles.deliveredPromptRow}>
          <View style={styles.deliveredPromptLeft}>
            <Star size={12} color={colors.brandAmber} fill={colors.brandAmber} />
            <Text style={styles.deliveredPromptText}>Delivered · Rate & review items</Text>
          </View>
          <ChevronRight size={13} color={colors.brandAmber} strokeWidth={2} />
        </View>
      ) : null}
    </Pressable>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function OrdersRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const ordersQuery = useQuery({
    queryKey: queryKeys.orders({ page: 1 }),
    queryFn: () => getMyOrders({ page: 1 }),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view orders"
        actionLabel="Sign in"
        onAction={() => router.push("/auth")}
      />
    );
  }

  if (ordersQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (ordersQuery.isError) {
    return (
      <ErrorState
        description="Could not load orders."
        onRetry={() => ordersQuery.refetch()}
      />
    );
  }

  const orders = (ordersQuery.data?.orders || []) as Order[];

  if (!orders.length) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.emptyContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageKicker}>My Orders</Text>
        <Text style={styles.pageSubtitle}>Track and review your recent purchases.</Text>
        <View style={styles.emptyBox}>
          <View style={styles.emptyIconWrap}>
            <Package size={36} color={colors.brandAmber} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyBody}>
            When you place an order, it will appear here.
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => router.push("/(tabs)")}
            style={styles.emptyBtn}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      <FlashList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.pageKicker}>My Orders</Text>
            <Text style={styles.pageSubtitle}>
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push(`/account/orders/${item._id}` as Href)}
          />
        )}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },

  // List layout
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing["5xl"] },
  listHeader: { paddingTop: spacing.lg, paddingBottom: spacing.md },
  pageKicker: {
    ...textStyles.eyebrow,
    color: colors.brandAmber,
    letterSpacing: 2,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
  },

  // Empty state
  emptyContent: {
    padding: spacing.lg,
    paddingTop: spacing.lg,
    flexGrow: 1,
  },
  emptyBox: {
    marginTop: spacing["3xl"],
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.amberBorder,
    backgroundColor: "rgba(243, 239, 230, 0.5)",
    borderRadius: radius.lg,
    padding: spacing["3xl"],
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.amberMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.foreground,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: { marginTop: spacing.md, alignSelf: "stretch" },

  // Card
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  cardOrderLabel: {
    ...textStyles.eyebrow,
    color: colors.brandStone,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  cardOrderNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  cardDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  thumbWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  thumb: {
    width: 56,
    height: 70,
  },
  thumbFallback: {
    backgroundColor: colors.brandCream,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBodyText: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
    lineHeight: 18,
  },
  moreItems: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
  },
  paymentMethod: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    color: colors.brandStone,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  cardTotal: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  deliveredPromptRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(230, 168, 0, 0.08)",
    borderTopWidth: 1,
    borderTopColor: "rgba(230, 168, 0, 0.18)",
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  deliveredPromptLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deliveredPromptText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    color: colors.brandInk,
    letterSpacing: 0.1,
  },
});

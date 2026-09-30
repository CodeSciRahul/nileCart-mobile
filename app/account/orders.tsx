import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { queryKeys } from "@/constants/queryKeys";
import { getMyOrders } from "@/services/checkoutService";
import { useAuthStore } from "@/store/authStore";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/utils/format";
import { colors, spacing, textStyles, typography } from "@/theme";
import type { Order } from "@/types/models";

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
        <ActivityIndicator color={colors.primary} />
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
      <EmptyState
        title="No orders yet"
        description="When you place an order, it will show up here."
        actionLabel="Shop now"
        onAction={() => router.push("/(tabs)")}
      />
    );
  }

  return (
    <FlashList
      data={orders}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.push(`/account/orders/${item._id}` as Href)
          }
          style={styles.card}
        >
          <Text style={styles.orderNo}>
            {item.orderNumber || item._id.slice(-8)}
          </Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              {item.orderStatus || item.status || "Processing"}
            </Text>
          </View>
          <Text style={styles.meta}>{formatMoney(item.total)}</Text>
          {item.createdAt ? (
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          ) : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing["5xl"] },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 6,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  orderNo: {
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: typography.size.md,
    color: colors.foreground,
  },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.amberMuted,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    ...textStyles.badge,
    color: colors.foreground,
    textTransform: "capitalize",
  },
  meta: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  date: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
  },
});

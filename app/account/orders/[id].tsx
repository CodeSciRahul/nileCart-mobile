import { useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { queryKeys } from "@/constants/queryKeys";
import { cancelOrder, getOrderById } from "@/services/checkoutService";
import { retryOnlinePayment } from "@/features/checkout/paymentFlow";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatMoney, getImageUrl } from "@/utils/format";
import { colors, spacing, textStyles, typography } from "@/theme";
import type { Order } from "@/types/models";

function canCancel(order: Order) {
  const status = order.orderStatus || order.status;
  if (!status || !["placed", "confirmed"].includes(status)) return false;
  if (order.paymentMethod === "card" && order.paymentStatus === "paid") {
    return false;
  }
  return true;
}

export default function OrderDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const busyRef = useRef(false);

  const orderQuery = useQuery({
    queryKey: queryKeys.orders({ id: String(id) }),
    queryFn: () => getOrderById(String(id)),
    enabled: isAuthenticated && Boolean(id),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(String(id), reason.trim() || undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      showToast("Order cancelled", "success");
      orderQuery.refetch();
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error ? error.message : "Could not cancel order.",
        "error"
      );
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => retryOnlinePayment(String(id)),
    onSuccess: async ({ verify }) => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      if (verify?.paid || verify?.alreadyPaid) {
        showToast("Payment confirmed", "success");
        orderQuery.refetch();
        return;
      }
      if (verify?.failed || verify?.cancelled) {
        showToast("Payment was not completed.", "error");
        orderQuery.refetch();
        return;
      }
      showToast("Check order status after completing payment.", "success");
      orderQuery.refetch();
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error ? error.message : "Could not retry payment.",
        "error"
      );
    },
  });

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view order"
        actionLabel="Sign in"
        onAction={() => router.push("/auth")}
      />
    );
  }

  if (orderQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (orderQuery.isError || !orderQuery.data?.order) {
    return (
      <ErrorState
        title="Order not found"
        description="This order could not be loaded."
        onRetry={() => orderQuery.refetch()}
      />
    );
  }

  const order = orderQuery.data.order;
  const status = order.orderStatus || order.status || "Processing";
  const busy = cancelMutation.isPending || retryMutation.isPending;
  const showRetry =
    order.paymentMethod === "card" &&
    order.paymentStatus === "pending" &&
    status !== "cancelled";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Order</Text>
      <Text style={styles.title}>
        {order.orderNumber || order._id.slice(-8)}
      </Text>
      <Text style={styles.meta}>
        {status} · {order.paymentMethod || "—"} · {order.paymentStatus || "—"}
      </Text>
      <Text style={styles.total}>{formatMoney(order.total)}</Text>

      {order.shippingAddress ? (
        <View>
          <Text style={styles.section}>Delivery</Text>
          <Text style={styles.address}>
            {order.shippingAddress.fullName}
            {"\n"}
            {order.shippingAddress.addressLine}, {order.shippingAddress.city}
            {"\n"}
            {order.shippingAddress.mobileNumber}
          </Text>
        </View>
      ) : null}

      <Text style={styles.section}>Items</Text>
      {(order.items || []).map((item, index) => {
        const image = getImageUrl(item.product?.images?.[0]) || null;
        return (
          <View key={`${item.variantSku}-${index}`} style={styles.itemRow}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.thumb}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.thumb, styles.placeholder]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>
                {item.title || item.product?.title || "Item"}
              </Text>
              <Text style={styles.itemMeta}>
                Qty {item.quantity || 1}
                {item.variantSku ? ` · ${item.variantSku}` : ""}
              </Text>
              {item.price != null ? (
                <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
              ) : null}
            </View>
          </View>
        );
      })}

      {canCancel(order) ? (
        <View style={styles.cancelBlock}>
          <Text style={styles.section}>Cancel order</Text>
          <TextInput
            style={styles.reason}
            placeholder="Reason (optional)"
            placeholderTextColor={colors.brandGray}
            value={reason}
            onChangeText={setReason}
            editable={!busy}
          />
          <Button
            title="Cancel order"
            variant="destructive"
            loading={cancelMutation.isPending}
            disabled={busy}
            onPress={() => {
              if (busyRef.current || busy) return;
              busyRef.current = true;
              cancelMutation.mutate(undefined, {
                onSettled: () => {
                  busyRef.current = false;
                },
              });
            }}
          />
        </View>
      ) : null}

      {showRetry ? (
        <Button
          title="Retry payment"
          loading={retryMutation.isPending}
          disabled={busy}
          onPress={() => {
            if (busyRef.current || busy) return;
            busyRef.current = true;
            retryMutation.mutate(undefined, {
              onSettled: () => {
                busyRef.current = false;
              },
            });
          }}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing["5xl"],
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: typography.size["2xl"],
    color: colors.foreground,
  },
  kicker: {
    ...textStyles.eyebrow,
    color: colors.brandAmber,
    letterSpacing: 2,
  },
  meta: {
    fontFamily: typography.fontFamily.medium,
    color: colors.brandGray,
    fontSize: typography.size.sm,
  },
  total: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.lg,
    color: colors.foreground,
  },
  section: {
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.md,
    color: colors.foreground,
  },
  address: {
    fontFamily: typography.fontFamily.regular,
    color: colors.brandGray,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  itemRow: { flexDirection: "row", gap: spacing.md },
  thumb: { width: 64, height: 80, backgroundColor: colors.imagePlaceholder },
  placeholder: { backgroundColor: colors.imagePlaceholder },
  itemTitle: {
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
  },
  itemMeta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
  },
  itemPrice: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    marginTop: 4,
  },
  cancelBlock: { gap: spacing.sm, marginTop: spacing.lg },
  reason: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.foreground,
    minHeight: 48,
  },
});

import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  MapPin,
  Package,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react-native";
import { queryKeys } from "@/constants/queryKeys";
import { cancelOrder, getOrderById } from "@/services/checkoutService";
import { retryOnlinePayment } from "@/features/checkout/paymentFlow";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatMoney, getImageUrl, getOrderItemImage } from "@/utils/format";
import { colors, radius, shadows, spacing, textStyles, typography } from "@/theme";
import type { Order } from "@/types/models";

// ─── Helpers ────────────────────────────────────────────────────────────────────
function canCancel(order: Order) {
  const status = order.orderStatus || order.status;
  if (!status || !["placed", "confirmed"].includes(status)) return false;
  if (order.paymentMethod === "card" && order.paymentStatus === "paid") return false;
  return true;
}

const STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

type StatusStyle = { bg: string; text: string; border: string; icon: typeof Package };

function getStatusMeta(status: string): StatusStyle {
  const s = status?.toLowerCase();
  if (s === "delivered")
    return { bg: "rgba(34,197,94,0.1)", text: "#15803D", border: "rgba(34,197,94,0.22)", icon: CheckCircle2 };
  if (s === "cancelled" || s === "returned")
    return { bg: colors.destructiveMuted, text: colors.destructive, border: colors.destructiveBorder, icon: XCircle };
  if (s === "shipped" || s === "out_for_delivery")
    return { bg: "rgba(59,130,246,0.08)", text: "#1D4ED8", border: "rgba(59,130,246,0.2)", icon: Truck };
  return { bg: colors.amberMuted, text: "#92400E", border: colors.amberBorder, icon: Package };
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Section label ──────────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function OrderDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const busyRef = useRef(false);
  const [showCancelBlock, setShowCancelBlock] = useState(false);

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
      setShowCancelBlock(false);
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
        <ActivityIndicator color={colors.primary} size="large" />
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
  const status = order.orderStatus || order.status || "placed";
  const statusMeta = getStatusMeta(status);
  const StatusIcon = statusMeta.icon;
  const statusLabel = STATUS_LABELS[status] || status;
  const busy = cancelMutation.isPending || retryMutation.isPending;
  const showRetry =
    order.paymentMethod === "card" &&
    order.paymentStatus === "pending" &&
    status !== "cancelled";

  // Price breakdown
  const subtotal = order.subtotal ?? order.total ?? 0;
  const shipping = order.shippingFee ?? 0;
  const discount = order.discount ?? 0;
  const total = order.total ?? 0;

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior="padding">

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) + 180 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Status Banner ─────────────────────────────────────────── */}
        <View style={[styles.heroBanner, { backgroundColor: statusMeta.bg, borderColor: statusMeta.border }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: statusMeta.border }]}>
            <StatusIcon size={22} color={statusMeta.text} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroStatus, { color: statusMeta.text }]}>{statusLabel}</Text>
            <Text style={styles.heroOrderNo}>
              Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
            </Text>
            {order.createdAt ? (
              <Text style={styles.heroDate}>{formatDate(order.createdAt)}</Text>
            ) : null}
          </View>
        </View>

        {/* ── Price Summary Card ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <SectionLabel title="Order Summary" />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatMoney(subtotal)}</Text>
          </View>
          {shipping > 0 && (
            <View style={styles.priceRow}>
              <View style={styles.rowWithIcon}>
                <Truck size={13} color={colors.brandStone} strokeWidth={1.75} />
                <Text style={styles.priceLabel}>Shipping</Text>
              </View>
              <Text style={styles.priceValue}>{formatMoney(shipping)}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={styles.discountValue}>–{formatMoney(discount)}</Text>
            </View>
          )}
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>{formatMoney(total)}</Text>
          </View>

          {/* Payment method pill */}
          <View style={styles.paymentRow}>
            <View style={styles.paymentPill}>
              <CreditCard size={12} color={colors.brandStone} strokeWidth={1.75} />
              <Text style={styles.paymentText}>
                {order.paymentMethod ? order.paymentMethod.toUpperCase() : "—"}
              </Text>
            </View>
            <View
              style={[
                styles.paymentStatusPill,
                order.paymentStatus === "paid"
                  ? styles.paidPill
                  : order.paymentStatus === "pending"
                  ? styles.pendingPill
                  : styles.defaultPill,
              ]}
            >
              <Text
                style={[
                  styles.paymentStatusText,
                  order.paymentStatus === "paid"
                    ? { color: "#15803D" }
                    : order.paymentStatus === "pending"
                    ? { color: "#92400E" }
                    : { color: colors.brandGray },
                ]}
              >
                {order.paymentStatus ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Delivery Address Card ──────────────────────────────────────── */}
        {order.shippingAddress ? (
          <View style={styles.card}>
            <SectionLabel title="Delivery Address" />
            <View style={styles.addressRow}>
              <View style={styles.addressIconBox}>
                <MapPin size={16} color={colors.brandAmber} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
                <Text style={styles.addressBody}>
                  {order.shippingAddress.addressLine}
                  {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}
                  {order.shippingAddress.pincode ? ` – ${order.shippingAddress.pincode}` : ""}
                </Text>
                {order.shippingAddress.mobileNumber ? (
                  <Text style={styles.addressPhone}>
                    📞 {order.shippingAddress.mobileNumber}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}

        {/* ── Items Card ──────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <SectionLabel title={`Items (${(order.items ?? []).length})`} />
          {(order.items ?? []).map((item, index) => {
            const imageUri = getOrderItemImage(item);
            return (
              <View
                key={`${item.variantSku}-${index}`}
                style={[
                  styles.itemRow,
                  index < (order.items?.length ?? 0) - 1 && styles.itemRowBorder,
                ]}
              >
                {/* Thumb */}
                <View style={styles.itemThumbWrap}>
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.itemThumb}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : (
                    <View style={[styles.itemThumb, styles.itemThumbFallback]}>
                      <Package size={16} color={colors.brandStone} strokeWidth={1.5} />
                    </View>
                  )}
                </View>

                {/* Details */}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title || item.product?.title || "Item"}
                  </Text>
                  <View style={styles.itemMetaRow}>
                    {item.variantSku ? (
                      <View style={styles.skuChip}>
                        <Text style={styles.skuText}>{item.variantSku}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.qtyText}>Qty: {item.quantity ?? 1}</Text>
                  </View>
                </View>

                {/* Price */}
                {item.price != null ? (
                  <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* ── Retry Payment ───────────────────────────────────────────────── */}
        {showRetry ? (
          <View style={styles.card}>
            <View style={styles.retryBanner}>
              <RotateCcw size={18} color={colors.brandAmber} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text style={styles.retryTitle}>Payment pending</Text>
                <Text style={styles.retryBody}>
                  Your payment hasn't been confirmed yet. Tap below to retry.
                </Text>
              </View>
            </View>
            <Button
              title="Retry Payment"
              loading={retryMutation.isPending}
              disabled={busy}
              onPress={() => {
                if (busyRef.current || busy) return;
                busyRef.current = true;
                retryMutation.mutate(undefined, {
                  onSettled: () => { busyRef.current = false; },
                });
              }}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : null}

        {/* ── Cancel Order ────────────────────────────────────────────────── */}
        {canCancel(order) ? (
          <View style={styles.card}>
            <SectionLabel title="Cancel Order" />
            {!showCancelBlock ? (
              <Pressable
                onPress={() => setShowCancelBlock(true)}
                style={styles.cancelTrigger}
              >
                <XCircle size={16} color={colors.destructive} strokeWidth={1.75} />
                <Text style={styles.cancelTriggerText}>Request cancellation</Text>
              </Pressable>
            ) : (
              <>
                <Text style={styles.cancelHint}>
                  Please let us know why you'd like to cancel (optional).
                </Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Reason for cancellation…"
                  placeholderTextColor={colors.brandStone}
                  value={reason}
                  onChangeText={setReason}
                  editable={!busy}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <View style={styles.cancelActions}>
                  <Pressable
                    onPress={() => { setShowCancelBlock(false); setReason(""); }}
                    style={styles.cancelBack}
                  >
                    <ChevronLeft size={14} color={colors.brandGray} strokeWidth={2} />
                    <Text style={styles.cancelBackText}>Back</Text>
                  </Pressable>
                  <Button
                    title="Confirm cancellation"
                    variant="destructive"
                    loading={cancelMutation.isPending}
                    disabled={busy}
                    style={{ flex: 1 }}
                    onPress={() => {
                      Alert.alert(
                        "Cancel order?",
                        "Are you sure you want to cancel this order? This cannot be undone.",
                        [
                          { text: "Keep order", style: "cancel" },
                          {
                            text: "Yes, cancel",
                            style: "destructive",
                            onPress: () => {
                              if (busyRef.current || busy) return;
                              busyRef.current = true;
                              cancelMutation.mutate(undefined, {
                                onSettled: () => { busyRef.current = false; },
                              });
                            },
                          },
                        ]
                      );
                    }}
                  />
                </View>
              </>
            )}
          </View>
        ) : null}

        {/* Cancelled notice */}
        {status === "cancelled" && order.cancelledAt ? (
          <View style={styles.cancelledNotice}>
            <XCircle size={14} color={colors.destructive} strokeWidth={2} />
            <Text style={styles.cancelledText}>
              Cancelled on {formatDate(order.cancelledAt)}
              {order.cancelReason ? ` · ${order.cancelReason}` : ""}
            </Text>
          </View>
        ) : null}
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Hero
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  heroStatus: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
    letterSpacing: -0.1,
  },
  heroOrderNo: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.foreground,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  heroDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    marginTop: 2,
  },

  // Card
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  sectionLabel: {
    ...textStyles.eyebrow,
    color: colors.brandAmber,
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  // Price rows
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  priceLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
  },
  priceValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  discountValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: "#15803D",
  },
  priceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
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
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  paymentPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  paymentText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    color: colors.brandGray,
    letterSpacing: 0.5,
  },
  paymentStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  paidPill: { backgroundColor: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.2)" },
  pendingPill: { backgroundColor: colors.amberMuted, borderColor: colors.amberBorder },
  defaultPill: { backgroundColor: colors.surface, borderColor: colors.borderSoft },
  paymentStatusText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "capitalize",
  },

  // Address
  addressRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  addressIconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.amberMuted,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  addressName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.foreground,
    marginBottom: 3,
  },
  addressBody: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
    lineHeight: 20,
  },
  addressPhone: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    marginTop: 4,
  },

  // Items
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(221, 212, 196, 0.5)",
  },
  itemThumbWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  itemThumb: {
    width: 58,
    height: 74,
  },
  itemThumbFallback: {
    backgroundColor: colors.brandCream,
    alignItems: "center",
    justifyContent: "center",
  },
  itemDetails: {
    flex: 1,
    gap: 5,
  },
  itemTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
    lineHeight: 19,
  },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  skuChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  skuText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    color: colors.brandGray,
    letterSpacing: 0.3,
  },
  qtyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
  },
  itemPrice: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.foreground,
    marginLeft: "auto",
  },

  // Retry
  retryBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: colors.amberMuted,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  retryTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  retryBody: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    lineHeight: 17,
    marginTop: 2,
  },

  // Cancel
  cancelTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cancelTriggerText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.destructive,
  },
  cancelHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    lineHeight: 18,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.foreground,
    minHeight: 72,
    backgroundColor: colors.brandWhite,
  },
  cancelActions: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  cancelBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.brandWhite,
  },
  cancelBackText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.brandGray,
  },

  // Cancelled notice
  cancelledNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.destructiveMuted,
    borderWidth: 1,
    borderColor: colors.destructiveBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cancelledText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.destructive,
    lineHeight: 17,
  },
});

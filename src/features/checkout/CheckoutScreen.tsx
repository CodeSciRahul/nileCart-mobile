import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { CreditCard, Truck } from "lucide-react-native";
import { queryKeys } from "@/constants/queryKeys";
import {
  getAddresses,
  getPaymentConfig,
  placeOrder,
} from "@/services/checkoutService";
import { startOnlinePayment } from "@/features/checkout/paymentFlow";
import { CouponInput } from "@/features/checkout/CouponInput";
import { useCartQuery } from "@/hooks/useCart";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { AddressBottomSheet } from "@/components/address/AddressBottomSheet";
import { formatMoney } from "@/utils/format";
import { colors, radius, spacing, textStyles, typography } from "@/theme";

type PaymentMethod = "cod" | "online";

export function CheckoutScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const cartQuery = useCartQuery();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const submittingRef = useRef(false);

  const addressesQuery = useQuery({
    queryKey: queryKeys.addresses,
    queryFn: getAddresses,
    enabled: isAuthenticated,
  });

  const paymentConfigQuery = useQuery({
    queryKey: queryKeys.payment.config,
    queryFn: getPaymentConfig,
    staleTime: 5 * 60 * 1000,
  });

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders({}) });
      const order = data.order;
      showToast(
        order?.orderNumber
          ? `Order ${order.orderNumber} placed`
          : "Order placed successfully",
        "success"
      );
      router.replace({
        pathname: "/checkout/success",
        params: {
          orderId: order?._id || "",
          orderNumber: order?.orderNumber || "",
          paymentMethod: "cod",
        },
      });
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error
          ? error.message
          : "Could not place your order. Please try again.",
        "error"
      );
    },
  });

  const onlineMutation = useMutation({
    mutationFn: (addressId: string) => startOnlinePayment(addressId),
    onSuccess: async ({ verify, dismissedWithoutCallback }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders({}) });

      if (!verify) {
        showToast(
          dismissedWithoutCallback
            ? "Payment window closed. Check Orders if you completed payment."
            : "Payment was not confirmed.",
          "error"
        );
        return;
      }

      if (verify.cancelled || verify.failed) {
        showToast(
          verify.cancelled
            ? "Payment cancelled. Your order was not confirmed."
            : "Payment failed. Stock has been restored.",
          "error"
        );
        return;
      }

      if (verify.paid || verify.alreadyPaid) {
        const order = verify.order;
        router.replace({
          pathname: "/checkout/success",
          params: {
            orderId: order?._id || "",
            orderNumber: order?.orderNumber || "",
            paymentMethod: "online",
          },
        });
        return;
      }

      showToast("Payment could not be confirmed yet. Check Orders.", "error");
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error
          ? error.message
          : "Could not start payment. Please try again.",
        "error"
      );
    },
  });

  const addresses = addressesQuery.data?.addresses || [];
  const defaultAddressId = useMemo(() => {
    const preferred = addresses.find((a) => a.isDefault)?._id;
    return preferred || addresses[0]?._id || null;
  }, [addresses]);

  const activeAddressId = selectedAddressId || defaultAddressId;
  const currency = paymentConfigQuery.data?.currency || "UGX";
  const onlineEnabled = paymentConfigQuery.data?.onlinePaymentsEnabled ?? false;
  const items = cartQuery.data?.cart?.items || [];
  const busy =
    placeOrderMutation.isPending ||
    onlineMutation.isPending;

  const validateCheckout = () => {
    if (!items.length) {
      showToast("Your bag is empty. Add items before placing an order.", "error");
      return false;
    }
    if (!activeAddressId) {
      showToast("Please select a delivery address.", "error");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (busy || submittingRef.current) return;
    if (!validateCheckout() || !activeAddressId) return;

    submittingRef.current = true;
    try {
      if (paymentMethod === "cod") {
        await placeOrderMutation.mutateAsync({
          addressId: activeAddressId,
          paymentMethod: "cod",
        });
        return;
      }

      if (!onlineEnabled) {
        showToast("Online payments are not available right now.", "error");
        return;
      }

      await onlineMutation.mutateAsync(activeAddressId);
    } finally {
      submittingRef.current = false;
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to checkout"
        actionLabel="Sign in"
        onAction={() => router.push("/auth")}
      />
    );
  }

  if (cartQuery.isLoading || addressesQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brandAmber} />
      </View>
    );
  }

  if (cartQuery.isError) {
    return (
      <ErrorState
        description="Could not load checkout."
        onRetry={() => cartQuery.refetch()}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Your bag is empty"
        actionLabel="Continue shopping"
        onAction={() => router.push("/(tabs)")}
      />
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Checkout</Text>

      <Text style={styles.section}>Delivery address</Text>
      {addresses.map((address) => (
        <Pressable
          key={address._id}
          onPress={() => setSelectedAddressId(address._id)}
          style={[
            styles.addressCard,
            activeAddressId === address._id && styles.addressCardActive,
          ]}
        >
          <View style={styles.addressHeaderRow}>
            <Text style={styles.addressName}>{address.fullName}</Text>
            {address.addressType ? (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{address.addressType}</Text>
              </View>
            ) : null}
            {address.isDefault ? (
              <Text style={styles.defaultBadge}>Default</Text>
            ) : null}
          </View>
          <Text style={styles.addressBody}>
            {address.addressLine}
            {address.locality ? `, ${address.locality}` : ""},{" "}
            {address.city}, {address.state} {address.pincode}
          </Text>
          <Text style={styles.addressPhone}>Phone: {address.mobileNumber}</Text>
        </Pressable>
      ))}

      {addresses.length === 0 ? (
        <View style={styles.noAddressBox}>
          <Text style={styles.noAddressText}>
            No delivery address saved yet. Please add an address to continue.
          </Text>
        </View>
      ) : null}

      <Button
        title="+ Add New Address"
        variant="secondary"
        onPress={() => setIsAddressModalOpen(true)}
      />

      <AddressBottomSheet
        visible={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={(address) => {
          if (address?._id) {
            setSelectedAddressId(address._id);
          }
        }}
      />

      <Text style={styles.section}>Coupon</Text>
      <CouponInput
        appliedCoupon={
          cartQuery.data?.coupon?.code
            ? {
                code: cartQuery.data.coupon.code,
                description: cartQuery.data.coupon.description,
              }
            : null
        }
        subtotal={cartQuery.data?.subtotal ?? 0}
        currency={currency}
        disabled={busy}
      />

      <Text style={styles.section}>Payment method</Text>
      <Pressable
        onPress={() => setPaymentMethod("cod")}
        style={[
          styles.payMethod,
          paymentMethod === "cod" && styles.payMethodActive,
        ]}
      >
        <Truck size={18} color={colors.foreground} />
        <View style={{ flex: 1 }}>
          <Text style={styles.payTitle}>Cash on delivery</Text>
          <Text style={styles.payDesc}>Pay when delivered</Text>
        </View>
      </Pressable>
      <Pressable
        disabled={!onlineEnabled}
        onPress={() => onlineEnabled && setPaymentMethod("online")}
        style={[
          styles.payMethod,
          paymentMethod === "online" && styles.payMethodActive,
          !onlineEnabled && styles.payMethodDisabled,
        ]}
      >
        <CreditCard size={18} color={colors.foreground} />
        <View style={{ flex: 1 }}>
          <Text style={styles.payTitle}>Pay online</Text>
          <Text style={styles.payDesc}>
            {onlineEnabled
              ? "Card, mobile money, bank transfer"
              : "Online payments unavailable"}
          </Text>
        </View>
      </Pressable>

      <View style={styles.summary}>
        <Text style={styles.section}>Order summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.muted}>Subtotal</Text>
          <Text style={styles.summaryValue}>
            {formatMoney(cartQuery.data?.subtotal, currency)}
          </Text>
        </View>
        {(cartQuery.data?.discount || 0) > 0 ? (
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Discount</Text>
            <Text style={styles.summaryValue}>
              -{formatMoney(cartQuery.data?.discount, currency)}
            </Text>
          </View>
        ) : null}
        <View style={styles.summaryRow}>
          <Text style={styles.muted}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {formatMoney(cartQuery.data?.shippingFee, currency)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>
            {formatMoney(cartQuery.data?.total, currency)}
          </Text>
        </View>
      </View>

      <Button
        title={
          paymentMethod === "online" ? "Pay securely" : "Place order (COD)"
        }
        loading={busy}
        disabled={busy || !activeAddressId}
        onPress={handlePlaceOrder}
      />
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
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size["2xl"],
    color: colors.foreground,
  },
  section: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
    color: colors.foreground,
    marginTop: spacing.sm,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
    backgroundColor: colors.brandWhite,
    marginBottom: spacing.xs,
  },
  addressCardActive: {
    borderColor: colors.brandAmber,
    backgroundColor: colors.brandCream,
  },
  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginBottom: 2,
  },
  addressName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.foreground,
  },
  typeBadge: {
    borderWidth: 1,
    borderColor: colors.amberBorder,
    backgroundColor: colors.brandCream,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.foreground,
  },
  defaultBadge: {
    ...textStyles.badge,
    fontSize: 9,
    color: colors.foreground,
    backgroundColor: colors.amberMuted,
  },
  addressBody: {
    fontFamily: typography.fontFamily.regular,
    color: colors.brandGray,
    fontSize: typography.size.sm,
    lineHeight: 18,
  },
  addressPhone: {
    fontFamily: typography.fontFamily.medium,
    color: colors.brandGray,
    fontSize: typography.size.xs,
    marginTop: 2,
  },
  noAddressBox: {
    padding: spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.amberBorder,
    backgroundColor: "rgba(243, 239, 230, 0.4)",
    borderRadius: radius.md,
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  noAddressText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    textAlign: "center",
  },
  payMethod: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.brandWhite,
  },
  payMethodActive: {
    borderColor: colors.brandAmber,
    backgroundColor: colors.brandCream,
  },
  payMethodDisabled: { opacity: 0.5 },
  payTitle: {
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  payDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
  },
  summary: { gap: spacing.sm, marginVertical: spacing.sm },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  muted: {
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
  total: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.foreground,
  },
});

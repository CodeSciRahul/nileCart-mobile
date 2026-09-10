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
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Truck } from "lucide-react-native";
import { queryKeys } from "@/constants/queryKeys";
import {
  createAddress,
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
import { Input } from "@/components/ui/Input";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/utils/format";
import { colors, spacing, typography } from "@/theme";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, "Enter valid mobile number"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Enter valid pincode"),
  addressLine: z.string().min(5, "Address is required"),
  locality: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2),
  addressType: z.enum(["Home", "Work", "Other"]),
  isDefault: z.boolean(),
});

type AddressForm = z.infer<typeof addressSchema>;
type PaymentMethod = "cod" | "online";

export function CheckoutScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const cartQuery = useCartQuery();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      mobileNumber: "",
      pincode: "",
      addressLine: "",
      locality: "",
      city: "",
      state: "",
      country: "Uganda",
      addressType: "Home",
      isDefault: true,
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
      setShowForm(false);
      reset();
      showToast("Address saved", "success");
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error ? error.message : "Could not save address.",
        "error"
      );
    },
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
    createAddressMutation.isPending ||
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
          <Text style={styles.addressName}>{address.fullName}</Text>
          <Text style={styles.addressBody}>
            {address.addressLine}, {address.city}, {address.state}{" "}
            {address.pincode}
          </Text>
          <Text style={styles.addressBody}>{address.mobileNumber}</Text>
        </Pressable>
      ))}

      <Button
        title={showForm ? "Hide address form" : "Add new address"}
        variant="secondary"
        onPress={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <View style={styles.form}>
          {(
            [
              ["fullName", "Full name"],
              ["mobileNumber", "Mobile number"],
              ["pincode", "Pincode"],
              ["addressLine", "Address"],
              ["locality", "Locality (optional)"],
              ["city", "City"],
              ["state", "State"],
              ["country", "Country"],
            ] as const
          ).map(([name, label]) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field: { onChange, value } }) => (
                <Input
                  label={label}
                  value={value || ""}
                  onChangeText={onChange}
                  error={errors[name]?.message}
                  keyboardType={
                    name === "mobileNumber" || name === "pincode"
                      ? "number-pad"
                      : "default"
                  }
                />
              )}
            />
          ))}
          <Button
            title="Save address"
            loading={createAddressMutation.isPending}
            onPress={handleSubmit((values) =>
              createAddressMutation.mutate(values)
            )}
          />
        </View>
      ) : null}

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
    padding: spacing.md,
    gap: 4,
    backgroundColor: colors.brandWhite,
  },
  addressCardActive: {
    borderColor: colors.brandAmber,
    backgroundColor: colors.brandCream,
  },
  addressName: {
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  addressBody: {
    fontFamily: typography.fontFamily.regular,
    color: colors.brandGray,
    fontSize: typography.size.sm,
  },
  form: { gap: spacing.md },
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

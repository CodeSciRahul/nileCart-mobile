import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { queryKeys } from "@/constants/queryKeys";
import {
  deleteAddress,
  getAddresses,
  setDefaultAddress,
} from "@/services/checkoutService";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AddressBottomSheet } from "@/components/address/AddressBottomSheet";
import { colors, radius, spacing, textStyles, typography } from "@/theme";
import type { Address } from "@/types/models";

export default function AddressesRoute() {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const addressesQuery = useQuery({
    queryKey: queryKeys.addresses,
    queryFn: getAddresses,
    enabled: isAuthenticated,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.addresses });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => setDefaultAddress(id),
    onSuccess: async () => {
      await invalidate();
      showToast("Default address updated", "success");
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error ? error.message : "Could not update address.",
        "error"
      );
    },
    onSettled: () => setBusyId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: async () => {
      await invalidate();
      showToast("Address removed", "success");
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error ? error.message : "Could not delete address.",
        "error"
      );
    },
    onSettled: () => setBusyId(null),
  });

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to manage addresses"
        actionLabel="Sign in"
        onAction={() => router.push("/auth?redirect=%2Faccount%2Faddresses" as any)}
      />
    );
  }

  if (addressesQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (addressesQuery.isError) {
    return (
      <ErrorState
        description="Could not load addresses."
        onRetry={() => addressesQuery.refetch()}
      />
    );
  }

  const addresses = (addressesQuery.data?.addresses || []) as Address[];

  return (
    <View style={styles.screen}>
      <FlashList
        data={addresses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) + 80 },
        ]}
        ListEmptyComponent={
          <EmptyState
            title="No addresses saved"
            description="Add a delivery address for faster checkout."
            actionLabel="+ Add New Address"
            onAction={() => setIsBottomSheetOpen(true)}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.fullName}</Text>
              {item.addressType ? (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.addressType}</Text>
                </View>
              ) : null}
              {item.isDefault ? (
                <Text style={styles.defaultBadge}>Default</Text>
              ) : null}
            </View>

            <Text style={styles.body}>
              {item.addressLine}
              {item.locality ? `, ${item.locality}` : ""},{" "}
              {item.city}, {item.state} {item.pincode}
            </Text>
            {item.country ? (
              <Text style={styles.countryText}>{item.country}</Text>
            ) : null}
            <Text style={styles.phoneText}>Phone: {item.mobileNumber}</Text>

            <View style={styles.actions}>
              {!item.isDefault ? (
                <Pressable
                  disabled={busyId === item._id}
                  onPress={() => {
                    setBusyId(item._id);
                    defaultMutation.mutate(item._id);
                  }}
                  style={styles.actionBtn}
                >
                  <Text style={styles.link}>Make default</Text>
                </Pressable>
              ) : null}
              <Pressable
                disabled={busyId === item._id}
                onPress={() => {
                  Alert.alert("Delete address?", "Are you sure you want to remove this address?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        setBusyId(item._id);
                        deleteMutation.mutate(item._id);
                      },
                    },
                  ]);
                }}
                style={styles.actionBtn}
              >
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}
      >
        <Button
          title="+ Add New Address"
          onPress={() => setIsBottomSheetOpen(true)}
        />
      </View>

      <AddressBottomSheet
        visible={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: 4,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  name: {
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
    fontSize: typography.size.md,
  },
  typeBadge: {
    borderWidth: 1,
    borderColor: colors.amberBorder,
    backgroundColor: colors.brandCream,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.foreground,
  },
  defaultBadge: {
    ...textStyles.badge,
    color: colors.foreground,
    backgroundColor: colors.amberMuted,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    color: colors.brandGray,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  countryText: {
    fontFamily: typography.fontFamily.regular,
    color: colors.brandStone,
    fontSize: typography.size.xs,
  },
  phoneText: {
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(221, 212, 196, 0.4)",
  },
  actionBtn: {
    paddingVertical: 4,
  },
  link: {
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    fontSize: typography.size.sm,
  },
  delete: {
    fontFamily: typography.fontFamily.medium,
    color: colors.destructive,
    fontSize: typography.size.sm,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
});

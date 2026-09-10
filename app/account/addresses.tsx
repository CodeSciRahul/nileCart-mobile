import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
import { colors, spacing, typography } from "@/theme";
import type { Address } from "@/types/models";

export default function AddressesRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

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
        onAction={() => router.push("/auth")}
      />
    );
  }

  if (addressesQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brandAmber} />
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
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <EmptyState
            title="No addresses yet"
            description="Add an address during checkout."
            actionLabel="Go to checkout"
            onAction={() => router.push("/checkout")}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.fullName}
              {item.isDefault ? " · Default" : ""}
            </Text>
            <Text style={styles.body}>
              {item.addressLine}, {item.city}, {item.state} {item.pincode}
            </Text>
            <Text style={styles.body}>{item.mobileNumber}</Text>
            <View style={styles.actions}>
              {!item.isDefault ? (
                <Pressable
                  disabled={busyId === item._id}
                  onPress={() => {
                    setBusyId(item._id);
                    defaultMutation.mutate(item._id);
                  }}
                >
                  <Text style={styles.link}>Make default</Text>
                </Pressable>
              ) : null}
              <Pressable
                disabled={busyId === item._id}
                onPress={() => {
                  Alert.alert("Delete address?", "This cannot be undone.", [
                    { text: "Keep", style: "cancel" },
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
              >
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Button title="Add via checkout" onPress={() => router.push("/checkout")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
    marginBottom: spacing.md,
    backgroundColor: colors.brandWhite,
  },
  name: {
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    color: colors.brandGray,
    fontSize: typography.size.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  link: {
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
    fontSize: typography.size.sm,
  },
  delete: {
    fontFamily: typography.fontFamily.bold,
    color: colors.destructive,
    fontSize: typography.size.sm,
  },
  footer: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
});

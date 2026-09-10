import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useWishlistQuery } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { colors, spacing, typography } from "@/theme";
import type { Product } from "@/types/models";

export function WishlistScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.loading);
  const wishlistQuery = useWishlistQuery();

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
        title="Sign in to see wishlist"
        description="Save items you love and find them here later."
        actionLabel="Sign in"
        onAction={() => router.push("/auth")}
      />
    );
  }

  if (wishlistQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brandAmber} />
      </View>
    );
  }

  if (wishlistQuery.isError) {
    return (
      <ErrorState
        description="Could not load wishlist."
        onRetry={() => wishlistQuery.refetch()}
      />
    );
  }

  const products: Product[] =
    wishlistQuery.data?.products ||
    (wishlistQuery.data?.items || [])
      .map((item) => item.product)
      .filter((p): p is Product => Boolean(p));

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Wishlist</Text>
      <ProductGrid
        products={products}
        ListHeaderComponent={null}
        refreshing={wishlistQuery.isRefetching}
        onRefresh={() => wishlistQuery.refetch()}
      />
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
});

import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { getCategoryShop } from "@/services/categoryService";
import { ProductGrid } from "@/components/product/ProductGrid";
import { colors, spacing, typography } from "@/theme";
import type { Product } from "@/types/models";

export function ShopScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const shopQuery = useQuery({
    queryKey: queryKeys.categories.shop(String(slug), { page: 1 }),
    queryFn: () => getCategoryShop(String(slug), { page: 1, limit: 40 }),
    enabled: Boolean(slug),
  });

  const products = (shopQuery.data?.products || []) as Product[];
  const categoryName =
    (shopQuery.data?.category as { name?: string } | undefined)?.name ||
    String(slug);

  return (
    <View style={styles.screen}>
      <ProductGrid
        products={products}
        loading={shopQuery.isLoading}
        error={shopQuery.isError}
        onRetry={() => shopQuery.refetch()}
        ListHeaderComponent={
          <Text style={styles.title}>{categoryName}</Text>
        }
        refreshing={shopQuery.isRefetching}
        onRefresh={() => shopQuery.refetch()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xl,
    color: colors.foreground,
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
});

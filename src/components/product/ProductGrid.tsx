import { StyleSheet, useWindowDimensions, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import type { Product } from "@/types/models";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { spacing } from "@/theme";

type Props = {
  products: Product[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  currency?: string;
  ListHeaderComponent?: React.ReactElement | null;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function ProductGrid({
  products,
  loading,
  error,
  onRetry,
  currency,
  ListHeaderComponent,
  onEndReached,
  refreshing,
  onRefresh,
}: Props) {
  const { width } = useWindowDimensions();
  const horizontalPad = spacing.lg * 2;
  const gap = spacing.sm;
  const cardWidth = (width - horizontalPad - gap) / 2;

  if (loading && products.length === 0) {
    return (
      <View style={styles.skeletonGrid}>
        {ListHeaderComponent}
        <View style={styles.row}>
          <View style={{ width: cardWidth }}>
            <ProductCardSkeleton />
          </View>
          <View style={{ width: cardWidth }}>
            <ProductCardSkeleton />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: cardWidth }}>
            <ProductCardSkeleton />
          </View>
          <View style={{ width: cardWidth }}>
            <ProductCardSkeleton />
          </View>
        </View>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <ErrorState onRetry={onRetry} description="Could not load products." />
    );
  }

  return (
    <FlashList
      data={products}
      numColumns={2}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.content}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <EmptyState
          title="No products found"
          description="Try another category or search."
        />
      }
      renderItem={({ item }) => (
        <View style={[styles.cell, { width: cardWidth }]}>
          <ProductCard product={item} currency={currency} />
        </View>
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  cell: {
    paddingBottom: spacing.sm,
    paddingRight: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: "row",
  },
  skeletonGrid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
});

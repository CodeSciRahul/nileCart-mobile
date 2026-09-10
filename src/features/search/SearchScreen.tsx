import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { searchProducts } from "@/services/productService";
import { Input } from "@/components/ui/Input";
import { ProductGrid } from "@/components/product/ProductGrid";
import { colors, spacing } from "@/theme";
import type { Product } from "@/types/models";

export function SearchScreen() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  const searchQuery = useQuery({
    queryKey: queryKeys.products.list({ search: submitted, mode: "search" }),
    queryFn: () => searchProducts({ q: submitted, search: submitted }),
    enabled: submitted.length > 1,
  });

  const products = (searchQuery.data?.products || []) as Product[];

  return (
    <View style={styles.screen}>
      <View style={styles.searchBar}>
        <Input
          placeholder="Search products"
          value={q}
          onChangeText={setQ}
          returnKeyType="search"
          onSubmitEditing={() => setSubmitted(q.trim())}
          autoFocus
        />
      </View>
      <ProductGrid
        products={products}
        loading={searchQuery.isFetching}
        error={searchQuery.isError}
        onRetry={() => searchQuery.refetch()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  searchBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});

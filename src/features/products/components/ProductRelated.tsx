import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { getProducts } from "@/services/productService";
import { ProductCard } from "@/components/product/ProductCard";
import { colors, typography } from "@/theme";
import type { Product } from "@/types/models";

type Props = {
  currentProductId: string;
  categorySlug?: string;
};

export function ProductRelated({ currentProductId, categorySlug }: Props) {
  const relatedQuery = useQuery({
    queryKey: queryKeys.products.list({
      limit: 10,
      ...(categorySlug ? { category: categorySlug } : {}),
    }),
    queryFn: () =>
      getProducts({
        limit: 10,
        ...(categorySlug ? { category: categorySlug } : {}),
      }),
  });

  const allProducts = (relatedQuery.data?.products || []) as Product[];
  const relatedProducts = allProducts.filter((p) => p._id !== currentProductId).slice(0, 6);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>STYLE RECOMMENDATIONS</Text>
        <Text style={styles.title}>You May Also Like</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {relatedProducts.map((item) => (
          <View key={item._id} style={styles.cardWrapper}>
            <ProductCard product={item} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: colors.brandWhite,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 224, 200, 0.5)",
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 2,
  },
  eyebrow: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.brandGray,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.foreground,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardWrapper: {
    width: 170,
  },
});

import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { queryKeys } from "@/constants/queryKeys";
import { getHome, getProducts } from "@/services/productService";
import { getSubCategories } from "@/services/categoryService";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BrandLogo } from "@/components/BrandLogo";
import { getImageUrl } from "@/utils/format";
import { colors, spacing, typography } from "@/theme";
import type { Banner, Category, Product } from "@/types/models";
import { Search } from "lucide-react-native";

function extractBanners(home: Awaited<ReturnType<typeof getHome>> | undefined) {
  const hero = home?.sections?.find(
    (section) => section.type === "hero_banner" && section.data?.banners?.length
  );
  return (hero?.data?.banners || []) as Banner[];
}

export function HomeScreen() {
  const { width } = useWindowDimensions();

  const homeQuery = useQuery({
    queryKey: queryKeys.home("mobile"),
    queryFn: () => getHome("mobile"),
  });

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list({ limit: 20 }),
    queryFn: () => getProducts({ limit: 20 }),
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.subcategories,
    queryFn: getSubCategories,
  });

  const banners = useMemo(
    () => extractBanners(homeQuery.data),
    [homeQuery.data]
  );
  const products = (productsQuery.data?.products || []) as Product[];
  const categories = (categoriesQuery.data?.categories || []) as Category[];
  const announcement = homeQuery.data?.announcement;

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.topBar}>
        <BrandLogo />
        <Pressable
          accessibilityLabel="Search"
          onPress={() => router.push("/search")}
          style={styles.searchBtn}
        >
          <Search size={18} color={colors.foreground} />
        </Pressable>
      </View>

      {announcement?.message ? (
        <View style={styles.announcement}>
          <Text style={styles.announcementText}>{announcement.message}</Text>
        </View>
      ) : null}

      {banners.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerScroll}
        >
          {banners.map((banner, index) => {
            const uri =
              getImageUrl(banner.mobileImage) || getImageUrl(banner.image);
            return (
              <View
                key={banner._id || String(index)}
                style={{ width: width - spacing.lg * 2 }}
              >
                {uri ? (
                  <Image
                    source={{ uri }}
                    style={styles.banner}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={[styles.banner, styles.bannerFallback]}>
                    <Text style={styles.bannerFallbackText}>
                      {banner.title || "Nilescart"}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      ) : null}

      {categories.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.catRow}>
              {categories.slice(0, 12).map((cat) => (
                <Pressable
                  key={cat._id}
                  onPress={() => router.push(`/shop/${cat.slug}`)}
                  style={styles.catChip}
                >
                  <Text style={styles.catLabel} numberOfLines={1}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : null}

      <Text style={[styles.sectionTitle, styles.productsTitle]}>
        Trending now
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ProductGrid
        products={products}
        loading={productsQuery.isLoading}
        error={productsQuery.isError}
        onRetry={() => productsQuery.refetch()}
        ListHeaderComponent={header}
        refreshing={productsQuery.isRefetching}
        onRefresh={() => {
          homeQuery.refetch();
          productsQuery.refetch();
          categoriesQuery.refetch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBlock: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 245, 209, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.15)",
  },
  announcement: {
    backgroundColor: colors.brandCream,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  announcementText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
    textAlign: "center",
  },
  bannerScroll: {
    marginHorizontal: 0,
  },
  banner: {
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.imagePlaceholder,
  },
  bannerFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandCream,
  },
  bannerFallbackText: {
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.foreground,
  },
  productsTitle: {
    marginTop: spacing.sm,
  },
  catRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  catChip: {
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.25)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
    justifyContent: "center",
  },
  catLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
    maxWidth: 120,
  },
});

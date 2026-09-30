import { useMemo, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { Search } from "lucide-react-native";
import { queryKeys } from "@/constants/queryKeys";
import { DEPARTMENT_LABELS, DEPARTMENT_ORDER, SITE } from "@/constants";
import { getHome, getProducts } from "@/services/productService";
import { getSubCategories } from "@/services/categoryService";
import { ProductCard } from "@/components/product/ProductCard";
import { BrandLogo } from "@/components/BrandLogo";
import { getImageUrl } from "@/utils/format";
import { colors, radius, spacing, textStyles, typography } from "@/theme";
import type { Banner, Category, Product } from "@/types/models";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80";
const CAMPAIGN_IMAGE =
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80";

function extractBanners(home: Awaited<ReturnType<typeof getHome>> | undefined) {
  const hero = home?.sections?.find(
    (section) => section.type === "hero_banner" && section.data?.banners?.length
  );
  return (hero?.data?.banners || []) as Banner[];
}

function bannerHref(banner?: Banner) {
  return banner?.ctaHref || banner?.ctaLink || banner?.href || banner?.link || "/shop/women";
}

function SectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderCopy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
        {description ? (
          <Text style={styles.sectionDescription}>{description}</Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.sectionAction}>
          <Text style={styles.sectionActionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ProductRail({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.railContent}
    >
      {products.map((product) => (
        <View key={product._id} style={styles.railCard}>
          <ProductCard product={product} />
        </View>
      ))}
    </ScrollView>
  );
}

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const [heroIndex, setHeroIndex] = useState(0);
  const heroHeight = Math.min(Math.round(width * 1.28), 560);

  const homeQuery = useQuery({
    queryKey: queryKeys.home("mobile"),
    queryFn: () => getHome("mobile"),
  });

  const arrivalsQuery = useQuery({
    queryKey: queryKeys.products.list({ limit: 10, sort: "-createdAt" }),
    queryFn: () => getProducts({ limit: 10, sort: "-createdAt" }),
  });

  const picksQuery = useQuery({
    queryKey: queryKeys.products.list({ limit: 8, sort: "-discountPercent" }),
    queryFn: () => getProducts({ limit: 8, sort: "-discountPercent" }),
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.subcategories,
    queryFn: getSubCategories,
  });

  const banners = useMemo(
    () => extractBanners(homeQuery.data),
    [homeQuery.data]
  );
  const slides = banners.length ? banners : [{} as Banner];
  const arrivals = (arrivalsQuery.data?.products || []) as Product[];
  const picks = (picksQuery.data?.products || []) as Product[];
  const categories = ((categoriesQuery.data?.categories || []) as Category[]).slice(
    0,
    7
  );
  const announcement = homeQuery.data?.announcement;
  const refreshing =
    homeQuery.isRefetching ||
    arrivalsQuery.isRefetching ||
    picksQuery.isRefetching ||
    categoriesQuery.isRefetching;

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== heroIndex && next >= 0 && next < slides.length) {
      setHeroIndex(next);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <BrandLogo />
        <Pressable
          accessibilityLabel="Search"
          onPress={() => router.push("/search")}
          style={styles.searchBtn}
        >
          <Search size={18} color={colors.foreground} strokeWidth={1.75} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.primary}
            onRefresh={() => {
              homeQuery.refetch();
              arrivalsQuery.refetch();
              picksQuery.refetch();
              categoriesQuery.refetch();
            }}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {announcement?.message ? (
          <View style={styles.announcement}>
            <Text style={styles.announcementText}>{announcement.message}</Text>
          </View>
        ) : null}

        <View style={[styles.heroWrap, { height: heroHeight }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onHeroScroll}
            decelerationRate="fast"
          >
            {slides.map((banner, index) => {
              const uri =
                getImageUrl(banner.mobileImage) ||
                getImageUrl(banner.image) ||
                HERO_FALLBACK;
              const href = bannerHref(banner) as Href;
              return (
        <Pressable
                  key={banner._id || String(index)}
                  onPress={() => router.push(href)}
                  style={{ width, height: heroHeight }}
                >
                  <Image
                    source={{ uri }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={250}
                    priority={index === 0 ? "high" : "low"}
                  />
                  <View style={styles.heroWash} />
                  <View style={styles.heroCopy}>
                    <Text style={styles.heroBrand}>{SITE.name.toLowerCase()}</Text>
                    <Text style={styles.heroHeadline}>
                      {banner.title || "Fashion, edited for everyday"}
                    </Text>
                    <Text style={styles.heroSupport}>
                      {banner.description ||
                        "Editorial pieces and everyday essentials — curated under one brand."}
                    </Text>
                    <View style={styles.heroActions}>
                      <Pressable
                        onPress={() => router.push(href)}
                        style={styles.heroPrimary}
                      >
                        <Text style={styles.heroPrimaryLabel}>
                          {banner.ctaText || "Shop the edit"}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => router.push("/shop/women")}
                        style={styles.heroSecondary}
                      >
                        <Text style={styles.heroSecondaryLabel}>Shop women</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
          {slides.length > 1 ? (
            <View style={styles.heroDots}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.heroDot,
                    index === heroIndex && styles.heroDotActive,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.padded}>
          <SectionHeader
            eyebrow="Categories"
            title="Shop the rooms"
            description="Clean edits by category — find the silhouette, then make it yours."
            actionLabel="See all"
            onAction={() => router.push("/(tabs)/categories")}
          />
          {categories.length ? (
            <View style={styles.categoryGrid}>
              {categories.map((category, index) => {
                const uri = getImageUrl(category.image);
                const featured = index === 0;
                return (
                  <Pressable
                    key={category._id}
                    onPress={() => router.push(`/shop/${category.slug}`)}
                    style={[
                      styles.categoryTile,
                      featured && styles.categoryTileFeatured,
                    ]}
                  >
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.categoryFallback} />
                    )}
                    <View style={styles.categoryWash} />
                    <View style={styles.categoryCopy}>
                      <Text style={styles.categoryEyebrow}>Shop</Text>
                      <Text
                        style={[
                          styles.categoryName,
                          featured && styles.categoryNameFeatured,
                        ]}
                        numberOfLines={2}
                      >
                        {category.name}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyHint}>
              Categories will appear here once they are published.
            </Text>
          )}
        </View>

        <View style={styles.padded}>
          <SectionHeader
            eyebrow="Just in"
            title="New arrivals"
            description="Fresh drops from the Nilescart edit — ready to wear, ready to ship."
            actionLabel="Browse"
            onAction={() => router.push("/(tabs)/categories")}
          />
        </View>
        <ProductRail products={arrivals} />

        <View style={styles.campaign}>
          <Image
            source={{ uri: CAMPAIGN_IMAGE }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View style={styles.campaignWash} />
          <View style={styles.campaignCopy}>
            <Text style={styles.campaignEyebrow}>Campaign</Text>
            <Text style={styles.campaignTitle}>
              Soft light. Strong silhouettes.
            </Text>
            <Text style={styles.campaignBody}>
              A season of clean lines and warm tones — shop the pieces from the
              live edit.
            </Text>
            <View style={styles.campaignActions}>
              <Pressable
                onPress={() => router.push("/shop/women")}
                style={styles.heroPrimary}
              >
                <Text style={styles.heroPrimaryLabel}>Shop women</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/shop/men")}
                style={styles.heroSecondary}
              >
                <Text style={styles.heroSecondaryLabel}>Shop men</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.padded}>
          <SectionHeader
            eyebrow="Departments"
            title="Start where you shop"
            description="Jump into a department — then refine by category."
          />
          {DEPARTMENT_ORDER.map((key) => (
            <Pressable
              key={key}
              onPress={() => router.push(`/shop/${key}`)}
              style={styles.deptRow}
            >
              <Text style={styles.deptName}>{DEPARTMENT_LABELS[key]}</Text>
              <Text style={styles.deptCta}>Shop →</Text>
            </Pressable>
          ))}
        </View>

        {picks.length ? (
          <>
            <View style={styles.padded}>
              <SectionHeader
                eyebrow="Strong edits"
                title="Better discounts"
                description="High-value picks from the live catalog."
                actionLabel="Search"
                onAction={() => router.push("/search")}
              />
            </View>
            <ProductRail products={picks} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.creamMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.amberRing,
  },
  scrollContent: {
    paddingBottom: spacing["5xl"],
  },
  announcement: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.brandCream,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  announcementText: {
    ...textStyles.bodySecondary,
    textAlign: "center",
    color: colors.foreground,
  },
  heroWrap: {
    width: "100%",
    backgroundColor: colors.imagePlaceholder,
    marginBottom: spacing["2xl"],
  },
  heroWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  heroCopy: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  heroBrand: {
    fontFamily: typography.fontFamily.display,
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.brandWhite,
  },
  heroHeadline: {
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: 22,
    lineHeight: 28,
    color: colors.brandWhite,
    maxWidth: 280,
  },
  heroSupport: {
    marginTop: spacing.sm,
    ...textStyles.bodySecondary,
    color: colors.brandWhite,
    opacity: 0.85,
    maxWidth: 300,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  heroPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
  },
  heroPrimaryLabel: {
    ...textStyles.button,
  },
  heroSecondary: {
    borderWidth: 1,
    borderColor: colors.brandWhite,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
  },
  heroSecondaryLabel: {
    ...textStyles.button,
    color: colors.brandWhite,
  },
  heroDots: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  heroDot: {
    width: 8,
    height: 2,
    backgroundColor: colors.whiteMuted,
  },
  heroDotActive: {
    width: 18,
    backgroundColor: colors.brandWhite,
  },
  padded: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionHeaderCopy: {
    gap: 6,
  },
  eyebrow: {
    ...textStyles.eyebrow,
    color: colors.brandAmber,
    letterSpacing: 2.4,
  },
  sectionTitle: {
    ...textStyles.sectionTitle,
    fontSize: 26,
    lineHeight: 32,
  },
  sectionDescription: {
    ...textStyles.bodySecondary,
  },
  sectionAction: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  sectionActionLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.foreground,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryTile: {
    width: "48.5%",
    height: 168,
    overflow: "hidden",
    backgroundColor: colors.brandSand,
  },
  categoryTileFeatured: {
    width: "100%",
    height: 220,
  },
  categoryFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.brandSand,
  },
  categoryWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlayScrim,
    opacity: 0.35,
  },
  categoryCopy: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.md,
  },
  categoryEyebrow: {
    ...textStyles.eyebrow,
    color: colors.brandAmber,
    letterSpacing: 2,
  },
  categoryName: {
    marginTop: 4,
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: 18,
    color: colors.brandWhite,
  },
  categoryNameFeatured: {
    fontSize: 26,
    lineHeight: 30,
  },
  emptyHint: {
    ...textStyles.bodySecondary,
    textAlign: "center",
    paddingVertical: spacing["2xl"],
  },
  railContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.md,
  },
  railCard: {
    width: 168,
  },
  campaign: {
    height: 420,
    marginBottom: spacing["2xl"],
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  campaignWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlayScrim,
  },
  campaignCopy: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["3xl"],
    maxWidth: 360,
  },
  campaignEyebrow: {
    ...textStyles.eyebrow,
    color: colors.brandAmber,
    letterSpacing: 2.8,
  },
  campaignTitle: {
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.brandWhite,
  },
  campaignBody: {
    marginTop: spacing.sm,
    ...textStyles.bodySecondary,
    color: colors.brandWhite,
  },
  campaignActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  deptRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: colors.inkMuted,
  },
  deptName: {
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: 24,
    color: colors.foreground,
  },
  deptCta: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.brandStone,
  },
});

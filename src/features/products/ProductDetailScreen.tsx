import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { getProductBySlug } from "@/services/productService";
import { ErrorState } from "@/components/ui/EmptyState";
import { useAddToCart, useCartCount } from "@/hooks/useCart";
import { useToggleWishlist, useWishlistQuery } from "@/hooks/useWishlist";
import { useUiStore } from "@/store/uiStore";
import { getDiscountPercent } from "@/utils/format";
import { getColorOptions, getGalleryMedia, getStockState } from "@/utils/product";
import { shareProduct } from "@/utils/productShare";
import { colors } from "@/theme";
import type { ProductVariant } from "@/types/models";

// Sub-components
import { ProductHeader } from "./components/ProductHeader";
import { ProductGallery } from "./components/ProductGallery";
import { ProductPriceBlock } from "./components/ProductPriceBlock";
import { ProductVariantsSelector } from "./components/ProductVariantsSelector";
import { ProductOffers } from "./components/ProductOffers";
import { ProductServices } from "./components/ProductServices";
import { ProductAccordion } from "./components/ProductAccordion";
import { ProductReviewsSection } from "./ProductReviewsSection";
import { ProductRelated } from "./components/ProductRelated";
import { ProductBottomBar } from "./components/ProductBottomBar";

type Props = {
  wrapSafeArea?: boolean;
};

export function ProductDetailScreen({ wrapSafeArea = false }: Props = {}) {
  const Container = wrapSafeArea ? SafeAreaView : View;
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const showToast = useUiStore((s) => s.showToast);
  const scrollRef = useRef<ScrollView>(null);
  const [reviewsLayoutY, setReviewsLayoutY] = useState(0);

  // Queries & Mutations
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const wishlistQuery = useWishlistQuery();
  const { count: cartCount } = useCartCount();

  const productQuery = useQuery({
    queryKey: queryKeys.products.detail(String(slug)),
    queryFn: () => getProductBySlug(String(slug)),
    enabled: Boolean(slug),
  });

  const product = productQuery.data?.product;

  // Color & Size Variant Management
  const colorOptions = useMemo(
    () => getColorOptions(product?.variants || []),
    [product?.variants]
  );

  const [colorKey, setColorKey] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [hasSizeError, setHasSizeError] = useState(false);

  const activeColor =
    colorOptions.find((c) => c.key === colorKey) || colorOptions[0];
  const sizeVariants = activeColor?.variants || product?.variants || [];
  const selectedVariant: ProductVariant | undefined =
    sizeVariants.find((v) => v.sku === selectedSku) || sizeVariants[0];

  // Derived Properties
  const gallery = useMemo(() => {
    return product ? getGalleryMedia(product, selectedVariant) : [];
  }, [product, selectedVariant]);

  const price = selectedVariant?.price ?? product?.price;
  const mrp = selectedVariant?.mrp ?? product?.mrp;
  const discount = product?.discountPercent ?? getDiscountPercent(price, mrp);
  const stock = getStockState(selectedVariant?.stock);

  // Check if product is in user wishlist
  const isWishlisted = useMemo(() => {
    if (!product?._id || !wishlistQuery.data) return false;
    const items = wishlistQuery.data.items || [];
    const products = wishlistQuery.data.products || [];
    return (
      items.some(
        (item) => item.product?._id === product._id || item._id === product._id
      ) || products.some((p) => p._id === product._id)
    );
  }, [product?._id, wishlistQuery.data]);

  // Handlers
  const handleSelectColor = (key: string) => {
    setColorKey(key);
    const option = colorOptions.find((c) => c.key === key);
    if (option && option.variants.length > 0) {
      setSelectedSku(option.variants[0]?.sku || null);
      setHasSizeError(false);
    }
  };

  const handleSelectSku = (sku: string) => {
    setSelectedSku(sku);
    setHasSizeError(false);
  };

  const handleToggleWishlist = () => {
    if (!product?._id || toggleWishlist.isPending) return;
    toggleWishlist.mutate(product._id);
  };

  const handleShare = async () => {
    if (!product) return;
    await shareProduct({
      product,
      selectedVariant,
      colorCount: colorOptions.length,
      sizes: sizeVariants
        .map((v) => v.size)
        .filter((s): s is string => Boolean(s)),
    });
  };

  const handleScrollToReviews = useCallback(() => {
    if (reviewsLayoutY > 0) {
      scrollRef.current?.scrollTo({ y: reviewsLayoutY - 60, animated: true });
    }
  }, [reviewsLayoutY]);

  const handleAddToCart = () => {
    if (!product?._id) return;
    if (stock.key === "oos") return;

    if (sizeVariants.length > 1 && !selectedSku) {
      setHasSizeError(true);
      showToast("Please select a size first", "error");
      scrollRef.current?.scrollTo({ y: 350, animated: true });
      return;
    }

    const skuToAdd = selectedVariant?.sku || selectedSku;
    if (!skuToAdd) {
      showToast("Selected option is currently unavailable", "error");
      return;
    }

    addToCart.mutate({
      productId: product._id,
      variantSku: skuToAdd,
      quantity: 1,
    });
  };

  if (productQuery.isLoading) {
    return (
      <Container style={styles.center} edges={["top"]}>
        <ActivityIndicator color={colors.brandAmber} size="large" />
      </Container>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <Container style={styles.screen} edges={["top"]}>
        <ErrorState
          title="Product unavailable"
          description="This product could not be loaded or is no longer available."
          onRetry={() => productQuery.refetch()}
        />
      </Container>
    );
  }

  return (
    <Container style={styles.screen} edges={["top"]}>
      {/* Pinned Top Navigation Bar */}
      <ProductHeader
        isWishlisted={isWishlisted}
        onToggleWishlist={handleToggleWishlist}
        onShare={handleShare}
        cartCount={cartCount}
      />

      {/* Main Product Content */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Fashion Gallery */}
        <ProductGallery
          images={gallery}
          discountPercent={discount}
          isTrending={false}
        />

        {/* Pricing, Brand & Stock Section */}
        <ProductPriceBlock
          brand={product.brand || product.category?.name}
          title={product.title}
          price={price}
          mrp={mrp}
          discountPercent={discount}
          ratingAverage={
            typeof product.rating === "object"
              ? product.rating?.average
              : product.rating
          }
          reviewCount={
            typeof product.rating === "object"
              ? product.rating?.count
              : product.reviewCount
          }
          stockState={stock}
          onScrollToReviews={handleScrollToReviews}
        />

        {/* Color Swatches, Size Selector & Size Guide */}
        <ProductVariantsSelector
          colorOptions={colorOptions}
          activeColorKey={colorKey}
          onSelectColor={handleSelectColor}
          sizeVariants={sizeVariants}
          selectedSku={selectedSku || selectedVariant?.sku || null}
          onSelectSku={handleSelectSku}
          hasSizeError={hasSizeError}
        />

        {/* Exclusive Coupons & Offers */}
        <ProductOffers />

        {/* Delivery Options & Trust Badges */}
        <ProductServices />

        {/* Details, Specifications & Policy Accordion */}
        <ProductAccordion
          product={product}
          selectedVariant={selectedVariant}
        />

        {/* Customer Reviews Section */}
        <View
          onLayout={(e) => {
            setReviewsLayoutY(e.nativeEvent.layout.y);
          }}
        >
          <ProductReviewsSection product={product} />
        </View>

        {/* Curated Recommendations ("You May Also Like") */}
        <ProductRelated
          currentProductId={product._id}
          categorySlug={product.category?.slug}
        />

        {/* Bottom padding for sticky action bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Savana Sticky Action Bar */}
      <ProductBottomBar
        price={price}
        isWishlisted={isWishlisted}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        isAddingToCart={addToCart.isPending}
        isOutOfStock={stock.key === "oos"}
        cartCount={cartCount}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  bottomSpacer: {
    height: 90,
  },
});

import type { Product, ProductVariant } from "@/types/models";
import { getImageUrl, getProductImageUrls } from "@/utils/format";

export function getColorOptions(variants: ProductVariant[] = []) {
  const map = new Map<
    string,
    {
      key: string;
      color: string;
      colorHex: string;
      variants: ProductVariant[];
    }
  >();

  variants.forEach((variant) => {
    const key =
      (variant.colorHex || "").toLowerCase() ||
      (variant.color || "").toLowerCase() ||
      "default";

    if (!map.has(key)) {
      map.set(key, {
        key,
        color: variant.color || "Default",
        colorHex: variant.colorHex || "#d4d4d4",
        variants: [],
      });
    }
    map.get(key)?.variants.push(variant);
  });

  return Array.from(map.values());
}

export function getGalleryMedia(
  product: Product,
  selectedVariant?: ProductVariant | null
) {
  const fromVariant = (selectedVariant?.images || [])
    .map(getImageUrl)
    .filter((url): url is string => Boolean(url));
  if (fromVariant.length) return fromVariant;

  const fromProduct = getProductImageUrls(product);
  return fromProduct.length ? fromProduct : [];
}

export function getStockState(stock?: number) {
  const n = Number(stock) || 0;
  if (n <= 0) return { key: "oos" as const, label: "Out of Stock", urgency: null };
  if (n <= 5)
    return {
      key: "low" as const,
      label: "Low Stock",
      urgency: `Only ${n} left`,
    };
  return { key: "available" as const, label: "In Stock", urgency: null };
}

import { Platform, Share } from "react-native";
import { formatMoney, getDiscountPercent } from "@/utils/format";
import type { Product, ProductVariant } from "@/types/models";

/**
 * Returns the public web URL for a product.
 * Used for social sharing, rich link previews (WhatsApp, iMessage, etc.), and deep links.
 */
export function getProductShareUrl(slug: string): string {
  const base = (
    process.env.EXPO_PUBLIC_WEB_URL ||
    process.env.EXPO_PUBLIC_SITE_URL ||
    "https://nilescart.com"
  ).replace(/\/$/, "");

  return `${base}/product/${encodeURIComponent(slug)}`;
}

export type ProductShareOptions = {
  product: Product;
  selectedVariant?: ProductVariant | null;
  colorCount?: number;
  sizes?: string[];
};

export type ProductShareContent = {
  title: string;
  message: string;
  url: string;
};

/**
 * Cleans and truncates a product description for a clean social snippet.
 */
function cleanSnippet(text?: string, maxLen = 110): string | null {
  if (!text) return null;
  const clean = text
    .replace(/<[^>]*>/g, "") // strip HTML tags if any
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!clean) return null;
  return clean.length > maxLen ? `${clean.slice(0, maxLen - 1).trim()}…` : clean;
}

/**
 * Builds rich formatted product share content modeled after real-world e-commerce apps
 * (like Flipkart, Myntra, Amazon) with Markdown formatting for WhatsApp & Telegram.
 */
export function buildProductShareContent({
  product,
  selectedVariant,
  colorCount = 0,
  sizes = [],
}: ProductShareOptions): ProductShareContent {
  const productUrl = getProductShareUrl(product.slug);
  const brand = product.brand?.trim();
  const title = brand ? `${brand} — ${product.title}` : product.title;

  const price = selectedVariant?.price ?? product.price;
  const mrp = selectedVariant?.mrp ?? product.mrp;
  const discount = product.discountPercent ?? getDiscountPercent(price, mrp);

  // Rating & review info
  const ratingAvg =
    typeof product.rating === "object"
      ? Number(product.rating?.average) || 0
      : Number(product.rating) || 0;
  const ratingCount =
    typeof product.rating === "object"
      ? Number(product.rating?.count) || 0
      : Number(product.reviewCount) || 0;

  // Build lines
  const lines: string[] = [];

  // 1. Intro header
  lines.push("Hey! Check out this product on Nilescart ✨");
  lines.push("");

  // 2. Title with brand formatting (bold in WhatsApp using *...*)
  if (brand) {
    lines.push(`*${brand.toUpperCase()}*`);
  }
  lines.push(`*${product.title}*`);
  lines.push("");

  // 3. Price details with discount / savings
  if (price != null) {
    const formattedPrice = formatMoney(price);
    if (mrp && mrp > price && discount > 0) {
      const formattedMrp = formatMoney(mrp);
      // WhatsApp strikethrough is ~text~
      lines.push(
        `💰 *Special Price: ${formattedPrice}* (MRP: ~${formattedMrp}~ · *${discount}% OFF* 🔥)`
      );
    } else {
      lines.push(`💰 *Price: ${formattedPrice}*`);
    }
  }

  // 4. Rating line
  if (ratingAvg > 0) {
    const starText = ratingAvg.toFixed(1);
    const countText = ratingCount > 0 ? ` (${ratingCount} verified ratings)` : "";
    lines.push(`⭐ *${starText} / 5*${countText}`);
  }

  // 5. Options summary (Colors / Sizes)
  const optionBadges: string[] = [];
  if (colorCount > 1) {
    optionBadges.push(`🎨 ${colorCount} Colors`);
  }
  const cleanSizes = sizes.filter(Boolean);
  if (cleanSizes.length > 0) {
    const displayedSizes = cleanSizes.slice(0, 5).join(", ");
    const extra = cleanSizes.length > 5 ? ` +${cleanSizes.length - 5} more` : "";
    optionBadges.push(`📏 Sizes: ${displayedSizes}${extra}`);
  }
  if (optionBadges.length > 0) {
    lines.push(optionBadges.join("  |  "));
  }

  // 6. Short product highlight snippet
  const snippet = cleanSnippet(product.description);
  if (snippet) {
    lines.push("");
    lines.push(`"${snippet}"`);
  }

  // 7. Action link
  lines.push("");
  lines.push("👉 *Tap the link to view & order:*");
  lines.push(productUrl);
  lines.push("");
  lines.push("🛍️ Shop curated fashion & everyday styles on Nilescart!");

  const message = lines.join("\n");

  return {
    title,
    message,
    url: productUrl,
  };
}

/**
 * Triggers native system share dialog with rich product details.
 */
export async function shareProduct(options: ProductShareOptions) {
  const { title, message, url } = buildProductShareContent(options);

  try {
    const content =
      Platform.OS === "ios"
        ? {
            title,
            message,
            url, // iOS native share sheet renders rich preview thumbnail from url
          }
        : {
            title,
            message, // Android apps (WhatsApp, Telegram) read message containing the URL
          };

    return await Share.share(content, {
      dialogTitle: `Share ${options.product.title}`,
      subject: title,
    });
  } catch {
    // User dismissed or share sheet cancelled
    return null;
  }
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  UGX: "UGX ",
  NGN: "₦",
  KES: "KSh ",
  GHS: "GH₵",
  USD: "$",
  INR: "₹",
};

export function formatMoney(amount: number | undefined | null, currency = "UGX") {
  const code = currency?.toUpperCase?.() || "UGX";
  const symbol = CURRENCY_SYMBOLS[code] || `${code} `;
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return `${symbol}0`;
  }

  const zeroDecimal = new Set(["UGX", "RWF", "JPY", "KRW"]).has(code);

  const formatted = zeroDecimal
    ? Math.round(value).toLocaleString()
    : value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  return `${symbol}${formatted}`;
}

export function getImageUrl(
  image: unknown
): string | null {
  if (!image) return null;
  let raw: string | null = null;
  if (typeof image === "string") {
    const trimmed = image.trim();
    if (trimmed.length > 0) raw = trimmed;
  } else if (typeof image === "object" && image !== null) {
    const obj = image as Record<string, unknown>;
    const candidate =
      obj.url ||
      obj.src ||
      obj.uri ||
      obj.secure_url ||
      obj.path;
    if (typeof candidate === "string" && candidate.trim()) {
      raw = candidate.trim();
    }
  }
  if (!raw) return null;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) {
    const serverUrl = (
      process.env.EXPO_PUBLIC_API_URL ||
      "https://lightcollection-server.onrender.com/api"
    ).replace(/\/api\/?$/, "");
    return `${serverUrl}${raw}`;
  }
  return raw;
}

export function getProductImageUrls(product: {
  images?: Array<string | { url?: string | null }>;
}): string[] {
  return (product.images || [])
    .map((image) => getImageUrl(image))
    .filter((url): url is string => Boolean(url));
}

export function getOrderItemImage(item: unknown): string | null {
  if (!item || typeof item !== "object") return null;
  const it = item as Record<string, unknown>;

  // 1. Direct image property (used by backend for order item snapshots)
  const directImage = getImageUrl(it.image);
  if (directImage) return directImage;

  // 2. Direct imageUrl or uri
  const directUrl = getImageUrl(it.imageUrl || it.uri);
  if (directUrl) return directUrl;

  // 3. Direct images array (it.images[0])
  if (Array.isArray(it.images) && it.images.length > 0) {
    const fromImages = getImageUrl(it.images[0]);
    if (fromImages) return fromImages;
  }

  // 4. item.thumbnail
  const fromThumb = getImageUrl(it.thumbnail);
  if (fromThumb) return fromThumb;

  // 5. item.product (if populated)
  if (it.product && typeof it.product === "object") {
    const prod = it.product as Record<string, unknown>;

    const prodImage = getImageUrl(prod.image);
    if (prodImage) return prodImage;

    if (Array.isArray(prod.images) && prod.images.length > 0) {
      const fromProdImages = getImageUrl(prod.images[0]);
      if (fromProdImages) return fromProdImages;
    }

    const prodUrl = getImageUrl(prod.imageUrl || prod.thumbnail);
    if (prodUrl) return prodUrl;
  }

  // 6. item.variant (if populated)
  if (it.variant && typeof it.variant === "object") {
    const variant = it.variant as Record<string, unknown>;
    const variantImage = getImageUrl(variant.image);
    if (variantImage) return variantImage;

    if (Array.isArray(variant.images) && variant.images.length > 0) {
      const fromVarImages = getImageUrl(variant.images[0]);
      if (fromVarImages) return fromVarImages;
    }
  }

  return null;
}

export function getDiscountPercent(price?: number, mrp?: number) {
  const p = Number(price);
  const m = Number(mrp);
  if (!Number.isFinite(p) || !Number.isFinite(m) || m <= p || m <= 0) return 0;
  return Math.round(((m - p) / m) * 100);
}


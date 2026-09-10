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
  image: string | { url?: string | null } | null | undefined
): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  return image.url || null;
}

export function getProductImageUrls(product: {
  images?: Array<string | { url?: string | null }>;
}): string[] {
  return (product.images || [])
    .map((image) => getImageUrl(image))
    .filter((url): url is string => Boolean(url));
}

export function getDiscountPercent(price?: number, mrp?: number) {
  const p = Number(price);
  const m = Number(mrp);
  if (!Number.isFinite(p) || !Number.isFinite(m) || m <= p || m <= 0) return 0;
  return Math.round(((m - p) / m) * 100);
}

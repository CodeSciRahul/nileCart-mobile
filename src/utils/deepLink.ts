/**
 * Utility functions for parsing and handling NilesCart HTTPS Universal Links,
 * Android App Links, and custom URL schemes.
 */

export type ParsedDeepLink = {
  pathname: string;
  slug?: string;
  queryParams: Record<string, string>;
  isProduct: boolean;
};

/**
 * Normalizes and extracts pathname and parameters from an incoming deep link URL.
 * Supports:
 * - https://nilescart.com/product/12345
 * - https://www.nilescart.com/product/abc123
 * - nilescart://product/12345
 * - nilescart:///product/12345
 */
export function parseNilesCartUrl(rawUrl: string | null | undefined): ParsedDeepLink | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  try {
    let cleanUrl = rawUrl.trim();

    // Standardize custom scheme (nilescart://product/123 -> https://nilescart.com/product/123)
    if (cleanUrl.startsWith("nilescart://")) {
      const remainder = cleanUrl.replace(/^nilescart:\/\/?\/?/, "");
      cleanUrl = `https://nilescart.com/${remainder}`;
    }

    const url = new URL(cleanUrl);

    // Only handle nilescart.com domains or localhost/preview domains
    const host = url.hostname.toLowerCase();
    const isNilesCartDomain =
      host === "nilescart.com" ||
      host === "www.nilescart.com" ||
      host === "localhost" ||
      host.endsWith(".nilescart.com");

    if (!isNilesCartDomain && !rawUrl.startsWith("nilescart://")) {
      return null;
    }

    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    // Check for product route: /product/:slug
    const productMatch = pathname.match(/^\/product\/([^/]+)/);
    const slug = productMatch?.[1] ? decodeURIComponent(productMatch[1]) : undefined;

    return {
      pathname,
      slug,
      queryParams,
      isProduct: Boolean(slug),
    };
  } catch {
    return null;
  }
}

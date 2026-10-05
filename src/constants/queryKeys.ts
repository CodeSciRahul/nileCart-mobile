export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (params: Record<string, unknown>) =>
      ["products", "list", params] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
  },
  home: (device: string) => ["home", device] as const,
  banners: (device: string) => ["banners", device] as const,
  categories: {
    navigation: ["categories", "navigation"] as const,
    tree: ["categories", "tree"] as const,
    subcategories: ["categories", "subcategories"] as const,
    shop: (slug: string, params: Record<string, unknown>) =>
      ["categories", "shop", slug, params] as const,
  },
  reviews: {
    byProduct: (productId: string) => ["reviews", productId] as const,
    eligibility: (productId: string) => ["reviews", "eligibility", productId] as const,
  },
  cart: ["cart"] as const,
  wishlist: ["wishlist"] as const,
  addresses: ["addresses"] as const,
  profile: ["profile"] as const,
  orders: (params: Record<string, unknown> = {}) =>
    ["orders", params] as const,
  payment: {
    config: ["payment", "config"] as const,
  },
  coupons: {
    active: ["coupons", "active"] as const,
  },
} as const;

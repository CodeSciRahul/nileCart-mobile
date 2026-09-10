export const SITE = {
  name: "Nilescart",
  shortName: "Nilescart",
  tagline: "Fashion Store",
  description:
    "Shop fashion at Nilescart — dresses, tops, accessories and more.",
} as const;

export const TOKEN_STORAGE_KEY = "saavana_token";

export const OTP_LENGTH = 6;
export const OTP_RESEND_COOLDOWN_SEC = 45;

export const DEPARTMENT_ORDER = [
  "men",
  "women",
  "kids",
  "sports",
  "beauty",
  "home",
  "accessories",
] as const;

export const DEPARTMENT_LABELS: Record<string, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  sports: "Sports",
  beauty: "Beauty",
  home: "Home",
  accessories: "Accessories",
};

export const FREE_SHIPPING_FALLBACK = 999;

export type ProductImage = string | { url?: string | null };

export type ProductVariant = {
  sku: string;
  price?: number;
  mrp?: number;
  stock?: number;
  size?: string;
  color?: string;
  colorHex?: string;
  images?: ProductImage[];
};

export type CategoryRef = {
  _id?: string;
  slug?: string;
  name?: string;
};

export type Product = {
  _id: string;
  slug: string;
  title: string;
  brand?: string;
  description?: string;
  images?: ProductImage[];
  price?: number;
  mrp?: number;
  discountPercent?: number;
  variants?: ProductVariant[];
  category?: CategoryRef;
  rating?: number | { average?: number; count?: number };
  reviewCount?: number;
  isActive?: boolean;
};

export type ProductsResponse = {
  success?: boolean;
  products?: Product[];
  total?: number;
  page?: number;
  pages?: number;
};

export type ProductDetailResponse = {
  success?: boolean;
  product?: Product;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string | { url?: string };
  department?: string;
  children?: Category[];
  parent?: string | CategoryRef;
};

export type CategoriesResponse = {
  success?: boolean;
  categories?: Category[];
  departments?: Array<{
    department?: string;
    slug?: string;
    label?: string;
    categories?: Category[];
  }>;
};

export type Banner = {
  _id?: string;
  title?: string;
  description?: string;
  image?: string | { url?: string };
  mobileImage?: string | { url?: string };
  link?: string;
  href?: string;
  ctaHref?: string;
  ctaLink?: string;
  ctaText?: string;
};

export type HomeSection = {
  type?: string;
  data?: {
    banners?: Banner[];
    products?: Product[];
    title?: string;
  };
};

export type HomeResponse = {
  success?: boolean;
  announcement?: {
    _id?: string;
    message?: string;
    dismissible?: boolean;
  } | null;
  sections?: HomeSection[];
  popup?: unknown;
};

export type User = {
  _id: string;
  email?: string;
  name?: string;
  fullName?: string;
  mobileNumber?: string;
  gender?: string;
  birthday?: string;
  avatar?: string | { url?: string; key?: string } | null;
  role?: string;
};

export type AuthResponse = {
  success?: boolean;
  token?: string;
  user?: User;
  isNewUser?: boolean;
  message?: string;
};

export type CartItem = {
  _id: string;
  product?: Product;
  variantSku: string;
  quantity: number;
  variant?: ProductVariant;
  lineTotal?: number;
};

export type CartDocument = {
  _id?: string;
  items?: CartItem[];
  coupon?: string | null;
};

export type CartResponse = {
  success?: boolean;
  cart?: CartDocument;
  items?: CartItem[];
  itemCount?: number;
  subtotal?: number;
  discount?: number;
  shippingFee?: number;
  total?: number;
  freeShippingThreshold?: number;
  coupon?: {
    code?: string;
    description?: string;
    discountType?: string;
    value?: number;
    isActive?: boolean;
  } | null;
};

export type WishlistResponse = {
  success?: boolean;
  items?: Array<{ product?: Product; _id?: string }>;
  products?: Product[];
  count?: number;
};

export type Address = {
  _id: string;
  fullName: string;
  mobileNumber: string;
  pincode: string;
  addressLine: string;
  locality?: string;
  city: string;
  state: string;
  country: string;
  addressType: "Home" | "Work" | "Other";
  isDefault?: boolean;
};

export type AddressesResponse = {
  success?: boolean;
  addresses?: Address[];
};

export type Order = {
  _id: string;
  orderNumber?: string;
  /** @deprecated prefer orderStatus */
  status?: string;
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  total?: number;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  items?: Array<{
    title?: string;
    quantity?: number;
    price?: number;
    variantSku?: string;
    product?: {
      _id?: string;
      title?: string;
      slug?: string;
      images?: Array<string | { url?: string | null }>;
    };
  }>;
  shippingAddress?: {
    fullName?: string;
    mobileNumber?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
};

export type OrdersResponse = {
  success?: boolean;
  orders?: Order[];
};

export type OrderResponse = {
  success?: boolean;
  order?: Order;
};

export type PaymentConfig = {
  success?: boolean;
  currency?: string;
  onlinePaymentsEnabled?: boolean;
  publicKey?: string;
};

export type ApiErrorShape = {
  message: string;
  status?: number;
  data?: unknown;
};

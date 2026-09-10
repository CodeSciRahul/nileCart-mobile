# Nilescart Mobile — Phase 1 Audit & Implementation Plan

**Source of truth:** `nileCart-next-web` + `nileCart-server`  
**Brand:** Nilescart (fashion e-commerce; tagline “Fashion Store”)  
**Date:** 2026-09-11

---

## 1. Architecture

| Layer | Stack |
|-------|--------|
| Web | Next.js 16 (App Router), React 19, TanStack Query, Axios, RHF + Zod, Tailwind 4, Lucide |
| API | Express (`nileCart-server`), mounted at `/api`, MongoDB/Mongoose |
| Auth | Passwordless email OTP → JWT (`Bearer` + cookie) |
| Payments | COD + Flutterwave online checkout |

Web client calls `NEXT_PUBLIC_API_URL` (default `/api`, rewritten to `API_URL`).  
Mobile must call the API **directly**: `http://<host>:5000/api` (no Next rewrite).

---

## 2. Auth & session

- `POST /auth/send-otp` `{ email }`
- `POST /auth/verify-otp` `{ email, otp }` → `{ token, user }`
- `GET /users/me` (Bearer) → `{ user }`
- `PUT /users/me`, `DELETE /users/me`
- `POST /auth/logout`

Web stores JWT in `localStorage` key **`saavana_token`**.  
Mobile: **Expo SecureStore** with the same logical session; Authorization header on every request.

OTP length: 6. Resend cooldown: 45s. No password auth for customers.

Auth-gated actions (web): add to cart, wishlist, checkout, addresses — resume after login via auth intent.

---

## 3. API surface (web services → endpoints)

| Domain | Endpoints |
|--------|-----------|
| Home | `GET /home?device=mobile\|desktop`, `GET /banners?device=` |
| Categories | `GET /categories?tree=true`, `?navigation=true&navOnly=true`, `?subcategoriesOnly=true&navOnly=true`, `GET /categories/:slug/shop` |
| Products | `GET /products`, `GET /products/search`, `GET /products/:slug` |
| Cart | `GET /cart`, `POST /cart/items` `{ productId, variantSku, quantity }`, `PUT/DELETE /cart/items/:id`, coupon `POST/DELETE /cart/coupon` |
| Wishlist | `GET /wishlist`, `POST /wishlist/toggle` `{ productId }` |
| Addresses | `GET/POST /addresses` (schema: fullName, mobileNumber 10 digits, pincode 6, addressLine, locality?, city, state, country default Uganda, addressType Home\|Work\|Other, isDefault) |
| Orders | `POST /orders` `{ addressId, paymentMethod }`, `GET /orders` |
| Payments | `GET /payments/config`, `POST /payments/checkout` `{ addressId }` → `checkoutUrl`, `GET /payments/verify`, `POST /payments/retry/:orderId` |
| Coupons | `POST /coupons/validate`, `GET /coupons/active` |
| Reviews | `GET /reviews/product/:productId` |
| Uploads | `POST /uploads/presign`, S3 PUT |

Response envelope: typically `{ success, ... }`. Axios client unwraps `response.data`. Prices/totals are **server-authoritative**.

**Currency:** primarily `UGX` (zero-decimal); format via payment config. Product cards on web also show `₹` in places — mobile should prefer `formatMoney(amount, currency)` from payment/cart config.

---

## 4. Domain models (from web usage)

- **Product:** `_id`, `slug`, `title`, `brand`, `images[]` (url string or `{url}`), `price`/`mrp`/`discountPercent`, `variants[]` (`sku`, `price`, `mrp`, `stock`, `size`, `color`, `colorHex`, `images`), `category` (`_id`, `slug`, `name`)
- **Cart:** `cart.items[]` (`_id`, `product`, `variantSku`, `quantity`), `itemCount`, `subtotal`, `total`, applied coupon fields
- **User:** profile fields used on account (name, email, mobile, avatar, etc.)
- **Order:** `_id`, `orderNumber`, status, items, totals
- **Address:** as address schema above

Departments: men, women, kids, sports, beauty, home, accessories.

---

## 5. Design system (web tokens)

| Token | Value |
|-------|--------|
| Brand amber / primary | `#FFBF00` |
| Cream / secondary | `#FFF5D1` |
| Gray / muted fg | `#777777` |
| Foreground | `#1A1A1A` |
| Background / white | `#FFFFFF` |
| Border / input | `#E8E0C8` |
| Destructive | `#DC2626` |
| Product card bg | `#FFECB3` |
| Radius base | `0.625rem` (~10px) |
| Font | Roboto 400/500/700 |
| Icons | Lucide |
| Theme color | `#FFBF00` |

Brand assets: `/brand/nilescart_*.png|webp|svg` (full + icon, light/dark).

---

## 6. Navigation (web → mobile tabs)

Web: Home, Shop by category, Search, Wishlist, Bag (checkout/bag), Account, Auth, Checkout stack, PDP `/product/[slug]`, Shop `/shop/[slug]`, Store `/store/[slug]`.

**Mobile tabs:** Home | Categories | Wishlist | Bag | Account  
Stacks: product detail, search, shop/listing, auth modal/screen, checkout, orders, addresses, profile.

---

## 7. Env (mobile)

```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
# Optional — must match server MOBILE_PAYMENT_REDIRECT_URL for AuthSession auto-return:
# EXPO_PUBLIC_PAYMENT_REDIRECT_URL=nilescart://checkout/payment/callback
```

Server (for native Flutterwave redirect):

```
MOBILE_PAYMENT_REDIRECT_URL=nilescart://checkout/payment/callback
```

Use LAN IP for physical devices. No secrets on client. Do not commit production keys.

---

## 8. Implementation plan

1. Expo + TS + Expo Router scaffold; `src/` feature architecture  
2. Theme tokens + shared UI (Button, Input, Empty/Error/Skeleton, ProductCard, Price)  
3. API client (Axios/fetch) + SecureStore token + TanStack Query + Zustand  
4. Tabs + auth (OTP)  
5. Home (banners, categories, products)  
6. Categories / shop listing / search  
7. PDP (variants, gallery, add to bag, wishlist)  
8. Wishlist + Cart  
9. Addresses → Checkout (COD first) → success  
10. Orders + profile; Flutterwave WebBrowser for online pay  
11. QC: tsc, lint, duplicate-submit guards, FlatList, image cache

---

## 9. Gaps / blockers noted

- `API.md` on server is outdated (Firebase login vs current OTP; cart `variantId` vs `variantSku`). Prefer web services as contract.
- Flutterwave often prefers HTTPS redirect URLs; custom scheme works when `MOBILE_PAYMENT_REDIRECT_URL` is set. Otherwise mobile verifies via `txRef` after the browser closes (webhook may already confirm payment).
- Web `.env` has `API_URL=http://localhost:5000` (rewrite strips `/api` path onto host); mobile must include `/api` in base URL.
- Backend must be running for real data; online pay needs Flutterwave keys configured.
- Physical devices: `localhost` will not reach the host machine — set `EXPO_PUBLIC_API_URL` to LAN IP.

## 10. Session deliverable status

**Done:** Expo Router scaffold, theme, SecureStore OTP auth, tabs, home/categories/shop/search/PDP, wishlist, cart, COD + **online Flutterwave** checkout (WebBrowser + verify + deep-link callback), **coupons** apply/remove/validate, **order detail + cancel + retry pay**, **reviews** read/write on PDP, **FlashList** grids/lists, **profile edit**, address default/delete, duplicate-submit guards, `tsc --noEmit` clean.

**Still remaining:** Avatar upload (S3 presign), push notifications, order pagination, fuller coupon “active list” browse, production E2E on device with live Flutterwave.

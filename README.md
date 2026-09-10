# Nilescart Mobile

Native React Native (Expo) client for Nilescart. Consumes the same API as `nileCart-next-web`.

## Prerequisites

- Node 20+
- Expo Go or a dev build
- Backend running: `nileCart-server` on port 5000 (`/api`)
- For online pay: Flutterwave keys on the server + optional mobile redirect env (below)

## Setup

```bash
cd nileCart-mobile
cp .env.example .env
# EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api   # LAN IP for devices
# EXPO_PUBLIC_PAYMENT_REDIRECT_URL=nilescart://checkout/payment/callback
npm install --legacy-peer-deps
npm start
```

### Online payment deep linking

1. App scheme: `nilescart` (`app.json`).
2. Callback route: `/checkout/payment/callback` (handles `tx_ref` / `transaction_id` / `status`).
3. Checkout calls `POST /payments/checkout` with `{ addressId, platform: "mobile" }`.
4. Server uses `MOBILE_PAYMENT_REDIRECT_URL` when `platform=mobile` (else storefront web callback).
5. Mobile opens Flutterwave via `WebBrowser.openAuthSessionAsync`, then **always** verifies with `GET /payments/verify` (never trusts client totals or redirect alone).

On the server `.env`:

```
MOBILE_PAYMENT_REDIRECT_URL=nilescart://checkout/payment/callback
```

Match that value in mobile `EXPO_PUBLIC_PAYMENT_REDIRECT_URL` when you want AuthSession to auto-close on redirect.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run android` / `ios` | Open platform |
| `npm run typecheck` | TypeScript check |

## Architecture

See `AUDIT.md` for web/API audit findings.

- `app/` — Expo Router screens
- `src/features/` — feature screens
- `src/services/` — API modules (mirrors web)
- `src/theme/` — design tokens from web
- `src/store/` — Zustand (auth/UI)

## Implemented

Auth (OTP), Home, Categories, Shop, Search, PDP (+ reviews), Wishlist, Cart, Checkout (COD + Flutterwave + coupons), Order success, Orders list/detail/cancel/retry, Profile edit, Addresses (default/delete), FlashList product/order/address lists.

## Remaining

Avatar upload (S3 presign), push notifications, richer coupon catalogue UI, production device E2E with live Flutterwave.

import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  initializeCheckout,
  retryCheckout,
  verifyPayment,
  type CheckoutInitResponse,
  type PaymentVerifyResponse,
} from "@/services/checkoutService";

WebBrowser.maybeCompleteAuthSession();

export function getMobilePaymentRedirectUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_PAYMENT_REDIRECT_URL?.trim();
  if (fromEnv) return fromEnv;
  return Linking.createURL("/checkout/payment/callback");
}

function parseCallbackUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = Linking.parse(url);
    const q = parsed.queryParams || {};
    const txRef = String(q.tx_ref || q.txRef || "");
    if (!txRef) return null;
    return {
      txRef,
      transactionId: q.transaction_id
        ? String(q.transaction_id)
        : q.transactionId
          ? String(q.transactionId)
          : null,
      status: q.status ? String(q.status) : null,
    };
  } catch {
    return null;
  }
}

/**
 * Opens Flutterwave hosted checkout, then verifies on the server.
 * Never trusts browser redirect alone — always calls GET /payments/verify.
 */
export async function startOnlinePayment(addressId: string): Promise<{
  init: CheckoutInitResponse;
  verify: PaymentVerifyResponse | null;
  dismissedWithoutCallback: boolean;
}> {
  const init = await initializeCheckout({
    addressId,
    platform: "mobile",
  });

  if (!init.checkoutUrl || !init.txRef) {
    throw new Error("Could not start online payment. Please try again.");
  }

  const redirectUrl = getMobilePaymentRedirectUrl();
  const result = await WebBrowser.openAuthSessionAsync(
    init.checkoutUrl,
    redirectUrl
  );

  const fromRedirect =
    result.type === "success" ? parseCallbackUrl(result.url) : null;

  const txRef = fromRedirect?.txRef || init.txRef;

  // Browser closed without a redirect URL — poll server status (do NOT force-cancel).
  // A successful payment may already be confirmed via webhook.
  if (!fromRedirect) {
    try {
      const verify = await verifyPayment({ txRef });
      return {
        init,
        verify,
        dismissedWithoutCallback: result.type !== "success",
      };
    } catch {
      return {
        init,
        verify: null,
        dismissedWithoutCallback: true,
      };
    }
  }

  const verify = await verifyPayment({
    txRef,
    transactionId: fromRedirect.transactionId,
    status: fromRedirect.status,
  });

  return {
    init,
    verify,
    dismissedWithoutCallback: false,
  };
}

export async function retryOnlinePayment(orderId: string) {
  const init = await retryCheckout(orderId, "mobile");
  if (!init.checkoutUrl || !init.txRef) {
    throw new Error("Could not retry payment.");
  }

  const redirectUrl = getMobilePaymentRedirectUrl();
  const result = await WebBrowser.openAuthSessionAsync(
    init.checkoutUrl,
    redirectUrl
  );
  const fromRedirect =
    result.type === "success" ? parseCallbackUrl(result.url) : null;
  const txRef = fromRedirect?.txRef || init.txRef;

  if (result.type === "cancel" && !fromRedirect) {
    return { init, verify: null as PaymentVerifyResponse | null };
  }

  const verify = await verifyPayment({
    txRef,
    transactionId: fromRedirect?.transactionId,
    status: fromRedirect?.status,
  });

  return { init, verify };
}

export { parseCallbackUrl, verifyPayment };

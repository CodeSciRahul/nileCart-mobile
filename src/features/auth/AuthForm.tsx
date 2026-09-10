import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Mail } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCountdown } from "@/hooks/useCountdown";
import { sendOtp, verifyOtp } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SEC } from "@/constants";
import { colors, spacing, typography } from "@/theme";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

type Props = {
  onSuccess?: () => void;
};

export function AuthForm({ onSuccess }: Props) {
  const setSession = useAuthStore((s) => s.setSession);
  const showToast = useUiStore((s) => s.showToast);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { seconds, isActive, start } = useCountdown(0);

  useEffect(() => {
    setError("");
  }, [step]);

  const handleSendOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await sendOtp(trimmed);
      setEmail(trimmed);
      setOtp("");
      setStep("otp");
      start(OTP_RESEND_COOLDOWN_SEC);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await verifyOtp({ email, otp });
      await setSession(data);
      showToast("Signed in successfully", "success");
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isActive || loading) return;
    setLoading(true);
    setError("");
    try {
      await sendOtp(email);
      setOtp("");
      start(OTP_RESEND_COOLDOWN_SEC);
      showToast("Code resent", "success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to resend verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.wrap}
    >
      <Text style={styles.heading}>
        {step === "email" ? "Sign in" : "Enter code"}
      </Text>
      <Text style={styles.sub}>
        {step === "email"
          ? "We'll send a one-time code — no password needed."
          : `Sent to ${email}`}
      </Text>

      {error ? (
        <View style={styles.errorBox} accessibilityRole="alert">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {step === "email" ? (
        <View style={styles.form}>
          <Input
            label="Email address"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(value) => {
              setError("");
              setEmail(value);
            }}
            editable={!loading}
            leftSlot={<Mail size={18} color={colors.brandGray} />}
          />
          <Button title="Continue" loading={loading} onPress={handleSendOtp} />
        </View>
      ) : (
        <View style={styles.form}>
          <Pressable disabled={loading} onPress={() => setStep("email")}>
            <Text style={styles.changeEmail}>Change email</Text>
          </Pressable>
          <Input
            label="Verification code"
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            placeholder="6-digit code"
            value={otp}
            onChangeText={(value) => {
              setError("");
              setOtp(value.replace(/\D/g, "").slice(0, OTP_LENGTH));
            }}
            editable={!loading}
          />
          <Button
            title="Verify & sign in"
            loading={loading}
            onPress={handleVerifyOtp}
          />
          <Pressable disabled={isActive || loading} onPress={handleResend}>
            <Text style={[styles.resend, isActive && styles.resendDisabled]}>
              {isActive ? `Resend in ${seconds}s` : "Resend code"}
            </Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  heading: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size["2xl"],
    color: colors.foreground,
  },
  sub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
  },
  errorText: {
    color: colors.destructive,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
  },
  changeEmail: {
    fontFamily: typography.fontFamily.medium,
    color: colors.brandGray,
    fontSize: typography.size.sm,
  },
  resend: {
    textAlign: "center",
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    fontSize: typography.size.sm,
  },
  resendDisabled: {
    color: colors.brandGray,
  },
});

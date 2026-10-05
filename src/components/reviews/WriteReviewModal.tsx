import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Package, Star, X } from "lucide-react-native";
import { queryKeys } from "@/constants/queryKeys";
import { createReview, updateReview, type Review } from "@/services/reviewService";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { colors, radius, shadows, spacing, typography } from "@/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productTitle?: string;
  productImage?: string | null;
  orderId?: string;
  existingReview?: {
    _id: string;
    rating: number;
    title?: string;
    comment?: string;
  } | null;
  onSuccess?: () => void;
};

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "Poor — Needs significant improvement",
  2: "Fair — Below expectations",
  3: "Good — Satisfactory purchase",
  4: "Very Good — Highly recommended",
  5: "Excellent — Exceeded expectations!",
};

export function WriteReviewModal({
  visible,
  onClose,
  productId,
  productTitle = "Product",
  productImage,
  orderId,
  existingReview,
  onSuccess,
}: Props) {
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const isEditing = Boolean(existingReview?._id);

  // Sync inputs with existingReview whenever modal opens or changes
  useEffect(() => {
    if (visible) {
      if (existingReview) {
        setRating(Number(existingReview.rating) || 5);
        setTitle(existingReview.title || "");
        setComment(existingReview.comment || "");
      } else {
        setRating(5);
        setTitle("");
        setComment("");
      }
    }
  }, [visible, existingReview]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      };

      if (isEditing && existingReview?._id) {
        return updateReview(existingReview._id, payload);
      }
      return createReview({
        productId,
        ...payload,
        orderId,
      });
    },
    onSuccess: async () => {
      showToast(
        isEditing
          ? "Review updated successfully!"
          : "Thank you! Your review has been submitted.",
        "success"
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.byProduct(productId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.eligibility(productId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders(),
        }),
      ]);
      onSuccess?.();
      onClose();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to submit review.";
      showToast(message, "error");
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityLabel="Close review modal"
          accessibilityRole="button"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.sheet}>
            {/* Drag handle */}
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerEyebrow}>
                  {isEditing ? "EDIT REVIEW" : "CUSTOMER REVIEW"}
                </Text>
                <Text style={styles.headerTitle}>
                  {isEditing ? "Update your feedback" : "Rate & Review"}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={18} color={colors.brandInk} strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Product preview card */}
              <View style={styles.productCard}>
                <View style={styles.thumbWrap}>
                  {productImage ? (
                    <Image
                      source={{ uri: productImage }}
                      style={styles.thumb}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : (
                    <View style={[styles.thumb, styles.thumbFallback]}>
                      <Package size={20} color={colors.brandStone} strokeWidth={1.5} />
                    </View>
                  )}
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {productTitle}
                  </Text>
                  <View style={styles.verifiedRow}>
                    <CheckCircle2 size={13} color="#15803D" strokeWidth={2.2} />
                    <Text style={styles.verifiedText}>
                      Verified purchase from delivered order
                    </Text>
                  </View>
                </View>
              </View>

              {/* Star Rating Section */}
              <View style={styles.ratingSection}>
                <Text style={styles.fieldLabel}>Overall Rating</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= rating;
                    return (
                      <Pressable
                        key={star}
                        hitSlop={8}
                        onPress={() => setRating(star)}
                        style={({ pressed }) => [
                          styles.starPressable,
                          pressed && { transform: [{ scale: 1.15 }] },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`${star} of 5 stars`}
                      >
                        <Star
                          size={36}
                          color={active ? colors.brandAmber : colors.borderSoft}
                          fill={active ? colors.brandAmber : "transparent"}
                          strokeWidth={1.75}
                        />
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.ratingDescription}>
                  {RATING_DESCRIPTIONS[rating] || `${rating} Stars`}
                </Text>
              </View>

              {/* Title Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Review Headline</Text>
                  <Text style={styles.optionalTag}>Optional</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Perfect fit, luxurious fabric feel"
                  placeholderTextColor={colors.brandStone}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
              </View>

              {/* Comment Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Your Experience</Text>
                  <Text style={styles.counterText}>{comment.length}/1000</Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="What did you love about this item? How was the fit, material quality, and comfort?"
                  placeholderTextColor={colors.brandStone}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={1000}
                />
              </View>

              {/* Verified Note */}
              <View style={styles.trustBanner}>
                <CheckCircle2 size={15} color="#15803D" strokeWidth={2} />
                <Text style={styles.trustText}>
                  Your review will be marked with a{" "}
                  <Text style={styles.trustBold}>Verified Buyer</Text> badge to help other shoppers.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <Button
                  title={isEditing ? "Update Review" : "Submit Review"}
                  loading={mutation.isPending}
                  disabled={mutation.isPending || rating === 0}
                  onPress={() => mutation.mutate()}
                />
                <Button
                  title="Cancel"
                  variant="secondary"
                  disabled={mutation.isPending}
                  onPress={onClose}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(22, 20, 17, 0.55)",
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  keyboardContainer: {
    width: "100%",
    maxHeight: "92%",
  },
  sheet: {
    backgroundColor: colors.brandWhite,
    borderTopLeftRadius: radius["2xl"],
    borderTopRightRadius: radius["2xl"],
    paddingBottom: spacing["2xl"],
    maxHeight: "100%",
    ...shadows.md,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderSoft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
  },
  headerEyebrow: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.brandAmber,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.brandInk,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.brandCream,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brandCream,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(230, 168, 0, 0.15)",
  },
  thumbWrap: {
    width: 58,
    height: 72,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.brandWhite,
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  thumbFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandCream,
  },
  productDetails: {
    flex: 1,
    gap: 4,
  },
  productTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: colors.brandInk,
    lineHeight: 18,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  verifiedText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: "#15803D",
  },
  ratingSection: {
    alignItems: "center",
    backgroundColor: colors.brandWhite,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.sm,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: spacing.xs,
  },
  starPressable: {
    padding: 4,
  },
  ratingDescription: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.brandAmber,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.brandInk,
  },
  optionalTag: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.brandStone,
  },
  counterText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.brandStone,
  },
  textInput: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.brandInk,
    backgroundColor: colors.brandWhite,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  trustBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  trustText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: "#15803D",
    lineHeight: 16,
  },
  trustBold: {
    fontFamily: typography.fontFamily.semibold,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});

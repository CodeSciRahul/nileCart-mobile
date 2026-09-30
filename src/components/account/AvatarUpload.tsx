import { useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, Trash2, User } from "lucide-react-native";
import { uploadProfileImage, deleteUploadedImage } from "@/services/uploadService";
import { updateUserProfile } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { getImageUrl } from "@/utils/format";
import { colors, radius, spacing, typography } from "@/theme";

type Props = {
  displayName?: string;
  size?: number;
  showDetails?: boolean;
};

export function AvatarUpload({
  displayName,
  size = 88,
  showDetails = true,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const showToast = useUiStore((s) => s.showToast);

  const [isUploading, setIsUploading] = useState(false);

  const avatarUri = getImageUrl(user?.avatar);
  const avatarKey =
    user?.avatar && typeof user.avatar === "object"
      ? user.avatar.key
      : undefined;

  const resolvedName =
    displayName ||
    user?.name ||
    user?.fullName ||
    user?.email?.split("@")[0] ||
    "User";

  const initial = resolvedName.charAt(0).toUpperCase();

  const handlePickFromGallery = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access your gallery is required to choose a profile photo."
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) {
        return;
      }

      const asset = pickerResult.assets[0];
      await performUpload(asset.uri, asset.fileName || undefined, asset.mimeType || undefined);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not select photo from gallery.";
      showToast(message, "error");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access your camera is required to take a profile photo."
        );
        return;
      }

      const pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) {
        return;
      }

      const asset = pickerResult.assets[0];
      await performUpload(asset.uri, asset.fileName || undefined, asset.mimeType || undefined);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not take photo.";
      showToast(message, "error");
    }
  };

  const performUpload = async (
    uri: string,
    fileName?: string,
    mimeType?: string
  ) => {
    setIsUploading(true);
    try {
      const result = await uploadProfileImage(uri, fileName, mimeType);

      const updateRes = await updateUserProfile({
        avatar: { url: result.fileUrl, key: result.key },
      });

      if (updateRes.user) {
        await setSession({ user: updateRes.user });
      } else {
        await refreshProfile();
      }

      showToast("Profile photo updated!", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload photo.";
      showToast(message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove your profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsUploading(true);
            try {
              if (avatarKey) {
                deleteUploadedImage(avatarKey).catch(() => undefined);
              }

              const updateRes = await updateUserProfile({
                avatar: undefined,
              });

              if (updateRes.user) {
                await setSession({ user: updateRes.user });
              } else {
                await refreshProfile();
              }

              showToast("Profile photo removed", "success");
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Could not remove photo.";
              showToast(message, "error");
            } finally {
              setIsUploading(false);
            }
          },
        },
      ]
    );
  };

  const showPhotoOptions = () => {
    if (isUploading) return;

    if (Platform.OS === "ios") {
      const options = ["Choose from Gallery", "Take Photo"];
      if (avatarUri) options.push("Remove Photo");
      options.push("Cancel");

      const cancelButtonIndex = options.length - 1;
      const destructiveButtonIndex = avatarUri ? options.indexOf("Remove Photo") : undefined;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
          title: "Profile Photo",
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            handlePickFromGallery();
          } else if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (avatarUri && buttonIndex === 2) {
            handleRemovePhoto();
          }
        }
      );
    } else {
      // Android
      const buttons: Array<{ text: string; onPress?: () => void; style?: "cancel" | "destructive" }> = [
        { text: "Choose from Gallery", onPress: handlePickFromGallery },
        { text: "Take Photo", onPress: handleTakePhoto },
      ];
      if (avatarUri) {
        buttons.push({
          text: "Remove Photo",
          style: "destructive",
          onPress: handleRemovePhoto,
        });
      }
      buttons.push({ text: "Cancel", style: "cancel" });

      Alert.alert("Profile Photo", "Select an option", buttons);
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar Container */}
      <View style={[styles.avatarWrap, { width: size, height: size, borderRadius: size / 2 }]}>
        <Pressable
          accessibilityLabel="Change profile photo"
          accessibilityRole="button"
          disabled={isUploading}
          onPress={showPhotoOptions}
          style={styles.avatarPressable}
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.initialsFallback}>
              <Text style={[styles.initialText, { fontSize: size * 0.4 }]}>
                {initial}
              </Text>
            </View>
          )}

          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.primaryForeground} size="small" />
            </View>
          )}
        </Pressable>

        {/* Camera Badge Icon */}
        <Pressable
          accessibilityLabel="Take or choose photo"
          accessibilityRole="button"
          disabled={isUploading}
          onPress={showPhotoOptions}
          style={styles.cameraBadge}
        >
          <Camera size={13} color={colors.primaryForeground} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* Details & Actions */}
      {showDetails ? (
        <View style={styles.details}>
          <Text style={styles.title}>Profile photo</Text>
          <Text style={styles.subtitle}>
            JPG, PNG or WEBP. Pick a square photo from your mobile gallery.
          </Text>

          <View style={styles.btnRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Upload photo"
              disabled={isUploading}
              onPress={showPhotoOptions}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <User size={13} color={colors.foreground} strokeWidth={2} />
              <Text style={styles.actionBtnText}>
                {avatarUri ? "Change photo" : "Upload photo"}
              </Text>
            </Pressable>

            {avatarUri ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                disabled={isUploading}
                onPress={handleRemovePhoto}
                style={({ pressed }) => [
                  styles.removeBtn,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Trash2 size={13} color={colors.destructive} strokeWidth={2} />
                <Text style={styles.removeBtnText}>Remove</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarWrap: {
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(255, 191, 0, 0.4)",
    backgroundColor: colors.brandCream,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarPressable: {
    width: "100%",
    height: "100%",
    borderRadius: radius.full,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  initialsFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandCream,
  },
  initialText: {
    fontFamily: typography.fontFamily.bold,
    color: "#B45309",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(26, 26, 26, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandAmber,
    borderWidth: 2,
    borderColor: colors.brandWhite,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.brandGray,
    lineHeight: 15,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.4)",
    backgroundColor: colors.brandWhite,
  },
  actionBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: colors.foreground,
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.3)",
    backgroundColor: "rgba(220, 38, 38, 0.04)",
  },
  removeBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: colors.destructive,
  },
});

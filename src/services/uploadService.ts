import { apiClient } from "@/api/client";

export const UPLOAD_FOLDERS = {
  PROFILES: "profiles",
  PRODUCTS: "products",
  REVIEWS: "reviews",
} as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export type PresignedResponse = {
  success?: boolean;
  uploadUrl: string;
  fileUrl: string;
  key: string;
};

export const requestPresignedUploadUrl = async ({
  fileName,
  contentType,
  folder = UPLOAD_FOLDERS.PROFILES,
}: {
  fileName: string;
  contentType: string;
  folder?: string;
}): Promise<PresignedResponse> => {
  return apiClient.post("/uploads/presign", {
    fileName,
    contentType,
    folder,
  });
};

export const putFileToS3 = async ({
  uploadUrl,
  uri,
  contentType,
}: {
  uploadUrl: string;
  uri: string;
  contentType: string;
}) => {
  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      errorText || `Failed to upload image to storage (${response.status}).`
    );
  }
};

export const deleteUploadedImage = (key: string) =>
  apiClient.delete("/uploads/delete", { data: { key } });

export const uploadProfileImage = async (
  uri: string,
  fileName?: string,
  mimeType?: string
): Promise<{ fileUrl: string; key: string }> => {
  const derivedName =
    fileName || uri.split("/").pop() || `avatar_${Date.now()}.jpg`;
  const ext = derivedName.split(".").pop()?.toLowerCase();

  const contentType =
    mimeType ||
    (ext === "png"
      ? "image/png"
      : ext === "webp"
      ? "image/webp"
      : "image/jpeg");

  const presign = await requestPresignedUploadUrl({
    fileName: derivedName,
    contentType,
    folder: UPLOAD_FOLDERS.PROFILES,
  });

  if (!presign.uploadUrl) {
    throw new Error("Could not obtain secure upload URL.");
  }
  await putFileToS3({
    uploadUrl: presign.uploadUrl,
    uri,
    contentType,
  });

  return {
    fileUrl: presign.fileUrl,
    key: presign.key,
  };
};

import { v2 as cloudinary } from "cloudinary";

import { isCloudinaryImageUrl } from "@/lib/images";

let configured = false;

export function configureCloudinary() {
  if (configured) {
    return cloudinary;
  }

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });

  configured = true;
  return cloudinary;
}

function extractPublicIdFromSecureUrl(secureUrl: string) {
  const uploadMarker = "/upload/";
  const uploadIndex = secureUrl.indexOf(uploadMarker);

  if (uploadIndex === -1) {
    return null;
  }

  const segments = secureUrl.slice(uploadIndex + uploadMarker.length).split("/");
  const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
  const pathSegments =
    versionIndex === -1 ? segments : segments.slice(versionIndex + 1);

  if (pathSegments.length === 0) {
    return null;
  }

  return pathSegments.join("/").replace(/\.[a-z0-9]+$/i, "");
}

export async function deleteCloudinaryAssetByUrl(
  url: string | null | undefined
) {
  if (!url || !isCloudinaryImageUrl(url)) {
    return;
  }

  const publicId = extractPublicIdFromSecureUrl(url);

  if (!publicId) {
    console.warn("[cloudinary] Could not extract public ID from URL:", url);
    return;
  }

  try {
    const client = configureCloudinary();
    await client.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (error) {
    console.error("[cloudinary] Failed to delete asset:", publicId, error);
  }
}

export async function deleteCloudinaryAssetsByUrl(
  urls: Array<string | null | undefined>
) {
  await Promise.all(urls.map((url) => deleteCloudinaryAssetByUrl(url)));
}

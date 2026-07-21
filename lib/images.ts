export function resolveCardImageUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/api/uploads/cards/")) {
    return url;
  }

  const legacyMatch = url.match(/^\/uploads\/cards\/([^/]+)\/(.+)$/);

  if (legacyMatch) {
    const [, userId, filename] = legacyMatch;
    return `/api/uploads/cards/${userId}/${filename}`;
  }

  return url;
}

export function isCloudinaryImageUrl(url: string | null | undefined) {
  return Boolean(url?.includes("res.cloudinary.com"));
}

export function resolveCardImageUrl(url: string | null | undefined) {
  if (!url) {
    return null;
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

// Shared rules for where payment screenshots live and which URLs we accept.

export function screenshotPrefix(userId: string) {
  return `payments/${userId}/`;
}

/** https, Vercel Blob public host, and uploaded under this user's prefix. */
export function isOwnScreenshotUrl(value: string, userId: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com") &&
      decodeURIComponent(url.pathname).startsWith(`/${screenshotPrefix(userId)}`)
    );
  } catch {
    return false;
  }
}

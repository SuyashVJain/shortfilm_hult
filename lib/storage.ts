import "server-only";
import { del, head, put } from "@vercel/blob";

/**
 * Storage interface. Payment screenshots and the payment QR only, never video.
 * Vercel Blob is the current implementation. Swap it here without touching callers.
 */
export interface Storage {
  upload(file: Blob | File, path: string): Promise<{ url: string; path: string }>;
  getUrl(path: string): Promise<string | null>;
  delete(path: string): Promise<void>;
}

const blobStorage: Storage = {
  async upload(file, path) {
    // Random suffix keeps URLs unguessable (architecture §8).
    const res = await put(path, file, { access: "public", addRandomSuffix: true });
    return { url: res.url, path: res.pathname };
  },
  async getUrl(path) {
    try {
      return (await head(path)).url;
    } catch {
      return null;
    }
  },
  async delete(path) {
    await del(path);
  },
};

export const storage: Storage = blobStorage;

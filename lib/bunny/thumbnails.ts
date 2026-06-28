import { getStorageFileUrl } from "@/lib/bunny/storage";
import { hasBunnyStorageConfig } from "@/lib/bunny/storage-config";

/** True when value is a Bunny Storage path (not a legacy Stream URL). */
export function isThumbnailStoragePath(value: string): boolean {
  return value.startsWith("users/") && !value.startsWith("http");
}

export function resolveThumbnailDisplayUrl(
  stored: string | null | undefined,
  ttlSeconds = 86400 * 7,
): string | null {
  if (!stored) return null;
  if (stored.startsWith("http://") || stored.startsWith("https://")) {
    return stored;
  }
  if (!hasBunnyStorageConfig()) return null;
  return getStorageFileUrl(stored, ttlSeconds);
}

/** Dashboard preview URL — proxied so private storage zones work without CDN tokens. */
export function getExerciseThumbnailPreviewUrl(
  exerciseId: string,
  sortOrder: number,
  stored: string | null | undefined,
): string | null {
  if (!stored) return null;
  if (stored.startsWith("http://") || stored.startsWith("https://")) {
    return stored;
  }
  if (!isThumbnailStoragePath(stored)) return null;
  return `/api/exercises/${exerciseId}/thumbnails/${sortOrder}`;
}

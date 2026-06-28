import crypto from "crypto";
import { getBunnyStorageConfig } from "@/lib/bunny/storage-config";

export const AUDIO_MAX_BYTES_DEV = 20 * 1024 * 1024;

/** Vercel serverless request body limit ~4.5 MB in production. */
export function getAudioUploadMaxBytes(): number {
  if (process.env.NODE_ENV === "development") {
    return AUDIO_MAX_BYTES_DEV;
  }
  return 4 * 1024 * 1024;
}

export const AUDIO_MAX_BYTES = AUDIO_MAX_BYTES_DEV;

export const ACCEPTED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/m4a": "m4a",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
};

function storageHeaders(apiKey: string, contentType?: string): HeadersInit {
  const headers: Record<string, string> = { AccessKey: apiKey };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

function signPullZoneToken(
  path: string,
  expires: number,
  securityKey: string,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const hash = crypto
    .createHash("sha256")
    .update(securityKey + normalizedPath + expires)
    .digest("base64");

  return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function exerciseAudioStoragePath(
  userId: string,
  exerciseId: string,
  extension: string,
): string {
  const safeExt = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "mp3";
  return `users/${userId}/exercises/${exerciseId}/description.${safeExt}`;
}

export function exerciseThumbnailStoragePath(
  userId: string,
  exerciseId: string,
  index: number,
): string {
  return `users/${userId}/exercises/${exerciseId}/thumbnails/${index}.jpg`;
}

export async function deleteExerciseThumbnailFiles(
  userId: string,
  exerciseId: string,
  knownPaths: string[] = [],
): Promise<void> {
  const paths = new Set(knownPaths.filter(isThumbnailStoragePath));

  for (let index = 0; index < 4; index += 1) {
    paths.add(exerciseThumbnailStoragePath(userId, exerciseId, index));
  }

  await Promise.all(
    [...paths].map((path) =>
      deleteStorageFile(path).catch(() => {
        // ignore missing files
      }),
    ),
  );
}

function isThumbnailStoragePath(value: string): boolean {
  return value.startsWith("users/") && !value.startsWith("http");
}

export function extensionForAudioContentType(contentType: string): string {
  const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return EXT_BY_TYPE[normalized] ?? "mp3";
}

export function isAcceptedAudioContentType(contentType: string): boolean {
  const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return ACCEPTED_AUDIO_TYPES.has(normalized);
}

export function getStorageFileUrl(storagePath: string, ttlSeconds = 3600): string {
  const { hostname, tokenKey } = getBunnyStorageConfig();
  const path = storagePath.startsWith("/") ? storagePath : `/${storagePath}`;
  const base = `https://${hostname}${path}`;

  if (!tokenKey) return base;

  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = signPullZoneToken(path, expires, tokenKey);
  const url = new URL(base);
  url.searchParams.set("token", token);
  url.searchParams.set("expires", String(expires));
  return url.toString();
}

export async function uploadStorageFile(
  storagePath: string,
  body: BodyInit,
  options?: { contentType?: string; contentLength?: string | null },
): Promise<void> {
  const { zoneName, apiKey, endpoint } = getBunnyStorageConfig();
  const path = storagePath.replace(/^\/+/, "");

  const headers: Record<string, string> = {
    AccessKey: apiKey,
    "Content-Type": options?.contentType ?? "application/octet-stream",
  };

  if (options?.contentLength) {
    headers["Content-Length"] = options.contentLength;
  }

  const init: RequestInit & { duplex?: "half" } = {
    method: "PUT",
    headers,
    body,
  };

  if (body instanceof ReadableStream) {
    init.duplex = "half";
  }

  const response = await fetch(`${endpoint}/${zoneName}/${path}`, init);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Bunny Storage upload failed (${response.status}): ${errorBody}`);
  }
}

export async function downloadStorageFile(storagePath: string): Promise<Response> {
  const { zoneName, apiKey, endpoint } = getBunnyStorageConfig();
  const path = storagePath.replace(/^\/+/, "");

  const response = await fetch(`${endpoint}/${zoneName}/${path}`, {
    headers: storageHeaders(apiKey),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Bunny Storage download failed (${response.status}): ${body}`);
  }

  return response;
}

export async function deleteStorageFile(storagePath: string): Promise<void> {
  const { zoneName, apiKey, endpoint } = getBunnyStorageConfig();
  const path = storagePath.replace(/^\/+/, "");

  const response = await fetch(`${endpoint}/${zoneName}/${path}`, {
    method: "DELETE",
    headers: storageHeaders(apiKey),
  });

  if (response.status === 404) return;

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Bunny Storage delete failed (${response.status}): ${body}`);
  }
}

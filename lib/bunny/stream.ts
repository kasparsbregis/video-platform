import { createStreamAuthParams } from "@/lib/bunny/sign";
import { getBunnyStreamConfig } from "@/lib/bunny/config";

const STREAM_API = "https://video.bunnycdn.com";

/** Bunny Stream API video status (GET /videos/{id}) */
export const BUNNY_API_STATUS = {
  CREATED: 0,
  UPLOADED: 1,
  PROCESSING: 2,
  TRANSCODING: 3,
  FINISHED: 4,
  ERROR: 5,
  UPLOAD_FAILED: 6,
  JIT_PLAYLISTS_CREATED: 8,
} as const;

/** Bunny Stream webhook Status field (different from API status!) */
export const BUNNY_WEBHOOK_STATUS = {
  FINISHED: 3,
  RESOLUTION_FINISHED: 4,
  FAILED: 5,
  PRESIGNED_UPLOAD_FINISHED: 7,
  PRESIGNED_UPLOAD_FAILED: 8,
} as const;

export type BunnyVideo = {
  guid: string;
  title: string;
  status: number;
  length: number;
  thumbnailCount: number;
  dateUploaded: string;
  encodeProgress?: number;
  storageSize?: number;
  availableResolutions?: string | null;
};

function streamHeaders(apiKey: string): HeadersInit {
  return {
    AccessKey: apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Bunny Stream API error (${response.status}): ${body}`);
  }
  return response.json() as Promise<T>;
}

export async function createStreamVideo(title: string): Promise<BunnyVideo> {
  const { libraryId, apiKey } = getBunnyStreamConfig();

  const response = await fetch(`${STREAM_API}/library/${libraryId}/videos`, {
    method: "POST",
    headers: streamHeaders(apiKey),
    body: JSON.stringify({ title }),
  });

  return parseJson<BunnyVideo>(response);
}

export async function getStreamVideo(videoId: string): Promise<BunnyVideo> {
  const { libraryId, apiKey } = getBunnyStreamConfig();

  const response = await fetch(
    `${STREAM_API}/library/${libraryId}/videos/${videoId}`,
    {
      headers: streamHeaders(apiKey),
      cache: "no-store",
    },
  );

  return parseJson<BunnyVideo>(response);
}

export async function deleteStreamVideo(videoId: string): Promise<void> {
  const { libraryId, apiKey } = getBunnyStreamConfig();

  const response = await fetch(
    `${STREAM_API}/library/${libraryId}/videos/${videoId}`,
    {
      method: "DELETE",
      headers: streamHeaders(apiKey),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to delete Bunny video (${response.status}): ${body}`);
  }
}

/** Direct binary upload — API key stays server-side (Bunny PUT endpoint). */
export async function uploadStreamVideoBinary(
  videoId: string,
  body: BodyInit,
  options?: { contentType?: string; contentLength?: string | null },
): Promise<void> {
  const { libraryId, apiKey } = getBunnyStreamConfig();

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

  // Node.js fetch requires duplex when forwarding a ReadableStream body
  if (body instanceof ReadableStream) {
    init.duplex = "half";
  }

  const response = await fetch(
    `${STREAM_API}/library/${libraryId}/videos/${videoId}`,
    init,
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Bunny video upload failed (${response.status}): ${errorBody}`);
  }
}

const FAILED_API_STATUSES = new Set([
  BUNNY_API_STATUS.ERROR,
  BUNNY_API_STATUS.UPLOAD_FAILED,
  7, // OriginalCorrupted
  9, // TranscriptionFailed
  10, // JitFailed
  11, // CaptionGenerationFailed
]);

export function isBunnyUploadMissing(video: BunnyVideo): boolean {
  const hasFile =
    (video.storageSize ?? 0) > 0 ||
    video.status >= BUNNY_API_STATUS.UPLOADED ||
    (video.length ?? 0) > 0;
  return !hasFile && video.status <= BUNNY_API_STATUS.PROCESSING;
}

/** True when Bunny has enough data for playback (may still be finishing other resolutions). */
export function isBunnyVideoPlayable(video: BunnyVideo): boolean {
  if (FAILED_API_STATUSES.has(video.status)) return false;

  if (
    video.status === BUNNY_API_STATUS.FINISHED ||
    video.status === BUNNY_API_STATUS.JIT_PLAYLISTS_CREATED
  ) {
    return true;
  }

  // Bunny sets duration once the file is parsed — usually before full encode finishes
  if ((video.storageSize ?? 0) > 0 && (video.length ?? 0) > 0) {
    return true;
  }

  if (video.availableResolutions && (video.length ?? 0) > 0) {
    return true;
  }

  return false;
}

export function mapBunnyStatusToExerciseStatus(
  video: BunnyVideo,
): "processing" | "ready" | "failed" {
  if (FAILED_API_STATUSES.has(video.status)) return "failed";
  if (isBunnyVideoPlayable(video)) return "ready";
  return "processing";
}

export function mapWebhookStatusToExerciseStatus(
  webhookStatus: number,
): "processing" | "ready" | "failed" {
  if (
    webhookStatus === BUNNY_WEBHOOK_STATUS.FINISHED ||
    webhookStatus === BUNNY_WEBHOOK_STATUS.RESOLUTION_FINISHED
  ) {
    return "ready";
  }

  if (
    webhookStatus === BUNNY_WEBHOOK_STATUS.FAILED ||
    webhookStatus === BUNNY_WEBHOOK_STATUS.PRESIGNED_UPLOAD_FAILED
  ) {
    return "failed";
  }

  return "processing";
}

function withTokenQuery(
  baseUrl: string,
  videoId: string,
  tokenKey?: string,
): string {
  if (!tokenKey) return baseUrl;

  const { token, expires } = createStreamAuthParams(videoId, tokenKey);
  const url = new URL(baseUrl);
  url.searchParams.set("token", token);
  url.searchParams.set("expires", String(expires));
  return url.toString();
}

export function getEmbedUrl(videoId: string, libraryId?: string): string {
  const config = getBunnyStreamConfig();
  const libId = libraryId ?? config.libraryId;
  const base = `https://iframe.mediadelivery.net/embed/${libId}/${videoId}?autoplay=false&preload=true`;
  return withTokenQuery(base, videoId, config.tokenKey);
}

export function getPlaybackMp4Url(videoId: string, resolution = "720p"): string {
  const { hostname, tokenKey } = getBunnyStreamConfig();
  const base = `https://${hostname}/${videoId}/play_${resolution}.mp4`;
  return withTokenQuery(base, videoId, tokenKey);
}

export function getExercisePlaybackUrls(
  videoId: string,
  libraryId?: string,
): { embedUrl: string; scrubVideoUrl: string } {
  return {
    embedUrl: getEmbedUrl(videoId, libraryId),
    scrubVideoUrl: getPlaybackMp4Url(videoId),
  };
}

export function getThumbnailUrl(videoId: string, timeSeconds: number): string {
  const { hostname, tokenKey } = getBunnyStreamConfig();
  const base = `https://${hostname}/${videoId}/thumbnail.jpg?time=${timeSeconds}`;
  return withTokenQuery(base, videoId, tokenKey);
}

export function formatVideoDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function bunnyApiStatusLabel(status: number): string {
  const labels: Record<number, string> = {
    0: "Created",
    1: "Uploaded",
    2: "Processing",
    3: "Transcoding",
    4: "Finished",
    5: "Error",
    6: "Upload failed",
    8: "Ready",
  };
  return labels[status] ?? `Status ${status}`;
}

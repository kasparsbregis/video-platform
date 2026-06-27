import crypto from "crypto";

/** Bunny Stream token auth: SHA256(securityKey + videoId + expires) → base64url */
export function signStreamToken(
  videoId: string,
  expires: number,
  securityKey: string,
): string {
  const hash = crypto
    .createHash("sha256")
    .update(securityKey + videoId + expires)
    .digest("base64");

  return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function createStreamAuthParams(
  videoId: string,
  securityKey: string,
  ttlSeconds = 3600,
): { token: string; expires: number } {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = signStreamToken(videoId, expires, securityKey);
  return { token, expires };
}

/** TUS upload signature: SHA256(libraryId + apiKey + expires + videoId) → hex */
export function createTusUploadSignature(
  libraryId: string,
  apiKey: string,
  videoId: string,
  expires: number,
): string {
  return crypto
    .createHash("sha256")
    .update(`${libraryId}${apiKey}${expires}${videoId}`)
    .digest("hex");
}

export function createTusUploadAuth(
  libraryId: string,
  apiKey: string,
  videoId: string,
  ttlSeconds = 86400,
): {
  authorizationSignature: string;
  authorizationExpire: number;
  libraryId: string;
  videoId: string;
} {
  const authorizationExpire = Math.floor(Date.now() / 1000) + ttlSeconds;
  const authorizationSignature = createTusUploadSignature(
    libraryId,
    apiKey,
    videoId,
    authorizationExpire,
  );

  return {
    authorizationSignature,
    authorizationExpire,
    libraryId,
    videoId,
  };
}

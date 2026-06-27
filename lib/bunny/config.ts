export type BunnyStreamConfig = {
  libraryId: string;
  apiKey: string;
  hostname: string;
  tokenKey?: string;
};

export function getBunnyStreamConfig(): BunnyStreamConfig {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const hostname = process.env.BUNNY_STREAM_HOSTNAME;
  const tokenKey = process.env.BUNNY_TOKEN_SECURITY_KEY;

  if (!libraryId || !apiKey || !hostname) {
    throw new Error(
      "Missing Bunny Stream env vars: BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_API_KEY, BUNNY_STREAM_HOSTNAME",
    );
  }

  return {
    libraryId,
    apiKey,
    hostname: hostname.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    tokenKey: tokenKey || undefined,
  };
}

export function hasBunnyStreamConfig(): boolean {
  return Boolean(
    process.env.BUNNY_STREAM_LIBRARY_ID &&
      process.env.BUNNY_STREAM_API_KEY &&
      process.env.BUNNY_STREAM_HOSTNAME,
  );
}

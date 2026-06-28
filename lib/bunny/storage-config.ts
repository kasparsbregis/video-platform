export type BunnyStorageConfig = {
  zoneName: string;
  apiKey: string;
  hostname: string;
  endpoint: string;
  tokenKey?: string;
};

export function getBunnyStorageConfig(): BunnyStorageConfig {
  const zoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
  const apiKey = process.env.BUNNY_STORAGE_API_KEY;
  const hostname = process.env.BUNNY_STORAGE_HOSTNAME;
  const endpoint =
    process.env.BUNNY_STORAGE_ENDPOINT?.replace(/\/$/, "") ??
    "https://storage.bunnycdn.com";
  const tokenKey = process.env.BUNNY_STORAGE_TOKEN_KEY;

  if (!zoneName || !apiKey || !hostname) {
    throw new Error(
      "Missing Bunny Storage env vars: BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_API_KEY, BUNNY_STORAGE_HOSTNAME",
    );
  }

  return {
    zoneName,
    apiKey,
    hostname: hostname.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    endpoint,
    tokenKey: tokenKey || undefined,
  };
}

export function hasBunnyStorageConfig(): boolean {
  return Boolean(
    process.env.BUNNY_STORAGE_ZONE_NAME &&
      process.env.BUNNY_STORAGE_API_KEY &&
      process.env.BUNNY_STORAGE_HOSTNAME,
  );
}

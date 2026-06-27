import crypto from "crypto";

export function validateBunnyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  signatureVersion: string | null,
  signatureAlgorithm: string | null,
  signingSecret: string,
): boolean {
  if (signatureVersion !== "v1" || signatureAlgorithm !== "hmac-sha256") {
    return false;
  }

  if (!signatureHeader || !/^[0-9a-f]{64}$/.test(signatureHeader)) {
    return false;
  }

  const expectedHex = crypto
    .createHmac("sha256", signingSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedHex, "utf8"),
    Buffer.from(signatureHeader, "utf8"),
  );
}

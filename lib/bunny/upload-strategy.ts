/** Max size for direct server → Bunny PUT upload (bypasses TUS). */
export function getDirectUploadMaxBytes(): number {
  // Vercel serverless request body limit ~4.5 MB in production
  if (process.env.NODE_ENV === "development") {
    return 500 * 1024 * 1024;
  }
  return 4 * 1024 * 1024;
}

export function shouldUseDirectUpload(fileSize: number): boolean {
  return fileSize <= getDirectUploadMaxBytes();
}

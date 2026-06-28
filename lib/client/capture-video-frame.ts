/** Capture the current video frame as JPEG (requires CORS on the video source). */
export async function captureVideoFrame(
  video: HTMLVideoElement,
): Promise<Blob | null> {
  if (video.videoWidth === 0 || video.videoHeight === 0) return null;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } catch {
    return null;
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.88);
  });
}

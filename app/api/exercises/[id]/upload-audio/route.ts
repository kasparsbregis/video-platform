import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasBunnyStorageConfig } from "@/lib/bunny/storage-config";
import {
  deleteStorageFile,
  exerciseAudioStoragePath,
  extensionForAudioContentType,
  getAudioUploadMaxBytes,
  isAcceptedAudioContentType,
  uploadStorageFile,
} from "@/lib/bunny/storage";

export const runtime = "nodejs";
export const maxDuration = 120;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasBunnyStorageConfig()) {
    return Response.json(
      { error: "Audio upload is not configured. Add Bunny Storage env vars." },
      { status: 503 },
    );
  }

  const { id: exerciseId } = await context.params;

  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId: session.user.id },
  });

  if (!exercise) {
    return Response.json({ error: "Exercise not found" }, { status: 404 });
  }

  if (!request.body) {
    return Response.json({ error: "Missing audio body" }, { status: 400 });
  }

  const contentType =
    request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ??
    "application/octet-stream";

  if (!isAcceptedAudioContentType(contentType)) {
    return Response.json(
      { error: "Unsupported audio type. Use MP3, M4A, WAV, WebM, or OGG." },
      { status: 415 },
    );
  }

  const contentLength = request.headers.get("content-length");
  const maxBytes = getAudioUploadMaxBytes();
  if (contentLength) {
    const bytes = Number(contentLength);
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return Response.json({ error: "Invalid Content-Length" }, { status: 400 });
    }
    if (bytes > maxBytes) {
      return Response.json(
        {
          error: `Audio file too large (max ${Math.round(maxBytes / (1024 * 1024))} MB on this environment).`,
        },
        { status: 413 },
      );
    }
  }

  const extension = extensionForAudioContentType(contentType);
  const storagePath = exerciseAudioStoragePath(
    session.user.id,
    exerciseId,
    extension,
  );

  try {
    if (exercise.audioStoragePath && exercise.audioStoragePath !== storagePath) {
      try {
        await deleteStorageFile(exercise.audioStoragePath);
      } catch {
        // Replace upload even if old file cleanup fails
      }
    }

    await uploadStorageFile(storagePath, request.body, {
      contentType,
      contentLength,
    });

    await prisma.exercise.update({
      where: { id: exerciseId },
      data: { audioStoragePath: storagePath },
    });

    return Response.json({ ok: true, storagePath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 502 });
  }
}

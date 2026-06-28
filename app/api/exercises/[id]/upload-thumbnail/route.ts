import { auth } from "@/auth";
import { hasBunnyStorageConfig } from "@/lib/bunny/storage-config";
import {
  exerciseThumbnailStoragePath,
  uploadStorageFile,
} from "@/lib/bunny/storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasBunnyStorageConfig()) {
    return Response.json(
      { error: "Thumbnail storage is not configured. Add Bunny Storage env vars." },
      { status: 503 },
    );
  }

  const { id: exerciseId } = await context.params;
  const indexParam = new URL(request.url).searchParams.get("index");
  const index = Number(indexParam);

  if (!Number.isInteger(index) || index < 0 || index > 3) {
    return Response.json({ error: "Invalid thumbnail index (0–3)." }, { status: 400 });
  }

  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId: session.user.id },
  });

  if (!exercise) {
    return Response.json({ error: "Exercise not found" }, { status: 404 });
  }

  if (!request.body) {
    return Response.json({ error: "Missing image body" }, { status: 400 });
  }

  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.length === 0) {
    return Response.json({ error: "Empty image body" }, { status: 400 });
  }

  if (bytes.length > 2 * 1024 * 1024) {
    return Response.json({ error: "Thumbnail too large (max 2 MB)." }, { status: 413 });
  }

  const storagePath = exerciseThumbnailStoragePath(
    session.user.id,
    exerciseId,
    index,
  );

  try {
    await uploadStorageFile(storagePath, bytes, {
      contentType: "image/jpeg",
      contentLength: String(bytes.length),
    });

    return Response.json({ ok: true, storagePath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 502 });
  }
}

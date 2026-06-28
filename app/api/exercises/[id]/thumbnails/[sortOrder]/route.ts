import { auth } from "@/auth";
import { isThumbnailStoragePath } from "@/lib/bunny/thumbnails";
import { downloadStorageFile } from "@/lib/bunny/storage";
import { hasBunnyStorageConfig } from "@/lib/bunny/storage-config";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; sortOrder: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!hasBunnyStorageConfig()) {
    return new Response("Storage not configured", { status: 503 });
  }

  const { id: exerciseId, sortOrder: sortOrderParam } = await context.params;
  const sortOrder = Number(sortOrderParam);

  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 3) {
    return new Response("Invalid thumbnail index", { status: 400 });
  }

  const thumbnail = await prisma.exerciseThumbnail.findFirst({
    where: {
      exerciseId,
      sortOrder,
      exercise: { userId: session.user.id },
    },
  });

  const storagePath = thumbnail?.bunnyThumbnailUrl;
  if (!storagePath || !isThumbnailStoragePath(storagePath)) {
    return new Response("Thumbnail not found", { status: 404 });
  }

  try {
    const storageResponse = await downloadStorageFile(storagePath);

    return new Response(storageResponse.body, {
      headers: {
        "Content-Type": storageResponse.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Failed to load thumbnail", { status: 502 });
  }
}

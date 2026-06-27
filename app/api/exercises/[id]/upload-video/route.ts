import { auth } from "@/auth";
import { uploadStreamVideoBinary } from "@/lib/bunny/stream";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 300;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: exerciseId } = await context.params;

  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId: session.user.id },
  });

  if (!exercise?.bunnyVideoId) {
    return Response.json({ error: "Exercise not found" }, { status: 404 });
  }

  if (!request.body) {
    return Response.json({ error: "Missing video body" }, { status: 400 });
  }

  try {
    await uploadStreamVideoBinary(exercise.bunnyVideoId, request.body, {
      contentType: request.headers.get("content-type") ?? "application/octet-stream",
      contentLength: request.headers.get("content-length"),
    });

    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 502 });
  }
}

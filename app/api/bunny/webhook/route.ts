import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  getStreamVideo,
  mapWebhookStatusToExerciseStatus,
  resolveExerciseVideoStatus,
} from "@/lib/bunny/stream";
import { validateBunnyWebhookSignature } from "@/lib/bunny/webhook";

type BunnyWebhookPayload = {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;
};

async function applyBunnyVideoToExercise(
  exerciseId: string,
  bunnyVideo: Awaited<ReturnType<typeof getStreamVideo>>,
  statusOverride?: "processing" | "ready" | "failed",
) {
  const { mapBunnyStatusToExerciseStatus } = await import("@/lib/bunny/stream");
  const status = statusOverride ?? mapBunnyStatusToExerciseStatus(bunnyVideo);
  const durationSeconds =
    bunnyVideo.length > 0 ? Math.round(bunnyVideo.length) : null;

  await prisma.exercise.update({
    where: { id: exerciseId },
    data: { status, durationSeconds },
  });

  revalidatePath("/dashboard/exercises");
  revalidatePath(`/dashboard/exercises/${exerciseId}`);
  revalidatePath("/dashboard");
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signingSecret = process.env.BUNNY_STREAM_WEBHOOK_KEY;

  if (signingSecret) {
    const valid = validateBunnyWebhookSignature(
      rawBody,
      request.headers.get("x-bunnystream-signature"),
      request.headers.get("x-bunnystream-signature-version"),
      request.headers.get("x-bunnystream-signature-algorithm"),
      signingSecret,
    );

    if (!valid) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: BunnyWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as BunnyWebhookPayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.VideoGuid) {
    return Response.json({ error: "Missing VideoGuid" }, { status: 400 });
  }

  const exercise = await prisma.exercise.findFirst({
    where: { bunnyVideoId: payload.VideoGuid },
  });

  if (!exercise) {
    return Response.json({ ok: true, skipped: true });
  }

  // Webhook status 3/4 = ready — always re-fetch full video from API for duration
  const webhookStatus = mapWebhookStatusToExerciseStatus(payload.Status);

  if (webhookStatus === "failed") {
    await prisma.exercise.update({
      where: { id: exercise.id },
      data: { status: "failed" },
    });
    revalidatePath(`/dashboard/exercises/${exercise.id}`);
    return Response.json({ ok: true });
  }

  try {
    const bunnyVideo = await getStreamVideo(payload.VideoGuid);
    const status = await resolveExerciseVideoStatus(
      bunnyVideo,
      payload.VideoGuid,
    );
    await applyBunnyVideoToExercise(exercise.id, bunnyVideo, status);
  } catch {
    return Response.json({ error: "Failed to sync video" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

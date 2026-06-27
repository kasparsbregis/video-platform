"use server";

import { revalidatePath } from "next/cache";
import type { PlaybackMode } from "@prisma/client";
import { requireUser } from "@/lib/auth/require-user";
import { requireExerciseForUser } from "@/lib/auth/assert-ownership";
import { createTusUploadAuth } from "@/lib/bunny/sign";
import { getBunnyStreamConfig, hasBunnyStreamConfig } from "@/lib/bunny/config";
import {
  createStreamVideo,
  deleteStreamVideo,
  getStreamVideo,
  getThumbnailUrl,
  getExercisePlaybackUrls,
  isBunnyUploadMissing,
  mapBunnyStatusToExerciseStatus,
  resolveExerciseVideoStatus,
} from "@/lib/bunny/stream";
import { prisma } from "@/lib/prisma";

export type PrepareUploadResult =
  | {
      ok: true;
      exerciseId: string;
      tus: {
        endpoint: string;
        authorizationSignature: string;
        authorizationExpire: number;
        libraryId: string;
        videoId: string;
      };
    }
  | { ok: false; error: string };

export async function prepareExerciseUpload(
  name: string,
): Promise<PrepareUploadResult> {
  const user = await requireUser();
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { ok: false, error: "Exercise name is required." };
  }

  if (!hasBunnyStreamConfig()) {
    return {
      ok: false,
      error: "Video upload is not configured. Add Bunny Stream env vars.",
    };
  }

  try {
    const bunnyVideo = await createStreamVideo(trimmedName);
    const config = getBunnyStreamConfig();
    const tusAuth = createTusUploadAuth(
      config.libraryId,
      config.apiKey,
      bunnyVideo.guid,
    );

    const exercise = await prisma.exercise.create({
      data: {
        userId: user.id,
        name: trimmedName,
        bunnyVideoId: bunnyVideo.guid,
        bunnyLibraryId: config.libraryId,
        status: "processing",
      },
    });

    return {
      ok: true,
      exerciseId: exercise.id,
      tus: {
        endpoint: "https://video.bunnycdn.com/tusupload",
        ...tusAuth,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload preparation failed.";
    return { ok: false, error: message };
  }
}

export type SyncStatusResult = {
  status: "processing" | "ready" | "failed";
  durationSeconds: number | null;
  uploadMissing: boolean;
  bunnyStatus: number;
  encodeProgress: number;
  embedUrl: string | null;
  scrubVideoUrl: string | null;
  stillEncoding: boolean;
};

async function applyBunnyVideoToExercise(
  exerciseId: string,
  bunnyVideo: Awaited<ReturnType<typeof getStreamVideo>>,
  statusOverride?: "processing" | "ready" | "failed",
) {
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

  return { status, durationSeconds };
}

export async function syncExerciseVideoStatus(
  exerciseId: string,
): Promise<SyncStatusResult> {
  const user = await requireUser();
  const exercise = await requireExerciseForUser(exerciseId, user.id);

  if (!exercise.bunnyVideoId) {
    return {
      status: exercise.status,
      durationSeconds: exercise.durationSeconds,
      uploadMissing: false,
      bunnyStatus: -1,
      encodeProgress: 0,
      embedUrl: null,
      scrubVideoUrl: null,
      stillEncoding: false,
    };
  }

  const bunnyVideo = await getStreamVideo(exercise.bunnyVideoId);
  const status = await resolveExerciseVideoStatus(
    bunnyVideo,
    exercise.bunnyVideoId,
  );
  const durationSeconds =
    bunnyVideo.length > 0 ? Math.round(bunnyVideo.length) : null;
  const uploadMissing = isBunnyUploadMissing(bunnyVideo);
  const stillEncoding =
    status === "ready" &&
    bunnyVideo.status !== 4 &&
    bunnyVideo.status !== 8;

  const urls =
    status === "ready" && exercise.bunnyVideoId
      ? getExercisePlaybackUrls(
          exercise.bunnyVideoId,
          exercise.bunnyLibraryId ?? undefined,
        )
      : { embedUrl: null, scrubVideoUrl: null };

  if (status !== exercise.status || durationSeconds !== exercise.durationSeconds) {
    await applyBunnyVideoToExercise(exercise.id, bunnyVideo, status);
  }

  return {
    status,
    durationSeconds,
    uploadMissing,
    bunnyStatus: bunnyVideo.status,
    encodeProgress: bunnyVideo.encodeProgress ?? 0,
    embedUrl: urls.embedUrl,
    scrubVideoUrl: urls.scrubVideoUrl,
    stillEncoding,
  };
}

export async function confirmExerciseUploadReceived(
  exerciseId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const exercise = await requireExerciseForUser(exerciseId, user.id);

  if (!exercise.bunnyVideoId) {
    return { ok: false, error: "Missing video reference." };
  }

  const bunnyVideo = await getStreamVideo(exercise.bunnyVideoId);

  if (isBunnyUploadMissing(bunnyVideo)) {
    return {
      ok: false,
      error:
        "Bunny did not receive the video file. Delete this exercise and try uploading again.",
    };
  }

  await applyBunnyVideoToExercise(exercise.id, bunnyVideo);
  return { ok: true };
}

export async function updateExerciseDetails(
  exerciseId: string,
  data: {
    name?: string;
    textDescription?: string;
    playbackMode?: PlaybackMode;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  await requireExerciseForUser(exerciseId, user.id);

  const name = data.name?.trim();
  if (name !== undefined && !name) {
    return { ok: false, error: "Exercise name is required." };
  }

  await prisma.exercise.update({
    where: { id: exerciseId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(data.textDescription !== undefined
        ? { textDescription: data.textDescription.trim() || null }
        : {}),
      ...(data.playbackMode !== undefined ? { playbackMode: data.playbackMode } : {}),
    },
  });

  revalidatePath("/dashboard/exercises");
  revalidatePath(`/dashboard/exercises/${exerciseId}`);
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function saveExerciseThumbnails(
  exerciseId: string,
  timestampsMs: number[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const exercise = await requireExerciseForUser(exerciseId, user.id);

  if (!exercise.bunnyVideoId) {
    return { ok: false, error: "Video is not ready yet." };
  }

  if (timestampsMs.length === 0) {
    return { ok: false, error: "Select at least one frame." };
  }

  if (timestampsMs.length > 4) {
    return { ok: false, error: "You can save up to 4 thumbnails." };
  }

  const unique = [...new Set(timestampsMs.map((ms) => Math.max(0, Math.round(ms))))];

  await prisma.$transaction([
    prisma.exerciseThumbnail.deleteMany({ where: { exerciseId } }),
    prisma.exerciseThumbnail.createMany({
      data: unique.map((timestampMs, index) => ({
        exerciseId,
        timestampMs,
        sortOrder: index,
        bunnyThumbnailUrl: getThumbnailUrl(
          exercise.bunnyVideoId!,
          timestampMs / 1000,
        ),
      })),
    }),
    prisma.exercise.update({
      where: { id: exerciseId },
      data: { updatedAt: new Date() },
    }),
  ]);

  revalidatePath("/dashboard/exercises");
  revalidatePath(`/dashboard/exercises/${exerciseId}`);
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function deleteExercise(
  exerciseId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();

  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId: user.id },
    include: {
      programs: {
        include: { program: { select: { name: true } } },
      },
    },
  });

  if (!exercise) {
    return { ok: false, error: "Exercise not found." };
  }

  if (exercise.programs.length > 0) {
    const programNames = exercise.programs.map((entry) => entry.program.name).join(", ");
    const label = exercise.programs.length === 1 ? "program" : "programs";
    return {
      ok: false,
      error: `Cannot delete — this exercise is used in ${exercise.programs.length} ${label}: ${programNames}. Remove it from those programs first.`,
    };
  }

  if (exercise.bunnyVideoId) {
    try {
      await deleteStreamVideo(exercise.bunnyVideoId);
    } catch {
      // DB cleanup still proceeds if Bunny video was already removed
    }
  }

  await prisma.exercise.delete({ where: { id: exercise.id } });

  revalidatePath("/dashboard/exercises");
  revalidatePath("/dashboard");

  return { ok: true };
}

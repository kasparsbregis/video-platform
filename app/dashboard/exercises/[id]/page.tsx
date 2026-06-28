import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ExerciseAudioUpload } from "@/components/exercises/exercise-audio-upload";
import { ExerciseEditor } from "@/components/exercises/exercise-editor";
import { requireExerciseForUser } from "@/lib/auth/assert-ownership";
import { requireUser } from "@/lib/auth/require-user";
import { hasBunnyStorageConfig } from "@/lib/bunny/storage-config";
import { getStorageFileUrl } from "@/lib/bunny/storage";
import {
  getExerciseThumbnailPreviewUrl,
  isThumbnailStoragePath,
} from "@/lib/bunny/thumbnails";
import { getEmbedUrl, getPlaybackMp4Url } from "@/lib/bunny/stream";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uploaded?: string }>;
};

export default async function ExerciseEditPage({ params, searchParams }: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const { uploaded } = await searchParams;
  const exercise = await requireExerciseForUser(id, user.id);

  const embedUrl =
    exercise.bunnyVideoId && exercise.status === "ready"
      ? getEmbedUrl(exercise.bunnyVideoId, exercise.bunnyLibraryId ?? undefined)
      : null;

  const scrubVideoUrl =
    exercise.bunnyVideoId && exercise.status === "ready"
      ? getPlaybackMp4Url(exercise.bunnyVideoId)
      : null;

  const storageConfigured = hasBunnyStorageConfig();
  const audioUrl =
    exercise.audioStoragePath && storageConfigured
      ? getStorageFileUrl(exercise.audioStoragePath)
      : null;

  return (
    <>
      <DashboardHeader
        title={exercise.name}
        subtitle="Edit video details, audio description, metadata, and thumbnails."
      />
      <div className="dashboard-content dashboard-content--workspace">
        <ExerciseEditor
          exercise={{
            id: exercise.id,
            name: exercise.name,
            status: exercise.status,
            performanceType: exercise.performanceType,
            exerciseType: exercise.exerciseType,
            difficulty: exercise.difficulty,
            textDescription: exercise.textDescription,
            durationSeconds: exercise.durationSeconds,
            bunnyVideoId: exercise.bunnyVideoId,
            embedUrl,
            scrubVideoUrl,
            programCount: exercise._count.programs,
          }}
          audioUrl={audioUrl}
          storageConfigured={storageConfigured}
          thumbnails={exercise.thumbnails.map((thumb) => {
            const stored = thumb.bunnyThumbnailUrl;
            const storagePath =
              stored && isThumbnailStoragePath(stored) ? stored : null;

            return {
              id: thumb.id,
              timestampMs: thumb.timestampMs,
              sortOrder: thumb.sortOrder,
              storagePath,
              previewUrl: getExerciseThumbnailPreviewUrl(id, thumb.sortOrder, stored),
            };
          })}
          justUploaded={uploaded === "1"}
        />
      </div>
    </>
  );
}

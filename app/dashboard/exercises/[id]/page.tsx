import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ExerciseEditor } from "@/components/exercises/exercise-editor";
import { requireExerciseForUser } from "@/lib/auth/assert-ownership";
import { requireUser } from "@/lib/auth/require-user";
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

  return (
    <>
      <DashboardHeader title={exercise.name} />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-text">
            <h1>{exercise.name}</h1>
            <p>Edit video details, description, playback mode, and thumbnails.</p>
          </div>
        </div>

        <ExerciseEditor
          exercise={{
            id: exercise.id,
            name: exercise.name,
            status: exercise.status,
            playbackMode: exercise.playbackMode,
            textDescription: exercise.textDescription,
            durationSeconds: exercise.durationSeconds,
            bunnyVideoId: exercise.bunnyVideoId,
            embedUrl,
            scrubVideoUrl,
            programCount: exercise._count.programs,
          }}
          thumbnails={exercise.thumbnails}
          justUploaded={uploaded === "1"}
        />
      </div>
    </>
  );
}

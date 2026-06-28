"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  ExerciseDifficulty,
  ExerciseStatus,
  ExerciseType,
  PerformanceType,
} from "@prisma/client";
import {
  saveExerciseThumbnails,
  syncExerciseVideoStatus,
  updateExerciseDetails,
} from "@/lib/actions/exercises";
import { ExerciseDeleteButton } from "@/components/exercises/exercise-delete-button";
import { ExerciseAudioUpload } from "@/components/exercises/exercise-audio-upload";
import { formatVideoDuration, bunnyApiStatusLabel } from "@/lib/bunny/stream";
import { captureVideoFrame } from "@/lib/client/capture-video-frame";
import {
  DIFFICULTY_OPTIONS,
  EXERCISE_TYPE_OPTIONS,
  PERFORMANCE_TYPE_OPTIONS,
} from "@/lib/exercise/metadata";

type Thumbnail = {
  id: string;
  timestampMs: number;
  sortOrder: number;
  storagePath: string | null;
  previewUrl: string | null;
};

type DraftThumbnail = {
  key: string;
  timestampMs: number;
  previewUrl: string | null;
  storagePath?: string | null;
  blob?: Blob;
};

function thumbnailsToDraft(thumbnails: Thumbnail[]): DraftThumbnail[] {
  return thumbnails.map((thumb) => ({
    key: thumb.id,
    timestampMs: thumb.timestampMs,
    previewUrl: thumb.previewUrl,
    storagePath: thumb.storagePath,
  }));
}

function revokeDraftBlobUrls(items: DraftThumbnail[]) {
  for (const item of items) {
    if (item.blob && item.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }
}

type ExerciseEditorProps = {
  exercise: {
    id: string;
    name: string;
    status: ExerciseStatus;
    performanceType: PerformanceType | null;
    exerciseType: ExerciseType | null;
    difficulty: ExerciseDifficulty | null;
    textDescription: string | null;
    durationSeconds: number | null;
    bunnyVideoId: string | null;
    embedUrl: string | null;
    scrubVideoUrl: string | null;
    programCount: number;
  };
  audioUrl: string | null;
  storageConfigured: boolean;
  thumbnails: Thumbnail[];
  justUploaded?: boolean;
};

export function ExerciseEditor({
  exercise,
  audioUrl,
  storageConfigured,
  thumbnails: initialThumbnails,
  justUploaded,
}: ExerciseEditorProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [name, setName] = useState(exercise.name);
  const [textDescription, setTextDescription] = useState(
    exercise.textDescription ?? "",
  );
  const [performanceType, setPerformanceType] = useState(
    exercise.performanceType ?? "",
  );
  const [exerciseType, setExerciseType] = useState(exercise.exerciseType ?? "");
  const [difficulty, setDifficulty] = useState(exercise.difficulty ?? "");
  const [status, setStatus] = useState(exercise.status);
  const [durationSeconds, setDurationSeconds] = useState(exercise.durationSeconds);
  const [draftThumbnails, setDraftThumbnails] = useState<DraftThumbnail[]>(() =>
    thumbnailsToDraft(initialThumbnails),
  );
  const [scrubMs, setScrubMs] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [uploadMissing, setUploadMissing] = useState(false);
  const [encodeProgress, setEncodeProgress] = useState(0);
  const [stillEncoding, setStillEncoding] = useState(false);
  const [bunnyStatus, setBunnyStatus] = useState(-1);
  const [embedUrl, setEmbedUrl] = useState(exercise.embedUrl);
  const [scrubVideoUrl, setScrubVideoUrl] = useState(exercise.scrubVideoUrl);
  const [waitingSince] = useState(() => Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);

  const canPreview = Boolean(embedUrl) && !uploadMissing && status !== "failed";
  const canScrub = Boolean(scrubVideoUrl) && (durationSeconds ?? 0) > 0;
  const maxDurationMs = (durationSeconds ?? 0) * 1000;
  const selectedCount = draftThumbnails.length;

  useEffect(() => {
    setDraftThumbnails((prev) => {
      revokeDraftBlobUrls(prev.filter((item) => item.blob));
      return thumbnailsToDraft(initialThumbnails);
    });
  }, [initialThumbnails]);

  useEffect(() => {
    return () => {
      revokeDraftBlobUrls(draftThumbnails);
    };
  }, [draftThumbnails]);

  const syncStatus = useCallback(async () => {
    if (status === "ready" || status === "failed") return;

    try {
      const result = await syncExerciseVideoStatus(exercise.id);
      setStatus(result.status);
      setDurationSeconds(result.durationSeconds);
      setUploadMissing(result.uploadMissing);
      setEncodeProgress(result.encodeProgress);
      setStillEncoding(result.stillEncoding);
      setBunnyStatus(result.bunnyStatus);
      if (result.embedUrl) setEmbedUrl(result.embedUrl);
      if (result.scrubVideoUrl) setScrubVideoUrl(result.scrubVideoUrl);
      if (result.status === "ready") {
        setMessage(
          result.stillEncoding
            ? "Preview is ready. Bunny is still generating other quality levels."
            : "Video is ready.",
        );
        router.refresh();
      }
    } catch {
      // Ignore transient polling errors
    }
  }, [exercise.id, router, status]);

  useEffect(() => {
    if (status !== "processing") return;
    const tick = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - waitingSince) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [status, waitingSince]);

  useEffect(() => {
    if (status !== "processing") return;

    const interval = setInterval(syncStatus, 1000);
    void syncStatus();
    return () => clearInterval(interval);
  }, [status, syncStatus]);

  useEffect(() => {
    setEmbedUrl(exercise.embedUrl);
    setScrubVideoUrl(exercise.scrubVideoUrl);
  }, [exercise.embedUrl, exercise.scrubVideoUrl]);

  useEffect(() => {
    if (justUploaded) {
      setMessage(
        "Upload complete. Bunny is encoding on their servers — this often takes 1–3 minutes on the free tier.",
      );
    }
  }, [justUploaded]);

  function processingHint(): string {
    if (bunnyStatus >= 0) {
      const label = bunnyApiStatusLabel(bunnyStatus);
      if (encodeProgress > 0) {
        return `${label} · ${encodeProgress}% · ${elapsedSec}s elapsed`;
      }
      return `${label} · ${elapsedSec}s elapsed`;
    }
    return `${elapsedSec}s elapsed`;
  }

  function parseOptionalEnum<T extends string>(value: string): T | null {
    return value ? (value as T) : null;
  }

  function handleSaveDetails() {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await updateExerciseDetails(exercise.id, {
        name: name.trim(),
        textDescription,
        performanceType: parseOptionalEnum<PerformanceType>(performanceType),
        exerciseType: parseOptionalEnum<ExerciseType>(exerciseType),
        difficulty: parseOptionalEnum<ExerciseDifficulty>(difficulty),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Changes saved.");
      router.refresh();
    });
  }

  async function addPendingFrame() {
    if (draftThumbnails.length >= 4) {
      setError("You can save up to 4 thumbnails.");
      return;
    }

    if (!storageConfigured) {
      setError("Thumbnail storage is not configured. Add Bunny Storage env vars.");
      return;
    }

    const ms = Math.round(scrubMs);
    if (draftThumbnails.some((frame) => frame.timestampMs === ms)) return;

    const video = videoRef.current;
    if (!video) return;

    const blob = await captureVideoFrame(video);
    if (!blob) {
      setError(
        "Could not capture this frame. Wait for the video to load, then try again.",
      );
      return;
    }

    setError("");
    const previewUrl = URL.createObjectURL(blob);
    setDraftThumbnails((prev) =>
      [
        ...prev,
        {
          key: `draft-${ms}-${Date.now()}`,
          timestampMs: ms,
          previewUrl,
          blob,
        },
      ].sort((a, b) => a.timestampMs - b.timestampMs),
    );
  }

  function removeDraftThumbnail(key: string) {
    setDraftThumbnails((prev) => {
      const frame = prev.find((item) => item.key === key);
      if (frame?.blob && frame.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(frame.previewUrl);
      }
      return prev.filter((item) => item.key !== key);
    });
  }

  function handleSaveThumbnails() {
    setError("");
    setMessage("");

    if (!storageConfigured) {
      setError("Thumbnail storage is not configured. Add Bunny Storage env vars.");
      return;
    }

    if (draftThumbnails.length === 0) {
      setError("Keep at least one thumbnail before saving.");
      return;
    }

    startTransition(async () => {
      const frames: { timestampMs: number; storagePath: string }[] = [];

      for (let index = 0; index < draftThumbnails.length; index += 1) {
        const item = draftThumbnails[index]!;

        if (item.blob) {
          const response = await fetch(
            `/api/exercises/${exercise.id}/upload-thumbnail?index=${index}`,
            {
              method: "POST",
              headers: { "Content-Type": "image/jpeg" },
              body: item.blob,
            },
          );

          const payload = (await response.json()) as {
            ok?: boolean;
            storagePath?: string;
            error?: string;
          };

          if (!response.ok || !payload.storagePath) {
            setError(payload.error ?? "Thumbnail upload failed.");
            return;
          }

          frames.push({
            timestampMs: item.timestampMs,
            storagePath: payload.storagePath,
          });
          continue;
        }

        if (item.storagePath) {
          frames.push({
            timestampMs: item.timestampMs,
            storagePath: item.storagePath,
          });
          continue;
        }

        setError("Capture frames with Add frame, then save.");
        return;
      }

      const result = await saveExerciseThumbnails(exercise.id, frames);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDraftThumbnails((prev) => {
        revokeDraftBlobUrls(prev.filter((item) => item.blob));
        return prev;
      });
      setMessage("Thumbnails saved.");
      router.refresh();
    });
  }

  return (
    <div className="exercise-editor">
      {(message || error) && (
        <div className="exercise-editor-alerts">
          {message && <div className="form-success">{message}</div>}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="exercise-editor-grid">
        <div className="exercise-editor-sidebar">
          <section className="panel exercise-editor-section">
            <h2 className="exercise-section-title">Details</h2>
            <div className="exercise-details-form">
              <div className="form-field">
                <label className="form-label" htmlFor="edit-name">
                  Name
                </label>
                <input
                  id="edit-name"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="edit-description">
                  Text description
                </label>
                <textarea
                  id="edit-description"
                  className="form-textarea"
                  rows={5}
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  placeholder="Setup, key cues, common mistakes, modifications…"
                  disabled={isPending}
                />
              </div>

              <div className="exercise-meta-grid">
                <div className="form-field">
                  <label className="form-label" htmlFor="edit-performance-type">
                    Performance type
                  </label>
                  <select
                    id="edit-performance-type"
                    className="form-input"
                    value={performanceType}
                    onChange={(e) => setPerformanceType(e.target.value)}
                    disabled={isPending}
                  >
                    <option value="">Not set</option>
                    {PERFORMANCE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="edit-exercise-type">
                    Exercise type
                  </label>
                  <select
                    id="edit-exercise-type"
                    className="form-input"
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    disabled={isPending}
                  >
                    <option value="">Not set</option>
                    {EXERCISE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="edit-difficulty">
                    Difficulty
                  </label>
                  <select
                    id="edit-difficulty"
                    className="form-input"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={isPending}
                  >
                    <option value="">Not set</option>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="app-btn app-btn-primary"
                onClick={handleSaveDetails}
                disabled={isPending}
              >
                {isPending ? "Saving…" : "Save details"}
              </button>
            </div>
          </section>

          <section className="panel exercise-editor-section">
            <h2 className="exercise-section-title">Audio description</h2>
            <p className="exercise-section-sub">
              Optional spoken cues for patients — separate from the demonstration video.
            </p>
            <ExerciseAudioUpload
              exerciseId={exercise.id}
              audioUrl={audioUrl}
              storageConfigured={storageConfigured}
            />
          </section>

          <section className="panel exercise-editor-section exercise-danger-zone">
            <h2 className="exercise-section-title">Delete exercise</h2>
            <p className="exercise-section-sub">
              Removes the exercise, its video, and any audio description. This cannot be undone.
              {exercise.programCount > 0 &&
                ` Used in ${exercise.programCount} program(s) — remove it from those programs first.`}
            </p>
            <ExerciseDeleteButton
              exerciseId={exercise.id}
              exerciseName={exercise.name}
              programCount={exercise.programCount}
              variant="panel"
            />
          </section>
        </div>

        <div className="exercise-editor-main">
          <section className="panel exercise-editor-section">
            <div className="exercise-editor-video">
              {canPreview ? (
                <iframe
                  src={embedUrl!}
                  title={`${exercise.name} preview`}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="exercise-embed"
                />
              ) : (
                <div className="exercise-encoding">
                  {uploadMissing ? (
                    <>
                      <strong>Video file not received</strong>
                      <p>
                        Bunny has a placeholder for this exercise but no video data. Delete
                        this exercise and upload again.
                      </p>
                      <Link href="/dashboard/exercises/new" className="app-btn app-btn-outline app-btn-sm">
                        Upload again
                      </Link>
                    </>
                  ) : status === "failed" ? (
                    <>
                      <strong>Encoding failed</strong>
                      <p>Try uploading again or contact support if this persists.</p>
                    </>
                  ) : (
                    <>
                      <strong>Bunny is encoding…</strong>
                      <p>
                        Your upload finished quickly. Bunny now transcodes on a shared
                        queue — even short clips can take 1–3 minutes before preview
                        appears. You can leave this page; status updates automatically.
                      </p>
                      <div className="encode-wait-meta">{processingHint()}</div>
                      {encodeProgress > 0 && (
                        <div className="upload-progress encode-wait-bar">
                          <div className="upload-progress-bar">
                            <div
                              className="upload-progress-fill"
                              style={{ width: `${encodeProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="exercise-status-row">
              <span className={`badge badge-status badge-status--${status}`}>{status}</span>
              {stillEncoding && status === "ready" && (
                <span className="badge badge-muted">Finishing encode</span>
              )}
              {durationSeconds ? (
                <span className="exercise-duration">{formatVideoDuration(durationSeconds)}</span>
              ) : null}
            </div>
          </section>

          {canScrub && exercise.bunnyVideoId && (
            <section className="panel exercise-editor-section">
              <h2 className="exercise-section-title">Thumbnails</h2>
              <p className="exercise-section-sub">
                Scrub the preview and capture up to 4 frames. At least 1 is required — click
                Save thumbnails after adding or removing frames.
              </p>

              <div className="thumbnail-picker">
                <video
                  ref={videoRef}
                  className="thumbnail-picker-video"
                  crossOrigin="anonymous"
                  controls={false}
                  preload="metadata"
                  src={scrubVideoUrl ?? undefined}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setScrubMs(videoRef.current.currentTime * 1000);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current && durationSeconds) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                />

                <div className="thumbnail-picker-controls">
                  <input
                    type="range"
                    min={0}
                    max={maxDurationMs || 1000}
                    step={100}
                    value={scrubMs}
                    onChange={(e) => {
                      const ms = Number(e.target.value);
                      setScrubMs(ms);
                      if (videoRef.current) {
                        videoRef.current.currentTime = ms / 1000;
                      }
                    }}
                    className="thumbnail-scrubber"
                    disabled={!durationSeconds}
                  />
                  <span className="thumbnail-time">{formatVideoDuration(scrubMs / 1000)}</span>
                  <button
                    type="button"
                    className="app-btn app-btn-outline app-btn-sm"
                    onClick={addPendingFrame}
                    disabled={!durationSeconds || isPending || !storageConfigured}
                  >
                    Add frame
                  </button>
                </div>

                <ul className="thumbnail-list">
                  {draftThumbnails.map((item) => (
                    <li key={item.key} className="thumbnail-item">
                      {item.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.previewUrl} alt="" className="thumbnail-preview" />
                      ) : (
                        <div className="thumbnail-preview thumbnail-preview--placeholder">
                          {formatVideoDuration(item.timestampMs / 1000)}
                        </div>
                      )}
                      <span>{formatVideoDuration(item.timestampMs / 1000)}</span>
                      <button
                        type="button"
                        className="thumbnail-remove"
                        onClick={() => removeDraftThumbnail(item.key)}
                        aria-label={`Remove thumbnail at ${formatVideoDuration(item.timestampMs / 1000)}`}
                        disabled={isPending}
                      >
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M18 6L6 18M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>

                <p className="thumbnail-count">
                  {selectedCount} / 4 selected
                  {selectedCount === 0 ? " · at least 1 required" : ""}
                </p>

                <button
                  type="button"
                  className="app-btn app-btn-primary"
                  onClick={handleSaveThumbnails}
                  disabled={isPending || selectedCount === 0 || !storageConfigured}
                >
                  Save thumbnails
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      <p className="exercise-back-link">
        <Link href="/dashboard/exercises">← Back to exercise library</Link>
      </p>
    </div>
  );
}

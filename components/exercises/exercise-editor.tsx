"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ExerciseStatus, PlaybackMode } from "@prisma/client";
import {
  saveExerciseThumbnails,
  syncExerciseVideoStatus,
  updateExerciseDetails,
} from "@/lib/actions/exercises";
import { ExerciseDeleteButton } from "@/components/exercises/exercise-delete-button";
import { formatVideoDuration, bunnyApiStatusLabel } from "@/lib/bunny/stream";

type Thumbnail = {
  id: string;
  timestampMs: number;
  sortOrder: number;
  bunnyThumbnailUrl: string | null;
};

type ExerciseEditorProps = {
  exercise: {
    id: string;
    name: string;
    status: ExerciseStatus;
    playbackMode: PlaybackMode;
    textDescription: string | null;
    durationSeconds: number | null;
    bunnyVideoId: string | null;
    embedUrl: string | null;
    scrubVideoUrl: string | null;
    programCount: number;
  };
  thumbnails: Thumbnail[];
  justUploaded?: boolean;
};

export function ExerciseEditor({
  exercise,
  thumbnails: initialThumbnails,
  justUploaded,
}: ExerciseEditorProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [name, setName] = useState(exercise.name);
  const [textDescription, setTextDescription] = useState(
    exercise.textDescription ?? "",
  );
  const [playbackMode, setPlaybackMode] = useState(exercise.playbackMode);
  const [status, setStatus] = useState(exercise.status);
  const [durationSeconds, setDurationSeconds] = useState(exercise.durationSeconds);
  const [savedThumbnails, setSavedThumbnails] = useState(initialThumbnails);
  const [pendingMs, setPendingMs] = useState<number[]>([]);
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
  const selectedCount = pendingMs.length || savedThumbnails.length;

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

    const interval = setInterval(syncStatus, 2000);
    void syncStatus();
    return () => clearInterval(interval);
  }, [status, syncStatus]);

  useEffect(() => {
    setSavedThumbnails(initialThumbnails);
  }, [initialThumbnails]);

  useEffect(() => {
    setEmbedUrl(exercise.embedUrl);
    setScrubVideoUrl(exercise.scrubVideoUrl);
  }, [exercise.embedUrl, exercise.scrubVideoUrl]);

  useEffect(() => {
    if (justUploaded) {
      setMessage(
        "Upload complete. Bunny is transcoding on their servers — preview typically appears in 15–60 seconds.",
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

  function handleSaveDetails() {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await updateExerciseDetails(exercise.id, {
        name: name.trim(),
        textDescription,
        playbackMode,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Changes saved.");
      router.refresh();
    });
  }

  function addPendingFrame() {
    if (pendingMs.length >= 4) {
      setError("You can save up to 4 thumbnails.");
      return;
    }
    const ms = Math.round(scrubMs);
    if (pendingMs.includes(ms)) return;
    setError("");
    setPendingMs((prev) => [...prev, ms].sort((a, b) => a - b));
  }

  function removePendingFrame(ms: number) {
    setPendingMs((prev) => prev.filter((value) => value !== ms));
  }

  function handleSaveThumbnails() {
    const timestamps = pendingMs.length
      ? pendingMs
      : savedThumbnails.map((thumb) => thumb.timestampMs);

    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await saveExerciseThumbnails(exercise.id, timestamps);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Thumbnails saved.");
      setPendingMs([]);
      router.refresh();
    });
  }

  return (
    <div className="exercise-editor">
      {message && <div className="form-success">{message}</div>}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

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
                  <strong>Bunny is transcoding…</strong>
                  <p>
                    Your upload finished in a couple of seconds. Bunny now encodes
                    multiple quality levels on their servers — even short clips often
                    take 30–90 seconds before preview is available.
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

          <div className="form-field">
            <span className="form-label">Playback mode</span>
            <div className="playback-mode-options">
              <label className="playback-mode-option">
                <input
                  type="radio"
                  name="playbackMode"
                  value="demo"
                  checked={playbackMode === "demo"}
                  onChange={() => setPlaybackMode("demo")}
                  disabled={isPending}
                />
                <span>
                  <strong>Demonstration</strong>
                  <span>Patient watches, then taps Next (recommended for rehab demos)</span>
                </span>
              </label>
              <label className="playback-mode-option">
                <input
                  type="radio"
                  name="playbackMode"
                  value="guided"
                  checked={playbackMode === "guided"}
                  onChange={() => setPlaybackMode("guided")}
                  disabled={isPending}
                />
                <span>
                  <strong>Guided follow-along</strong>
                  <span>Patient moves together with the video in real time</span>
                </span>
              </label>
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

      {canScrub && exercise.bunnyVideoId && (
        <section className="panel exercise-editor-section">
          <h2 className="exercise-section-title">Thumbnails</h2>
          <p className="exercise-section-sub">
            Scrub the preview and capture up to 4 frames for PDFs and program previews.
          </p>

          <div className="thumbnail-picker">
            <video
              ref={videoRef}
              className="thumbnail-picker-video"
              crossOrigin="anonymous"
              controls
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
                disabled={!durationSeconds || isPending}
              >
                Add frame
              </button>
            </div>

            <ul className="thumbnail-list">
              {(pendingMs.length ? pendingMs : savedThumbnails.map((t) => t.timestampMs)).map(
                (ms) => {
                  const saved = savedThumbnails.find((t) => t.timestampMs === ms);
                  const url = saved?.bunnyThumbnailUrl;
                  return (
                    <li key={ms} className="thumbnail-item">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="" className="thumbnail-preview" />
                      ) : (
                        <div className="thumbnail-preview thumbnail-preview--placeholder">
                          {formatVideoDuration(ms / 1000)}
                        </div>
                      )}
                      <span>{formatVideoDuration(ms / 1000)}</span>
                      {pendingMs.length > 0 && (
                        <button
                          type="button"
                          className="thumbnail-remove"
                          onClick={() => removePendingFrame(ms)}
                          aria-label="Remove frame"
                        >
                          ×
                        </button>
                      )}
                    </li>
                  );
                },
              )}
            </ul>

            <p className="thumbnail-count">{selectedCount} / 4 selected</p>

            <button
              type="button"
              className="app-btn app-btn-primary"
              onClick={handleSaveThumbnails}
              disabled={isPending || selectedCount === 0}
            >
              Save thumbnails
            </button>
          </div>
        </section>
      )}

      <section className="panel exercise-editor-section exercise-danger-zone">
        <h2 className="exercise-section-title">Delete exercise</h2>
        <p className="exercise-section-sub">
          Removes the exercise and its video from Bunny Stream. This cannot be undone.
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

      <p className="exercise-back-link">
        <Link href="/dashboard/exercises">← Back to exercise library</Link>
      </p>
    </div>
  );
}

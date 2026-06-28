"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeExerciseAudio } from "@/lib/actions/exercises";

const ACCEPTED_AUDIO =
  "audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/m4a,audio/wav,audio/webm,audio/ogg";

/** Match server route limits (4 MB prod, 20 MB dev). */
const MAX_AUDIO_BYTES =
  process.env.NODE_ENV === "development" ? 20 * 1024 * 1024 : 4 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ExerciseAudioUploadProps = {
  exerciseId: string;
  audioUrl: string | null;
  storageConfigured: boolean;
};

export function ExerciseAudioUpload({
  exerciseId,
  audioUrl: initialAudioUrl,
  storageConfigured,
}: ExerciseAudioUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [audioUrl, setAudioUrl] = useState(initialAudioUrl);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();

  const busy = uploading || isPending;

  useEffect(() => {
    setAudioUrl(initialAudioUrl);
  }, [initialAudioUrl]);

  async function uploadFile(file: File) {
    if (!storageConfigured) {
      setError("Audio upload is not configured on this server.");
      return;
    }

    if (file.size > MAX_AUDIO_BYTES) {
      setError(`File too large (max ${formatBytes(MAX_AUDIO_BYTES)}).`);
      return;
    }

    setError("");
    setMessage("");
    setUploading(true);

    try {
      const response = await fetch(`/api/exercises/${exerciseId}/upload-audio`, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "Content-Length": String(file.size),
        },
        body: file,
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? `Upload failed (${response.status})`);
      }

      setMessage("Audio description saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(file: File | null) {
    if (!file) return;
    void uploadFile(file);
  }

  function handleRemove() {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await removeExerciseAudio(exerciseId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAudioUrl(null);
      setMessage("Audio description removed.");
      router.refresh();
    });
  }

  if (!storageConfigured) {
    return (
      <div className="audio-upload audio-upload--disabled">
        <p>
          Add <code>BUNNY_STORAGE_ZONE_NAME</code>, <code>BUNNY_STORAGE_API_KEY</code>, and{" "}
          <code>BUNNY_STORAGE_HOSTNAME</code> to enable spoken audio descriptions.
        </p>
      </div>
    );
  }

  return (
    <div className="audio-upload">
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {message && <div className="form-success">{message}</div>}

      {audioUrl ? (
        <div className="audio-upload-player">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls preload="metadata" src={audioUrl} className="audio-upload-control" />
          <div className="audio-upload-actions">
            <button
              type="button"
              className="app-btn app-btn-outline app-btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              Replace
            </button>
            <button
              type="button"
              className="app-btn app-btn-outline app-btn-sm"
              onClick={handleRemove}
              disabled={busy}
            >
              {isPending ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`upload-dropzone audio-upload-dropzone${dragOver ? " is-dragover" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFileChange(e.dataTransfer.files[0] ?? null);
          }}
          disabled={busy}
        >
          {uploading ? (
            <>
              <strong>Uploading audio…</strong>
              <span>Please wait</span>
            </>
          ) : (
            <>
              <strong>Upload spoken description</strong>
              <span>
                MP3, M4A, WAV, WebM, or OGG — max {formatBytes(MAX_AUDIO_BYTES)}
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_AUDIO}
        className="sr-only"
        onChange={(e) => {
          handleFileChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as tus from "tus-js-client";
import {
  confirmExerciseUploadReceived,
  prepareExerciseUpload,
} from "@/lib/actions/exercises";
import { shouldUseDirectUpload } from "@/lib/bunny/upload-strategy";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"];
const MAX_BYTES = 500 * 1024 * 1024;
const CHUNK_SIZE = 5 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tusErrorMessage(error: tus.DetailedError): string {
  const status = error.originalResponse?.getStatus();
  if (status === 401) {
    return "Upload rejected by Bunny (401). Check BUNNY_STREAM_API_KEY and BUNNY_STREAM_LIBRARY_ID.";
  }
  if (status) {
    return `Upload failed (HTTP ${status}). ${error.message}`;
  }
  return error.message || "Upload failed.";
}

async function waitForBunnyReceipt(
  exerciseId: string,
  maxAttempts = 3,
): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await confirmExerciseUploadReceived(exerciseId);
    if (result.ok) return null;
    if (!result.error.includes("did not receive")) return result.error;
    await delay(1000);
  }
  return null;
}

async function uploadViaServer(
  exerciseId: string,
  file: File,
): Promise<void> {
  const response = await fetch(`/api/exercises/${exerciseId}/upload-video`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "Content-Length": String(file.size),
    },
    body: file,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `Server upload failed (${response.status})`);
  }
}

async function uploadViaTus(
  file: File,
  title: string,
  tusConfig: {
    endpoint: string;
    authorizationSignature: string;
    authorizationExpire: number;
    libraryId: string;
    videoId: string;
  },
  onProgress: (percent: number) => void,
): Promise<void> {
  const filetype = file.type || "video/mp4";

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: tusConfig.endpoint,
      chunkSize: CHUNK_SIZE,
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
      removeFingerprintOnSuccess: true,
      fingerprint: () =>
        Promise.resolve(
          `bunny-${tusConfig.videoId}-${file.name}-${file.size}-${file.lastModified}`,
        ),
      headers: {
        AuthorizationSignature: tusConfig.authorizationSignature,
        AuthorizationExpire: String(tusConfig.authorizationExpire),
        VideoId: tusConfig.videoId,
        LibraryId: tusConfig.libraryId,
      },
      metadata: {
        filetype,
        title: file.name || title,
      },
      onError: (err) => reject(err),
      onProgress: (bytesUploaded, bytesTotal) => {
        onProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess: () => resolve(),
    });

    upload.start();
  });
}

export function ExerciseUploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "preparing" | "uploading">("idle");
  const [progress, setProgress] = useState(0);

  function pickFile(next: File | null) {
    setError("");
    if (!next) {
      setFile(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(next.type) && !next.type.startsWith("video/")) {
      setError("Please choose an MP4, MOV, or WebM video.");
      return;
    }

    if (next.size > MAX_BYTES) {
      setError(`Video must be under ${formatBytes(MAX_BYTES)}.`);
      return;
    }

    setFile(next);
    if (!name.trim()) {
      const base = next.name.replace(/\.[^.]+$/, "");
      setName(base);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name.trim()) {
      setError("Enter a name and choose a video file.");
      return;
    }

    setError("");
    setPhase("preparing");
    setProgress(0);

    const prepared = await prepareExerciseUpload(name.trim());
    if (!prepared.ok) {
      setError(prepared.error);
      setPhase("idle");
      return;
    }

    setPhase("uploading");

    try {
      if (shouldUseDirectUpload(file.size)) {
        await uploadViaServer(prepared.exerciseId, file);
        setProgress(100);
      } else {
        await uploadViaTus(file, name.trim(), prepared.tus, setProgress);
        // TUS: brief check that Bunny registered the file (non-blocking cap)
        const confirmError = await waitForBunnyReceipt(prepared.exerciseId, 3);
        if (confirmError) {
          setError(confirmError);
        }
      }

      router.push(`/dashboard/exercises/${prepared.exerciseId}?uploaded=1`);
      router.refresh();
    } catch (err) {
      if (err instanceof tus.DetailedError) {
        setError(tusErrorMessage(err));
      } else {
        setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      }
      setPhase("idle");
    }
  }

  const busy = phase === "preparing" || phase === "uploading";

  return (
    <form className="exercise-upload-form" onSubmit={handleSubmit}>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="form-field">
        <label className="form-label" htmlFor="exercise-name">
          Exercise name
        </label>
        <input
          id="exercise-name"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Goblet Squat"
          required
          disabled={busy}
        />
      </div>

      <div className="form-field">
        <span className="form-label">Demonstration video</span>
        <div
          className={`upload-dropzone${dragOver ? " is-dragover" : ""}${file ? " has-file" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pickFile(e.dataTransfer.files[0] ?? null);
          }}
          onClick={() => !busy && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/*"
            hidden
            disabled={busy}
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <>
              <strong>{file.name}</strong>
              <span>{formatBytes(file.size)}</span>
              {!busy && (
                <button
                  type="button"
                  className="upload-dropzone-change"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  Change file
                </button>
              )}
            </>
          ) : (
            <>
              <strong>Drop your video here</strong>
              <span>MP4, MOV, or WebM · up to {formatBytes(MAX_BYTES)}</span>
              <span className="upload-dropzone-hint">
                Record 3–5 full repetitions at natural tempo
              </span>
            </>
          )}
        </div>
      </div>

      {(phase === "uploading") && (
        <div className="upload-progress" aria-live="polite">
          <div className="upload-progress-bar">
            <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="upload-progress-label">Uploading… {progress}%</span>
        </div>
      )}

      <button
        type="submit"
        className="app-btn app-btn-primary"
        disabled={busy || !file}
        style={{ width: "100%" }}
      >
        {phase === "preparing"
          ? "Preparing…"
          : phase === "uploading"
            ? "Uploading…"
            : "Upload exercise"}
      </button>
    </form>
  );
}

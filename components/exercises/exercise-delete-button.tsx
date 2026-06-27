"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteExercise } from "@/lib/actions/exercises";

type ExerciseDeleteButtonProps = {
  exerciseId: string;
  exerciseName: string;
  programCount: number;
  variant?: "table" | "panel";
};

export function ExerciseDeleteButton({
  exerciseId,
  exerciseName,
  programCount,
  variant = "table",
}: ExerciseDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const inUse = programCount > 0;
  const inUseTitle =
    programCount === 1
      ? "Used in 1 program — remove it from that program before deleting"
      : `Used in ${programCount} programs — remove it from those programs before deleting`;

  function handleDelete() {
    if (inUse) return;

    if (
      !window.confirm(
        `Delete "${exerciseName}" permanently? This removes the video from Bunny and your library.`,
      )
    ) {
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await deleteExercise(exerciseId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const buttonClass =
    variant === "panel"
      ? "app-btn app-btn-outline exercise-delete-btn"
      : "app-btn app-btn-ghost app-btn-sm table-delete-btn";

  return (
    <div className="exercise-delete-cell">
      <button
        type="button"
        className={buttonClass}
        onClick={handleDelete}
        disabled={inUse || isPending}
        title={inUse ? inUseTitle : "Delete exercise"}
        aria-label={inUse ? inUseTitle : `Delete ${exerciseName}`}
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
      {error && (
        <span className="table-delete-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

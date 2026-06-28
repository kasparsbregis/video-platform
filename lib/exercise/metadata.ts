import type {
  ExerciseDifficulty,
  ExerciseType,
  PerformanceType,
} from "@prisma/client";

export const PERFORMANCE_TYPE_OPTIONS: {
  value: PerformanceType;
  label: string;
  hint: string;
}[] = [
  {
    value: "general",
    label: "General",
    hint: "One demonstration for the exercise",
  },
  {
    value: "both_sides",
    label: "Both sides",
    hint: "Left and right (or bilateral instruction)",
  },
];

export const EXERCISE_TYPE_OPTIONS: {
  value: ExerciseType;
  label: string;
}[] = [
  { value: "mobility", label: "Mobility" },
  { value: "stretch", label: "Stretch" },
  { value: "stability", label: "Stability" },
  { value: "balance", label: "Balance" },
];

export const DIFFICULTY_OPTIONS: {
  value: ExerciseDifficulty;
  label: string;
}[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function formatPerformanceType(value: PerformanceType | null): string {
  return PERFORMANCE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}

export function formatExerciseType(value: ExerciseType | null): string {
  return EXERCISE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}

export function formatDifficulty(value: ExerciseDifficulty | null): string {
  return DIFFICULTY_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}

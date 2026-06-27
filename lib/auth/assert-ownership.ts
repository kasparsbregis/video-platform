import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function getExerciseForUser(exerciseId: string, userId: string) {
  return prisma.exercise.findFirst({
    where: { id: exerciseId, userId },
    include: {
      thumbnails: { orderBy: { sortOrder: "asc" } },
      _count: { select: { programs: true } },
    },
  });
}

export async function requireExerciseForUser(exerciseId: string, userId: string) {
  const exercise = await getExerciseForUser(exerciseId, userId);
  if (!exercise) notFound();
  return exercise;
}

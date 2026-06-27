import { prisma } from "@/lib/prisma";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function getDashboardOverview(userId: string) {
  const [exercises, programs] = await Promise.all([
    prisma.exercise.findMany({
      where: { userId },
      include: { _count: { select: { thumbnails: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.program.findMany({
      where: { userId },
      include: { _count: { select: { exercises: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const publishedPrograms = programs.filter((p) => p.status === "published");

  return {
    exerciseCount: exercises.length,
    programCount: programs.length,
    publishedCount: publishedPrograms.length,
    draftCount: programs.length - publishedPrograms.length,
    recentPrograms: programs.slice(0, 4).map((program) => ({
      id: program.id,
      name: program.name,
      exerciseCount: program._count.exercises,
      status: program.status as "draft" | "published",
      updatedAt: formatDate(program.updatedAt),
    })),
    recentExercises: exercises.slice(0, 4).map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      videoDuration: exercise.status === "ready" ? "Ready" : exercise.status,
      hasAudio: Boolean(exercise.audioStoragePath),
      hasText: Boolean(exercise.textDescription),
      thumbnails: exercise._count.thumbnails,
      updatedAt: formatDate(exercise.updatedAt),
    })),
  };
}

export async function getProgramsForUser(userId: string) {
  const programs = await prisma.program.findMany({
    where: { userId },
    include: { _count: { select: { exercises: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return programs.map((program) => ({
    id: program.id,
    name: program.name,
    exerciseCount: program._count.exercises,
    status: program.status as "draft" | "published",
    updatedAt: formatDate(program.updatedAt),
  }));
}

export async function getExercisesForUser(userId: string) {
  const exercises = await prisma.exercise.findMany({
    where: { userId },
    include: { _count: { select: { thumbnails: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    videoDuration: exercise.status === "ready" ? "Ready" : exercise.status,
    hasAudio: Boolean(exercise.audioStoragePath),
    hasText: Boolean(exercise.textDescription),
    thumbnails: exercise._count.thumbnails,
    updatedAt: formatDate(exercise.updatedAt),
  }));
}

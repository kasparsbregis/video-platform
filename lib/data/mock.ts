export type ActivityItem = {
  id: string;
  type: "upload" | "publish" | "pdf" | "edit";
  title: string;
  detail: string;
  time: string;
};

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "act-1",
    type: "publish",
    title: "Program published",
    detail: "Week 1 — Lower Body",
    time: "2 hours ago",
  },
  {
    id: "act-2",
    type: "upload",
    title: "Exercise uploaded",
    detail: "Goblet Squat · 4 thumbnails saved",
    time: "Yesterday",
  },
  {
    id: "act-3",
    type: "pdf",
    title: "PDF generated",
    detail: "Return to Run — Week 3",
    time: "Jun 22",
  },
  {
    id: "act-4",
    type: "edit",
    title: "Program updated",
    detail: "Post-Op Knee — Phase 2",
    time: "Jun 19",
  },
];

export type Exercise = {
  id: string;
  name: string;
  videoDuration: string;
  hasAudio: boolean;
  hasText: boolean;
  thumbnails: number;
  updatedAt: string;
};

export type Program = {
  id: string;
  name: string;
  exerciseCount: number;
  updatedAt: string;
  status: "draft" | "published";
};

export const MOCK_EXERCISES: Exercise[] = [
  {
    id: "ex-1",
    name: "Goblet Squat",
    videoDuration: "18 s",
    hasAudio: true,
    hasText: true,
    thumbnails: 4,
    updatedAt: "2025-06-20",
  },
  {
    id: "ex-2",
    name: "Barbell Row",
    videoDuration: "22 s",
    hasAudio: true,
    hasText: true,
    thumbnails: 3,
    updatedAt: "2025-06-18",
  },
  {
    id: "ex-3",
    name: "Single-Leg RDL",
    videoDuration: "16 s",
    hasAudio: false,
    hasText: true,
    thumbnails: 2,
    updatedAt: "2025-06-12",
  },
  {
    id: "ex-4",
    name: "Side Plank",
    videoDuration: "30 s",
    hasAudio: true,
    hasText: true,
    thumbnails: 1,
    updatedAt: "2025-06-08",
  },
];

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "pg-1",
    name: "Week 1 — Lower Body",
    exerciseCount: 5,
    updatedAt: "2025-06-22",
    status: "published",
  },
  {
    id: "pg-2",
    name: "Post-Op Knee — Phase 2",
    exerciseCount: 8,
    updatedAt: "2025-06-19",
    status: "draft",
  },
  {
    id: "pg-3",
    name: "Return to Run — Week 3",
    exerciseCount: 6,
    updatedAt: "2025-06-15",
    status: "published",
  },
];

/** Re-export database types from central lib/types */
export type {
  ProjectAmenity,
  Project,
  ProjectModel,
  InventoryUnit,
  OverviewForm,
  ProjectStatus,
  ProjectStage,
  ProjectType,
} from "@/lib/types";

export const LANDMARK_CATEGORIES = [
  "Hospitals",
  "Schools",
  "Leisure Parks",
  "Shops",
  "Landmarks",
] as const;

export const EMPTY_LANDMARKS: Record<string, string[]> = Object.fromEntries(
  LANDMARK_CATEGORIES.map((c) => [c, []])
);

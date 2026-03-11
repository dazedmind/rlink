export type Project = {
  id: string;
  projectCode: string;
  projectName: string;
  status: string | null;
  location: string | null;
  stage: string | null;
  type: string;
  photoUrl: string | null;
  logoUrl: string | null;
  mapLink: string | null;
  accentColor: string | null;
  description: string | null;
  dhsudNumber: string | null;
  address: string | null;
  completionDate: string | null;
  salesOffice: string | null;
  amenities: unknown[];
  landmarks: unknown[];
};

export type ProjectStatus = "sold" | "available" | "on_hold";
export type ProjectStage =
  | "pre_selling"
  | "ongoing_development"
  | "coming_soon"
  | "completed"
  | "cancelled";
export type ProjectType = "houselot" | "condo" | "townhouse";

export type ProjectModel = {
  id: string;
  modelName: string;
  description: string | null;
  bathroom: number;
  kitchen: number;
  carport: number;
  serviceArea: number;
  livingRoom: number;
  lotArea: number;
  floorArea: number;
  lotClass: string;
  photoUrl: string | null;
};

export type InventoryUnit = {
  id: string;
  modelId: string;
  inventoryCode: string;
  block: number;
  lot: number;
  sellingPrice: number;
  isFeatured: boolean;
};

export type OverviewForm = {
  projectCode: string;
  projectName: string;
  status: string;
  location: string;
  stage: string;
  type: string;
  photoUrl: string;
  logoUrl: string;
  mapLink: string;
  accentColor: string;
  description: string;
  dhsudNumber: string;
  address: string;
  completionDate: string;
  salesOffice: string;
  amenities: string[];
  landmarks: string[];
};

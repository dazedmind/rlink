/** CMS module: articles, careers, projects, promos, and related enums/types. */

// --- Careers ---
export const careerStatus = {
  hiring: "Hiring",
  closed: "Closed",
  archived: "Archived",
} as const;

export type CareerStatus = (typeof careerStatus)[keyof typeof careerStatus];

export const careerStatusMeta: Record<string, { label: string; className: string }> = {
  hiring: { label: "Hiring", className: "bg-success/10 text-success" },
  closed: { label: "Closed", className: "bg-foreground/10 text-muted-foreground" },
  archived: { label: "Archived", className: "bg-primary/10 text-primary" },
};

export const location = {
  "Quezon City (Head Office)": "Quezon City (Head Office)",
  "Lipa, Batangas": "Lipa, Batangas",
  "Angeles, Pampanga": "Angeles, Pampanga",
} as const;
export type Location = (typeof location)[keyof typeof location];

export type Career = {
  id: number;
  position: string;
  slug: string;
  department: string;
  location: string;
  jobDescription: string;
  purpose: string;
  responsibilities: string;
  qualifications: string;
  requiredSkills: string;
  status: CareerStatus;
  createdAt: string;
  updatedAt: string;
};

// --- Projects (listings / studio) ---
export const projectStage = {
  pre_selling: "Pre-Selling",
  ongoing_development: "Ongoing Development",
  coming_soon: "Coming Soon",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export type ProjectStage = (typeof projectStage)[keyof typeof projectStage];

export const projectStatus = {
  available: "Available",
  sold: "Sold",
  on_hold: "On Hold",
} as const;

export type ProjectStatus = (typeof projectStatus)[keyof typeof projectStatus];

export const projectType = {
  houselot: "House & Lot",
  condo: "Condominium",
  townhouse: "Townhouse",
} as const;
export type ProjectType = (typeof projectType)[keyof typeof projectType];

export const projectStatusMeta: Record<string, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-emerald-500/10 text-success" },
  sold: { label: "Sold Out", className: "bg-foreground/10 text-muted-foreground" },
  on_hold: { label: "On Hold", className: "bg-warning/10 text-warning" },
};
export const projectStageMeta: Record<string, { label: string; className: string }> = {
  pre_selling: { label: "Pre-Selling", className: "bg-primary/10 text-primary" },
  ongoing_development: { label: "Ongoing Development", className: "bg-purple-500/10 text-purple-700" },
  coming_soon: { label: "Coming Soon", className: "bg-secondary/10 text-secondary" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", className: "bg-foreground/10 text-muted-foreground" },
};

export const projectTypeMeta: Record<string, { label: string }> = {
  houselot: { label: "House & Lot" },
  condo: { label: "Condominium" },
  townhouse: { label: "Townhouse" },
};

export type ProjectAmenity = {
  name: string;
  photoUrl?: string;
};

export type Project = {
  id: string;
  projectCode: string;
  projectName: string;
  slug?: string;
  status?: string | null;
  location?: string | null;
  stage?: string | null;
  type?: string;
  photoUrl?: string | null;
  logoUrl?: string | null;
  mapLink?: string | null;
  accentColor?: string | null;
  description?: string | null;
  dhsudNumber?: string | null;
  address?: string | null;
  completionDate?: string | null;
  salesOffice?: string | null;
  amenities?: ProjectAmenity[];
  landmarks?: unknown[];
  createdAt?: string | null;
  updatedAt?: string | null;
};

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
  slug: string;
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
  landmarks: Record<string, string[]>;
};

export type GalleryImage = {
  id: string;
  projectId: string;
  modelId: string | null;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  projectId: string;
  modelId: string;
  inventoryCode: string;
  modelName: string;
  block: number;
  lot: number;
  soldTo: number | null;
  sellingPrice: number;
  isFeatured?: boolean;
};

// --- Promos ---
export const promoStatus = {
  draft: "Draft",
  active: "Active",
  expired: "Expired",
} as const;
export type PromoStatus = (typeof promoStatus)[keyof typeof promoStatus];

export const promoStatusMeta: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-foreground/10 text-muted-foreground" },
  active: { label: "Active", className: "bg-success/10 text-success" },
  expired: { label: "Expired", className: "bg-foreground/10 text-muted-foreground" },
};

export type Promo = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

// --- Articles / news ---
export const articleType = {
  news: "News",
  blog: "Blog",
  announcement: "Announcement",
} as const;
export type ArticleType = (typeof articleType)[keyof typeof articleType];

export const articleTypeValues = ["news", "blog", "announcement"] as const;

export type Article = {
  id: number;
  headline: string;
  slug: string;
  body: string;
  publishDate: string;
  tags: string[];
  type: ArticleType;
  photoUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Announcement = {
  id: number;
  headline: string;
  body: string;
  acknowledgeCount: number;
  /** Present on API list responses for the signed-in user. */
  acknowledgedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
};
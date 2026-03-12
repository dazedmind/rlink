export type GalleryImage = {
  id: string;
  projectId: string;
  modelId: string | null;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
};

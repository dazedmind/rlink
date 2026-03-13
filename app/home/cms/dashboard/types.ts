export type SiteStatus = "operational" | "degraded" | "checking";

export type Stats = {
  projects: number;
  articles: number;
  promos: number;
  careers: number;
};

export type RecentArticle = {
  id: number;
  headline: string;
  type: string;
  publishDate: string;
};

export type RecentPromo = {
  id: number;
  title: string;
  status: string;
};

export type RecentCareer = {
  id: number;
  position: string;
  status: string;
};

export type RecentData = {
  articles: RecentArticle[];
  promos: RecentPromo[];
  careers: RecentCareer[];
};

export type ActivityItem = {
  id: number;
  color: "blue" | "purple" | "green" | "amber";
  label: string;
  detail: string;
  time: string;
};

export type CMSDashboardProps = {
  onNavigate?: (tab: string) => void;
};

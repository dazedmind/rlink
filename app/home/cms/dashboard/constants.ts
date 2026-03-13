import {
  Building2,
  FileText,
  Megaphone,
  Briefcase,
} from "lucide-react";
import type { ActivityItem } from "./types";

export const QUICK_LINKS = [
  { label: "Projects", url: "listings/projects", icon: Building2, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { label: "News & Articles", url: "listings/news", icon: FileText, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  { label: "Promos", url: "listings/promos", icon: Megaphone, iconBg: "bg-amber-50", iconColor: "text-amber-700" },
  { label: "Careers", url: "listings/careers", icon: Briefcase, iconBg: "bg-green-50", iconColor: "text-green-700" },
] as const;

export const ACTIVITY_FEED: ActivityItem[] = [
  { id: 1, color: "blue", label: "Article published", detail: "RLink Q1 Market Report went live", time: "2h ago" },
  { id: 2, color: "green", label: "Promo activated", detail: "Summer Move-in Special is now live", time: "5h ago" },
  { id: 3, color: "purple", label: "Job posting closed", detail: "Digital Marketing Specialist", time: "Yesterday" },
  { id: 4, color: "blue", label: "Article drafted", detail: "Top 5 Investment Spots in BGC", time: "Yesterday" },
  { id: 5, color: "green", label: "New career opened", detail: "Senior Property Consultant", time: "Mar 9" },
];

export const ACTIVITY_DOT_COLOR: Record<ActivityItem["color"], string> = {
  blue: "bg-blue-400",
  purple: "bg-violet-400",
  green: "bg-green-500",
  amber: "bg-amber-400",
};

export const STAT_CARD_CONFIG = [
  { label: "Projects", url: "listings/projects", icon: Building2, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { label: "Articles", url: "listings/news", icon: FileText, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  { label: "Promos", url: "listings/promos", icon: Megaphone, iconBg: "bg-amber-50", iconColor: "text-amber-700" },
  { label: "Careers", url: "listings/careers", icon: Briefcase, iconBg: "bg-green-50", iconColor: "text-green-700" },
] as const;

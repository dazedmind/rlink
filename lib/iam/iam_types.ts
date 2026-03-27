/** IAM / user management: org, roles, activity logs. */

export const department = {
  construction: "Construction Management",
  design: "Architecture & Design",
  hr: "Human Resources",
  it: "Information Technology",
  office_president: "Office of the President",
  project_development: "Project Development",
  property_management: "Property Management",
  sales_admin: "Sales Admin",
  sales_marketing: "Sales & Marketing",
  sales_documentation: "Sales Documentation",
};

export type Department = (typeof department)[keyof typeof department];

export const userRole = {
  admin: "Admin",
  user: "User",
} as const;
export type UserRole = (typeof userRole)[keyof typeof userRole];

export const userRoleMeta: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-info/10 text-info" },
  user: { label: "User", className: "bg-muted-foreground/10 text-muted-foreground" },
};

export const deptBadgeClass: Record<string, string> = {
  construction: "bg-amber-600/10 text-amber-800 font-bold",
  design: "bg-violet-600/10 text-violet-700 font-bold",
  hr: "bg-emerald-600/10 text-emerald-700 font-bold",
  it: "bg-cyan-600/10 text-cyan-700 font-bold",
  office_president: "bg-rose-600/10 text-rose-700 font-bold",
  project_development: "bg-orange-600/10 text-orange-700",
  property_management: "bg-lime-600/10 text-lime-700 font-bold",
  sales_admin: "bg-sky-600/10 text-sky-700 font-bold",
  sales_marketing: "bg-fuchsia-600/10 text-fuchsia-700 font-bold",
  sales_documentation: "bg-teal-600/10 text-teal-700 font-bold",
};

export const userStatus = {
  active: "Active",
  disabled: "Disabled",
  locked: "Locked",
  inactive: "Inactive",
} as const;
export type UserStatus = (typeof userStatus)[keyof typeof userStatus];

export const userStatusMeta: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  disabled: { label: "Disabled", className: "bg-red-50 text-red-700 border border-red-200" },
  locked: { label: "Locked", className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  inactive: { label: "Inactive", className: "bg-gray-50 text-gray-700 border border-gray-200" },
};

export const activityStatus = {
  success: "Success",
  error: "Error",
} as const;
export type ActivityStatus = (typeof activityStatus)[keyof typeof activityStatus];

export const activityStatusMeta: Record<string, { label: string; className: string }> = {
  success: { label: "Success", className: "bg-success/10 text-success" },
  error: { label: "Error", className: "bg-destructive/10 text-destructive" },
};

export type ActivityLogRecord = {
  id: string;
  userId: string;
  activity: string;
  ipAddress: string;
  userAgent: string;
  status: ActivityStatus;
  createdAt: string;
  userName?: string | null;
  userEmail?: string | null;
};

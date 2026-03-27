/** App-wide: in-app notifications. */

export const notificationType = {
  info: "Info",
  success: "Success",
  error: "Error",
  warning: "Warning",
} as const;
export type NotificationType = (typeof notificationType)[keyof typeof notificationType];

export const notificationTypeMeta: Record<string, { label: string; className: string }> = {
  info: { label: "Info", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  success: { label: "Success", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  error: { label: "Error", className: "bg-red-50 text-red-700 border border-red-200" },
  warning: { label: "Warning", className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
};

export type Notification = {
  id: number;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

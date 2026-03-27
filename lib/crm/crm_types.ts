/** CRM module: leads, reservations, inquiries, and related enums/types. */

export const leadStatus = {
  open: "Open",
  ongoing: "Ongoing",
  follow_up: "Follow-Up",
  no_response: "No Response",
  ineligible: "Ineligible",
  won: "Won",
  lost: "Lost",
} as const;
export type LeadStatus = (typeof leadStatus)[keyof typeof leadStatus];

export const leadStage = {
  lead: "Lead",
  qualified: "Qualified",
  presented: "Presented",
  viewed: "Viewed",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
} as const;

export type LeadStage = (typeof leadStage)[keyof typeof leadStage];

export const leadNextAction = {
  call: "Call Client",
  message: "Send Message",
  email: "Send Email",
  followup: "Follow Up",
  schedule_presentation: "Schedule Presentation",
  tripping: "Schedule Viewing / Tripping",
  computation: "Send Proposal / Computation",
  reservation: "Reservation Processing",
  documentation: "Documentation Processing",
} as const;

export type LeadNextAction = (typeof leadNextAction)[keyof typeof leadNextAction];

export const leadSource = {
  ads: "Ads",
  organic_fb: "Organic - FB",
  organic_ig: "Organic - IG",
  tiktok: "Organic - TikTok",
  website: "Website",
  email: "Email",
} as const;
export type LeadSource = (typeof leadSource)[keyof typeof leadSource];

export const leadStatusMeta: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-blue-600/10 text-primary" },
  ongoing: { label: "Ongoing", className: "bg-purple-600/10 text-purple-700" },
  follow_up: { label: "Follow-Up", className: "bg-yellow-600/10 text-yellow-700" },
  no_response: { label: "No Response", className: "bg-neutral-600/10 text-neutral-700" },
  ineligible: { label: "Ineligible", className: "bg-neutral-600/10 text-neutral-700" },
  won: { label: "Won", className: "bg-green-600/10 text-green-700" },
  lost: { label: "Lost", className: "bg-red-600/10 text-red-700" },
};

export type Lead = {
  id: number;
  leadId: string;
  status: LeadStatus;
  clientName: string;
  phone: string;
  email: string;
  inquiryDate: string;
  project: string;
  stage: LeadStage;
  nextAction: LeadNextAction;
};

export const reservationStatus = {
  pending: "For Validation",
  reserved: "Reserved",
  conditional: "Conditional",
  cancelled: "Cancelled",
  rejected: "Rejected",
  expired: "Expired",
  refunded: "Refunded",
} as const;

export type ReservationStatus = (typeof reservationStatus)[keyof typeof reservationStatus];

export const reservationStatusMeta: Record<string, { label: string; className: string }> = {
  pending: { label: "For Validation", className: "bg-blue-600/10 text-blue-700" },
  reserved: { label: "Reserved", className: "bg-green-600/10 text-green-700" },
  conditional: { label: "Conditional", className: "bg-yellow-600/10 text-yellow-700" },
  cancelled: { label: "Cancelled", className: "bg-red-600/10 text-red-700" },
  rejected: { label: "Rejected", className: "bg-neutral-600/10 text-neutral-700" },
  expired: { label: "Expired", className: "bg-neutral-600/10 text-neutral-700" },
  refunded: { label: "Refunded", className: "bg-purple-600/10 text-purple-700" },
};

/** CRM reservation row (sales). */
export type Reservation = {
  id: number;
  reservationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inventoryCode: string;
  projectName: string;
  block: number;
  lot: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
};

export const inquiryStatus = {
  read: "Read",
  unread: "Unread",
} as const;

export type InquiryStatus = (typeof inquiryStatus)[keyof typeof inquiryStatus];

export const inquiryStatusMeta: Record<string, { label: string; className: string }> = {
  read: { label: "Read", className: "bg-neutral-600/10 text-muted-foreground" },
  unread: { label: "Unread", className: "bg-blue-600/10 text-primary" },
};

export const inquirySubject = {
  buying: "Buying a Property",
  assistance: "Customer Care",
  partnership: "Business Partnership",
  career: "Career Opportunities",
  others: "Others",
} as const;

export type InquirySubject = (typeof inquirySubject)[keyof typeof inquirySubject];

export const inquirySource = {
  website: "Website",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "Linkedin",
  tiktok: "Tiktok",
  youtube: "Youtube",
  others: "Others",
} as const;

export type InquirySource = (typeof inquirySource)[keyof typeof inquirySource];

export type Inquiry = {
  id: number;
  inquiryId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  status: string;
  createdAt: string;
};

/** Newsletter module: campaigns and subscribers. */

export type Campaign = {
  id: number;
  name: string;
  subject: string;
  previewLine?: string;
  body?: string;
  status: string;
  recipients: number;
  openRate: number;
  clickRate: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const campaignStatus = {
  draft: "Draft",
  scheduled: "Scheduled",
  sent: "Sent",
} as const;
export type CampaignStatus = (typeof campaignStatus)[keyof typeof campaignStatus];

export const campaignStatusMeta: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-600/10 text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-yellow-600/10 text-secondary-fg" },
  sent: { label: "Sent", className: "bg-blue-600/10 text-primary" },
};

export type Subscriber = {
  id: number;
  email: string;
  status: string;
  createdAt: string;
};

export const subscriberStatus = {
  subscribed: "Subscribed",
  unsubscribed: "Unsubscribed",
} as const;
export type SubscriberStatus = (typeof subscriberStatus)[keyof typeof subscriberStatus];

export const subscriberStatusMeta: Record<string, { label: string; className: string }> = {
  subscribed: { label: "Subscribed", className: "bg-green-600/10 text-green-700 px-2 p-1 rounded-md" },
  unsubscribed: { label: "Unsubscribed", className: "bg-neutral-600/10 text-neutral-700 px-2 p-1 rounded-md" },
};

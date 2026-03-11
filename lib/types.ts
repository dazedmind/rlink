import { announcements } from "@/db/schema";

export const leadStatus = {
    open: 'Open',
    ongoing: 'Ongoing',
    follow_up: 'Follow-Up',
    no_response: 'No Response',
    ineligible: 'Ineligible',
    won: 'Won',
    lost: 'Lost',
} as const;
export type LeadStatus = (typeof leadStatus)[keyof typeof leadStatus];

export const leadStage = {
    lead: 'Lead',
    qualified: 'Qualified',
    presented: 'Presented',
    viewed: 'Viewed',
    proposal_sent: 'Proposal Sent',
    negotiation: 'Negotiation',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost',
} as const;

export type LeadStage = (typeof leadStage)[keyof typeof leadStage];


export const leadNextAction = {
    call: 'Call Client',
    message: 'Send Message',
    email: 'Send Email',
    followup: 'Follow Up',
    schedule_presentation: 'Schedule Presentation',
    tripping: 'Schedule Viewing / Tripping',
    computation: 'Send Proposal / Computation',
    reservation: 'Reservation Processing',
    documentation: 'Documentation Processing',
} as const;

export type LeadNextAction = (typeof leadNextAction)[keyof typeof leadNextAction];

export const reservationStatus = {
    pending: 'For Validation',
    reserved: 'Reserved',
    conditional: 'Conditional',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    expired: 'Expired',
    refunded: 'Refunded',
} as const;

export type ReservationStatus = (typeof reservationStatus)[keyof typeof reservationStatus];

export const inquiryStatus = {
    read: 'Read',
    unread: 'Unread',
} as const;

export type InquiryStatus = (typeof inquiryStatus)[keyof typeof inquiryStatus];

export const department = {
    marketing: 'Sales & Marketing Department',
    executive: 'Executive Department',
    engineering: 'Engineering Department',
    design: 'Design Department',
    hr: 'Human Resources Department',
    finance: 'Finance Department',
    it: 'Information Technology Department',
    legal: 'Legal Department',
    operations: 'Operations Department',
    customer_service: 'Customer Service Department',
    product: 'Product Management Department',
}

export type Department = (typeof department)[keyof typeof department];

export const inquirySubject = {
    buying: 'Buying a Property',
    assistance: 'Customer Care',
    partnership: 'Business Partnership',
    career: 'Career Opportunities',
    others: 'Others',
} as const;

export type InquirySubject = (typeof inquirySubject)[keyof typeof inquirySubject];

export const inquirySource = {
    website: 'Website',
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'Linkedin',
    tiktok: 'Tiktok',
    youtube: 'Youtube',
    others: 'Others',
} as const;

export type InquirySource = (typeof inquirySource)[keyof typeof inquirySource];

export const careerStatus = {
    hiring: 'Hiring',
    closed: 'Closed',
    archived: 'Archived',
} as const;

export type CareerStatus = (typeof careerStatus)[keyof typeof careerStatus];

/*
    PROJECT RELATED ENUMS
*/
export const projectStage = {
    pre_selling: 'Pre-Selling',
    ongoing_development: 'Ongoing Development',
    coming_soon: 'Coming Soon',
    completed: 'Completed',
    cancelled: 'Cancelled',
} as const;

export type ProjectStage = (typeof projectStage)[keyof typeof projectStage];

export const projectStatus = {
    available: 'Available',
    sold: 'Sold',
    on_hold: 'On Hold',
} as const;

export type ProjectStatus = (typeof projectStatus)[keyof typeof projectStatus];

export const projectType = {
    houselot: 'House & Lot',
    condo: 'Condominium',
    townhouse: 'Townhouse',
} as const;
export type ProjectType = (typeof projectType)[keyof typeof projectType];

/** Project status/stage/type meta for badge styling */
export const projectStatusMeta: Record<string, { label: string; className: string }> = {
    available: { label: 'Available', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    sold: { label: 'Sold Out', className: 'bg-red-50 text-red-700 border border-red-200' },
    on_hold: { label: 'On Hold', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
};
export const projectStageMeta: Record<string, { label: string; className: string }> = {
    pre_selling: { label: 'Pre-Selling', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
    ongoing_development: { label: 'Ongoing Development', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    coming_soon: { label: 'Coming Soon', className: 'bg-purple-50 text-purple-700 border border-purple-200' },
    completed: { label: 'Completed', className: 'bg-slate-100 text-slate-700 border border-slate-200' },
    cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-400 border border-red-100' },
};
export const projectTypeMeta: Record<string, { label: string }> = {
    houselot: { label: 'House & Lot' },
    condo: { label: 'Condominium' },
    townhouse: { label: 'Townhouse' },
};

/*
    PROMO
*/
export const promoStatus = {
    draft: 'Draft',
    active: 'Active',
    expired: 'Expired',
} as const;
export type PromoStatus = (typeof promoStatus)[keyof typeof promoStatus];
export const promoStatusMeta: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-slate-500 text-white border border-slate-200' },
    active: { label: 'Active', className: 'bg-emerald-500 text-white border border-emerald-200' },
    expired: { label: 'Expired', className: 'bg-red-500 text-white border border-red-100' },
};

/*
    ARTICLE / NEWS
*/
export const articleType = {
    news: 'News',
    blog: 'Blog',
    announcements : 'Announcements'
} as const;
export type ArticleType = (typeof articleType)[keyof typeof articleType];

/*
    LEAD SOURCE (distinct from inquirySource)
*/
export const leadSource = {
    ads: 'Ads',
    organic_fb: 'Organic - FB',
    organic_ig: 'Organic - IG',
    tiktok: 'Organic - TikTok',
    website: 'Website',
    email: 'Email',
} as const;
export type LeadSource = (typeof leadSource)[keyof typeof leadSource];

/** Lead status meta for badge styling */
export const leadStatusMeta: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
    ongoing: { label: 'Ongoing', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
    follow_up: { label: 'Follow-Up', className: 'bg-purple-50 text-purple-700 border border-purple-200' },
    no_response: { label: 'No Response', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
    ineligible: { label: 'Ineligible', className: 'bg-red-50 text-red-400 border border-red-100' },
    won: { label: 'Won', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    lost: { label: 'Lost', className: 'bg-red-50 text-red-700 border border-red-200' },
};

/*
    CAMPAIGN (newsletter)
*/
export const campaignStatus = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    sent: 'Sent',
} as const;
export type CampaignStatus = (typeof campaignStatus)[keyof typeof campaignStatus];
export const campaignStatusMeta: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
    scheduled: { label: 'Scheduled', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    sent: { label: 'Sent', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
};

/*
    NEWSLETTER SUBSCRIBER
*/
export const subscriberStatus = {
    subscribed: 'Subscribed',
    unsubscribed: 'Unsubscribed',
} as const;
export type SubscriberStatus = (typeof subscriberStatus)[keyof typeof subscriberStatus];
export const subscriberStatusMeta: Record<string, { label: string; className: string }> = {
    subscribed: { label: 'Subscribed', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    unsubscribed: { label: 'Unsubscribed', className: 'bg-slate-100 text-slate-500 border border-slate-200' },
};

/*
    LEADS 
*/
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
}

/** Project from projects table (id is text/uuid) */
export type Project = {
    id: string;
    projectCode: string;
    projectName: string;
    logoUrl?: string;
    status?: string;
    location?: string;
    stage?: string;
    type?: string;
    photoUrl?: string;
    accentColor?: string;
    description?: string;
    amenities?: unknown[];
    landmarks?: unknown[];
};

/** Inventory item from project_inventory (references projects.id via projectId) */
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

/** Reservation record for display/lookup (soldTo on inventory references reservation.id) */
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
};

export type Career = {
    id: number;
    position: string;
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

export const notificationType = {
    info: 'Info',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
} as const;
export type NotificationType = (typeof notificationType)[keyof typeof notificationType];

export const notificationTypeMeta: Record<string, { label: string; className: string }> = {
    info: { label: 'Info', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
    success: { label: 'Success', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    error: { label: 'Error', className: 'bg-red-50 text-red-700 border border-red-200' },
    warning: { label: 'Warning', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
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
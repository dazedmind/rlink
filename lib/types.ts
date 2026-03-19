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

export const reservationStatusMeta: Record<string, { label: string; className: string }> = {
    pending: { label: 'For Validation', className: 'bg-blue-600/10 text-blue-700' },
    reserved: { label: 'Reserved', className: 'bg-green-600/10 text-green-700' },
    conditional: { label: 'Conditional', className: 'bg-yellow-600/10 text-yellow-700' },
    cancelled: { label: 'Cancelled', className: 'bg-red-600/10 text-red-700' },
    rejected: { label: 'Rejected', className: 'bg-neutral-600/10 text-neutral-700' },
    expired: { label: 'Expired', className: 'bg-neutral-600/10 text-neutral-700' },
    refunded: { label: 'Refunded', className: 'bg-purple-600/10 text-purple-700' },
};

export const inquiryStatus = {
    read: 'Read',
    unread: 'Unread',
} as const;

export type InquiryStatus = (typeof inquiryStatus)[keyof typeof inquiryStatus];

export const inquiryStatusMeta: Record<string, { label: string; className: string }> = {
    read: { label: 'Read', className: 'bg-neutral-600/10 text-muted-foreground' },
    unread: { label: 'Unread', className: 'bg-blue-600/10 text-primary' },
};

export const department = {
    construction: 'Construction Management',
    design: 'Architecture & Design',
    hr: 'Human Resources',
    it: 'Information Technology',
    office_president: 'Office of the President',
    project_development: 'Project Development',
    property_management: 'Property Management',
    sales_admin: 'Sales Admin',
    sales_marketing: 'Sales & Marketing',
    sales_documentation: 'Sales Documentation'
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

export const careerStatusMeta: Record<string, { label: string; className: string }> = {
    hiring: { label: 'Hiring', className: 'bg-success/10 text-success' },
    closed: { label: 'Closed', className: 'bg-foreground/10 text-muted-foreground' },
    archived: { label: 'Archived', className: 'bg-primary/10 text-primary' },
};

export const location = {
    'Quezon City (Head Office)': 'Quezon City (Head Office)',
    'Lipa, Batangas': 'Lipa, Batangas',
    'Angeles, Pampanga': 'Angeles, Pampanga',
  } as const;
  export type Location = (typeof location)[keyof typeof location];

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
    available: { label: 'Available', className: 'bg-emerald-500/10 text-success' },
    sold: { label: 'Sold Out', className: 'bg-foreground/10 text-muted-foreground' },
    on_hold: { label: 'On Hold', className: 'bg-warning/10 text-warning' },
};
export const projectStageMeta: Record<string, { label: string; className: string }> = {
    pre_selling: { label: 'Pre-Selling', className: 'bg-primary/10 text-primary' },
    ongoing_development: { label: 'Ongoing Development', className: 'bg-purple-500/10 text-purple-700' },
    coming_soon: { label: 'Coming Soon', className: 'bg-secondary/10 text-secondary' },
    completed: { label: 'Completed', className: 'bg-success/10 text-success' },
    cancelled: { label: 'Cancelled', className: 'bg-foreground/10 text-muted-foreground' },
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
    draft: { label: 'Draft', className: 'bg-foreground/10 text-muted-foreground' },
    active: { label: 'Active', className: 'bg-success/10 text-success' },
    expired: { label: 'Expired', className: 'bg-foreground/10 text-muted-foreground' },
};

/** Promo from promos table */
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

/** Campaign from campaigns table */
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

/** Inquiry from inquiry table */
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

/*
    ARTICLE / NEWS
*/

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

export const articleType = {
    news: 'News',
    blog: 'Blog',
    announcement : 'Announcement'
} as const;
export type ArticleType = (typeof articleType)[keyof typeof articleType];

export const articleTypeValues = ["news", "blog", "announcement"] as const;

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
    open: { label: 'Open', className: 'bg-blue-600/10 text-primary' },
    ongoing: { label: 'Ongoing', className: 'bg-purple-600/10 text-purple-700' },
    follow_up: { label: 'Follow-Up', className: 'bg-yellow-600/10 text-yellow-700' },
    no_response: { label: 'No Response', className: 'bg-neutral-600/10 text-neutral-700' },
    ineligible: { label: 'Ineligible', className: 'bg-neutral-600/10 text-neutral-700' },
    won: { label: 'Won', className: 'bg-green-600/10 text-green-700' },
    lost: { label: 'Lost', className: 'bg-red-600/10 text-red-700' },
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

// Badge styling for campaign status
export const campaignStatusMeta: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-slate-600/10 text-muted-foreground' },
    scheduled: { label: 'Scheduled', className: 'bg-yellow-600/10 text-secondary-fg' },
    sent: { label: 'Sent', className: 'bg-blue-600/10 text-primary' },
};

/*
    NEWSLETTER SUBSCRIBER
*/
export type Subscriber = {
    id: number;
    email: string;
    status: string;
    createdAt: string;
}

export const subscriberStatus = {
    subscribed: 'Subscribed',
    unsubscribed: 'Unsubscribed',
} as const;
export type SubscriberStatus = (typeof subscriberStatus)[keyof typeof subscriberStatus];

export const subscriberStatusMeta: Record<string, { label: string; className: string }> = {
    subscribed: { label: 'Subscribed', className: 'bg-green-600/10 text-green-700 px-2 p-1 rounded-md' },
    unsubscribed: { label: 'Unsubscribed', className: 'bg-neutral-600/10 text-neutral-700 px-2 p-1 rounded-md' },
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

/** Project amenity (from projects.amenities jsonb) */
export type ProjectAmenity = {
    name: string;
    photoUrl?: string;
};

/** Project from projects table (id is text/uuid) */
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

/** Project model from project_models table */
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

/** Inventory unit from project_inventory (project-scoped view) */
export type InventoryUnit = {
    id: string;
    modelId: string;
    inventoryCode: string;
    block: number;
    lot: number;
    sellingPrice: number;
    isFeatured: boolean;
};

/** Form shape for project overview tab */
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

/** Gallery image from project_gallery */
export type GalleryImage = {
    id: string;
    projectId: string;
    modelId: string | null;
    imageUrl: string;
    caption: string | null;
    sortOrder: number;
    createdAt: string;
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
    createdAt: string;
    updatedAt: string;
};

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

export const userRole = {
    admin: 'Admin',
    user: 'User',
} as const;
export type UserRole = (typeof userRole)[keyof typeof userRole];

export const userRoleMeta: Record<string, { label: string; className: string }> = {
    admin: { label: 'Admin', className: 'bg-info/10 text-info' },
    user: { label: 'User', className: 'bg-muted-foreground/10 text-muted-foreground' },
};

export const userStatus = {
    active: 'Active',
    disabled: 'Disabled',
    locked: 'Locked',
    inactive: 'Inactive',
} as const;
export type UserStatus = (typeof userStatus)[keyof typeof userStatus];

export const userStatusMeta: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    disabled: { label: 'Disabled', className: 'bg-red-50 text-red-700 border border-red-200' },
    locked: { label: 'Locked', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    inactive: { label: 'Inactive', className: 'bg-gray-50 text-gray-700 border border-gray-200' },
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

export const activityStatus = {
    success: 'Success',
    error: 'Error',
} as const;
export type ActivityStatus = (typeof activityStatus)[keyof typeof activityStatus];

export const activityStatusMeta: Record<string, { label: string; className: string }> = {
    success: { label: 'Success', className: 'bg-success/10 text-success' },
    error: { label: 'Error', className: 'bg-destructive/10 text-destructive' },
};
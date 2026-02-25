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
    email: 'Send Email',
    followup: 'Follow Up',
    schedule_presentation: 'Schedule Presentation',
    tripping: 'Schedule Viewing',
    computation: 'Send Proposal Computation',
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
    linkedin: 'Linkedin',
    youtube: 'Youtube',
    others: 'Others',
} as const;

export type InquirySource = (typeof inquirySource)[keyof typeof inquirySource];
import { sql } from 'drizzle-orm'
import {
  pgTable,
  pgEnum,
  text,
  date,
  boolean,
  timestamp,
  integer,
  unique,
  serial,
  jsonb,
} from 'drizzle-orm/pg-core'
import { user } from '@/db/auth-schema'
// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const userStatusEnum = pgEnum('user_status', [
  'active',
  'disabled',
  'locked',
  'in_vacation',
])

export const userAccessEnum = pgEnum('user_access', [
  'hr',
  'marketing',
  'admin',
  'infotech',
])

export const leadStatusEnum = pgEnum('lead_status', [
  'open',
  'ongoing',
  'follow_up',
  'no_response',
  'ineligible',
  'won',
  'lost',
])

export const leadStageEnum = pgEnum('lead_stage', [
  'lead',
  'qualified',
  'presented',
  'viewed',
  'proposal_sent',
  'negotiation',
  'closed_won',
  'closed_lost',
])

export const leadNextActionEnum = pgEnum('lead_next_action', [
  'call',
  'message',
  'email',
  'followup',
  'schedule_presentation',
  'tripping',
  'computation',
  'reservation',
  'documentation',
])

export const leadSourceEnum = pgEnum('lead_source', [
  'ads',
  'organic_fb',
  'organic_ig',
  'email',
  'website',
  'tiktok',
])

export const inquirySubjectEnum = pgEnum('inquiry_subject', [
  'buying',
  'assistance',
  'partnership',
  'career',
])

export const inquirySourceEnum = pgEnum('inquiry_source', [
  'facebook',
  'instagram',
  'linkedin',
  'tiktok',
  'youtube',
  'website',
  'others',
])

export const inventoryStatusEnum = pgEnum('inventory_status', [
  'sold',
  'available',
  'on_hold'
])

export const inventoryStageEnum = pgEnum('inventory_stage', [
  'pre_selling',
  'ongoing_development',
  'completed',
  'coming_soon',
  'cancelled',
])

export const inventoryTypeEnum = pgEnum('inventory_type', [
  'houselot',
  'condo',
  'townhouse',
])

export const brokerStatusEnum = pgEnum('broker_status', [
  'active',
  'inactive',
  'resigned',
])

export const articleTypeEnum = pgEnum('article_type', [
  'news',
  'blog',
  'announcement',
  'event',
])

export const mediaFormatEnum = pgEnum('format', [
  'JPG',
  'PNG',
  'GIF',
  'MP3',
  'MP4',
  'MOV',
])

export const careerStatusEnum = pgEnum('career_status', [
  'hiring',
  'closed',
  'archived',
])

export const reservationStatusEnum = pgEnum('reservation_status', [
  'pending',
  'reserved',
  'conditional',
  'cancelled',
  'rejected',
  'expired',
  'refunded',
])

export const campaignStatusEnum = pgEnum('campaign_status', [
  'draft',
  'scheduled',
  'sent',
])

export const inquiryStatusEnum = pgEnum('inquiry_status', [
  'read',
  'unread',
])

export const newsletterStatusEnum = pgEnum('newsletter_status', [
  'subscribed',
  'unsubscribed',
])

export const departmentEnum = pgEnum('department', [
  'marketing',
  'executive',
  'engineering',
  'design',
  'hr',
  'finance',
  'it',
  'legal',
  'operations',
  'customer_service',
  'product'
])

export const activityStatusEnum = pgEnum('activity_status', [
  'success',
  'failed',
])

export const notificationTypeEnum = pgEnum('notification_type', [
  'info',
  'success',
  'error',
  'warning',
])

/**
 * leads — sales leads / prospects
 */
export const leads = pgTable('leads', {
  id:          integer('id').primaryKey(),
  leadId:      text('lead_id').notNull(),
  status:      leadStatusEnum('status').notNull().default('open'),
  firstName:   text('first_name').notNull(),
  lastName:    text('last_name').notNull(),
  phone:       text('phone'),
  email:       text('email'),
  inquiryDate: date('inquiry_date').notNull(),
  project:     text('project').notNull(),
  profileLink: text('profile_link'),
  stage:       leadStageEnum('stage').notNull().default('lead'),
  nextAction:  leadNextActionEnum('next_action').notNull().default('call'),
  source:      leadSourceEnum('source').notNull(),
  notes:       text('notes').notNull(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

/**
 * reservation — property reservation records
 */
export const reservation = pgTable('reservation', {
  id:            integer('id').primaryKey(),
  reservationId: text('reservation_id').notNull(),
  firstName:     text('first_name').notNull(),
  lastName:      text('last_name').notNull(),
  email:         text('email').notNull(),
  phone:         text('phone').notNull(),
  inventoryCode: text('inventory_code').notNull(),
  status:        reservationStatusEnum('status').notNull().default('pending'),
  projectName:   text('project_name').notNull(),
  block:         integer('block').notNull(),
  lot:           integer('lot').notNull(),
  notes:         text('notes'),
  recipientEmail: text('recipient_email'),
  ccEmail:       text('cc_email'),
  bccEmail:      text('bcc_email'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
})

/**
 * inquiry — general website/form inquiries
 */
export const inquiry = pgTable('inquiry', {
  id:        integer('id').primaryKey(),
  inquiryId: text('inquiry_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName:  text('last_name').notNull(),
  email:     text('email').notNull(),
  phone:     text('phone').notNull(),
  subject:   inquirySubjectEnum('subject').notNull(),
  message:   text('message').notNull(),
  source:    inquirySourceEnum('source').notNull(),
  status:    inquiryStatusEnum('status').notNull().default('unread'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const projects = pgTable('projects', {
  id:          text('id').primaryKey(),
  projectCode: text('project_code').notNull().unique(),
  projectName: text('project_name').notNull(),
  status:      inventoryStatusEnum('status'),
  location:    text('location'),
  stage:       inventoryStageEnum('stage'),
  type:        inventoryTypeEnum('type').notNull(),
  photoUrl:    text('photo_url'),
  logoUrl:     text('logo_url'),
  mapLink:     text('map_link'),
  accentColor: text('accent_color'),
  description: text('description'),
  dhsudNumber: text('dhsud_number'),
  address: text('address'),
  completionDate: date('completion_date'),
  salesOffice: text('sales_office'),
  amenities: jsonb('amenities').notNull().default([]),
  landmarks: jsonb('landmarks').notNull().default([]),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

export const projectModels = pgTable('project_models', {
  id:          text('id').primaryKey(),
  projectId:   text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  modelName:   text('model_name').notNull(),
  description: text('description'),
  bathroom:    integer('bathroom').notNull(),
  kitchen:     integer('kitchen').notNull(),
  carport:     integer('carport').notNull(),
  serviceArea: integer('service_area').notNull(),
  livingRoom:  integer('living_room').notNull(),
  lotArea:     integer('lot_area').notNull(),
  floorArea:   integer('floor_area').notNull(),
  lotClass:    text('lot_class').notNull(),
  photoUrl:    text('photo_url'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  uniqueProjectModel: unique().on(t.projectId, t.modelName),
}))

export const projectInventory = pgTable('project_inventory', {
  id:            text('id').primaryKey(),
  projectId:     text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  modelId:       text('model_id').notNull().references(() => projectModels.id, { onDelete: 'restrict' }),
  inventoryCode: text('inventory_code').notNull().unique(),
  block:         integer('block').notNull(),
  lot:           integer('lot').notNull(),
  soldTo:        integer('sold_to').references(() => reservation.id, { onDelete: 'set null' }),
  sellingPrice:  integer('selling_price').notNull(),
  isFeatured:    boolean('is_featured').notNull().default(false),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  uniqueBlockLotModel: unique().on(t.projectId, t.block, t.lot, t.modelId),
}))

/**
 * job_inquiry — job application submissions
 */
export const jobInquiry = pgTable('job_inquiry', {
  id:        serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName:  text('last_name').notNull(),
  email:     text('email').notNull(),
  phone:     text('phone').notNull(),
  position:  text('position').notNull(),
  location:  text('location').notNull(),
  resume:    text('resume'),
  coverLetter: text('cover_letter'),
  appliedAt: timestamp('applied_at').notNull().defaultNow(),
})

/**
 * careers — job postings
 */
export const careers = pgTable('careers', {
  id:             serial('id').primaryKey(),
  position:       text('position').notNull(),
  location:       text('location').notNull(),
  jobDescription: text('job_description').notNull(),
  purpose:        text('purpose').notNull(),
  responsibilities: text('responsibilities').notNull(),
  qualifications: text('qualifications').notNull(),
  requiredSkills: text('required_skills').notNull(),
  status:         careerStatusEnum('status').notNull().default('hiring'),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
  updatedAt:      timestamp('updated_at').notNull().defaultNow(),
})

/**
 * newsletter — email subscriptions
 */
export const newsletter = pgTable('newsletter', {
  id:        serial('id').primaryKey(),
  email:     text('email').notNull().unique(),
  status:    newsletterStatusEnum('status').notNull().default('subscribed'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * campaigns — email campaigns
 */
export const campaigns = pgTable('campaigns', {
  id:        serial('id').primaryKey(),
  name:      text('name').notNull(),
  subject:   text('subject').notNull(),
  previewLine: text('preview_line').notNull(),
  body:      text('body').notNull(),
  recipients: integer('recipients').notNull().default(0),
  openRate:  integer('open_rate').notNull().default(0),
  clickRate: integer('click_rate').notNull().default(0),
  status:    campaignStatusEnum('status').notNull().default('draft'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt:    timestamp('sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * promos — promotional banners/deals
 */
export const promos = pgTable('promos', {
  id:          serial('id').primaryKey(),
  title:       text('title').notNull(),
  description: text('description'),
  imageUrl:    text('image_url'),
  linkUrl:     text('link_url'),
  status:      text('status').notNull().default('draft'),
  startDate:   timestamp('start_date'),
  endDate:     timestamp('end_date'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

/**
 * articles — news and blog posts
 */
export const articles = pgTable('articles', {
  id:          serial('id').primaryKey(),
  headline:    text('headline').notNull(),
  body:        text('body').notNull(),
  publishDate: date('publish_date').notNull(),
  tags:        text('tags').array().notNull().default([]),
  type:        articleTypeEnum('type').notNull(),
  photoUrl:    text('photo_url'),
  isFeatured:    boolean('is_featured').notNull().default(false),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

/**
 * announcements — internal company announcements
 */
export const announcements = pgTable('announcements', {
  id:               serial('id').primaryKey(),
  headline:         text('headline').notNull(),
  body:             text('body').notNull(),
  acknowledgeCount: integer('acknowledge_count').notNull().default(0),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow(),
})

/**
 * brokers — external broker/agent records
 */
export const brokers = pgTable('brokers', {
  id:         serial('id').primaryKey(),
  firstName:  text('first_name').notNull(),
  middleName: text('middle_name').notNull(),
  lastName:   text('last_name').notNull(),
  phone:      text('phone').notNull(),
  email:      text('email').notNull().unique(),
  status:     brokerStatusEnum('status').notNull().default('active'),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
  updatedAt:  timestamp('updated_at').notNull().defaultNow(),
})

/**
 * media_assets — uploaded files and media
 */
export const mediaAssets = pgTable('media_assets', {
  id:        serial('id').primaryKey(),
  purpose:   text('purpose'),
  url:       text('url'),
  format:    mediaFormatEnum('format'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})


/**
 * developer_tools_settings — CMS configuration for landing page (SEO, Analytics, Security)
 */
export const developerToolsSettings = pgTable('developer_tools_settings', {
  id:        text('id').primaryKey(),
  value:     jsonb('value').notNull().default({}),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * activity_logs — logged user activities
 */
export const activityLogs = pgTable('activity_logs', {
  id:        text('id').primaryKey().default(sql<string>`gen_random_uuid()`),
  userId:    text('user_id').notNull().references(() => user.id, { onDelete: 'no action' }),
  activity:  text('activity').notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent').notNull(),
  status:    activityStatusEnum('status').notNull().default('success'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Notifications
 */

export const notifications = pgTable('notifications', {
  id:        serial('id').primaryKey(),
  title:     text('title').notNull(),
  description: text('description').notNull(),
  type:        notificationTypeEnum('type').notNull(),
  read:        boolean('read').notNull().default(false),
  userId:      text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

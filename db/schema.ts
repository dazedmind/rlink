import {
  pgTable,
  pgEnum,
  text,
  date,
  boolean,
  timestamp,
  integer,
  uuid,
  serial,
} from 'drizzle-orm/pg-core'

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
  'linkedin',
  'youtube',
  'website',
  'others',
])

export const inventoryStatusEnum = pgEnum('inventory_status', [
  'sold',
  'available',
])

export const inventoryStageEnum = pgEnum('inventory_stage', [
  'pre_selling',
  'ongoing_development',
  'completed',
  'cancelled',
])

export const inventoryTypeEnum = pgEnum('inventory_type', [
  'houselot',
  'condo',
])

export const brokerStatusEnum = pgEnum('broker_status', [
  'active',
  'inactive',
  'resigned',
])

export const articleTypeEnum = pgEnum('article_type', [
  'news',
  'blog',
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

// ─────────────────────────────────────────────
// AUTH TABLES (better-auth)
// ─────────────────────────────────────────────

/**
 * auth_user — better-auth base table, extended with employee profile fields
 *
 * MERGED FROM:
 *   - authUser  → better-auth required fields  [better-auth]
 *   - user      → employee profile fields       [profile]
 *
 * REMOVED (no longer needed):
 *   - old `user` table entirely
 *   - old `user_auth` table entirely (replaced by better-auth's account + session tables)
 *   - userId bigint ref → replaced by better-auth's text `id`
 *
 * NOTE: better-auth uses a single `name` field. We store name parts separately
 * and derive the full name in the application layer when better-auth needs it.
 * [Inference] better-auth supports custom fields on the user table — verify this
 * against your specific better-auth version before running migrations.
 */
export const authUser = pgTable('auth_user', {
  // ── better-auth required ──────────────────────────────────────
  id:            text('id').primaryKey(),      
  name:          text('name').notNull(),                           // [better-auth]
  email:         text('email').notNull().unique(),                        // [better-auth]
  emailVerified: boolean('email_verified').notNull().default(false),     // [better-auth]
  image:         text('image'),                                           // [better-auth] replaces photoUrl
  createdAt:     timestamp('created_at').notNull().defaultNow(),         // [better-auth]
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),         // [better-auth]

  // ── employee identity [profile] ──────────────────────────────
  firstName:     text('first_name').notNull().default(''),
  lastName:      text('last_name').notNull().default(''),
  middleName:    text('middle_name').default(''),

  // ── employee details [profile] ───────────────────────────────
  employeeId:    text('employee_id'),                                     // text, not bigint
  position:      text('position'),
  department:    text('department'),
  phone:         text('phone'),
  birthdate:     date('birthdate'),
  status:        userStatusEnum('status').notNull().default('active'),
  access:        userAccessEnum('access').array(),
})

/**
 * session — better-auth session management
 */
export const session = pgTable('session', {
  id:        text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token:     text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId:    text('user_id').notNull().references(() => authUser.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * account — better-auth OAuth/credential accounts
 * [Unsecure] password field is managed by better-auth and should always be hashed
 */
export const account = pgTable('account', {
  id:                    text('id').primaryKey(),
  accountId:             text('account_id').notNull(),
  providerId:            text('provider_id').notNull(),
  userId:                text('user_id').notNull().references(() => authUser.id, { onDelete: 'cascade' }),
  accessToken:           text('access_token'),
  refreshToken:          text('refresh_token'),
  idToken:               text('id_token'),
  accessTokenExpiresAt:  timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope:                 text('scope'),
  password:              text('password'),                                // [Unsecure] hashed by better-auth
  createdAt:             timestamp('created_at').notNull().defaultNow(),
  updatedAt:             timestamp('updated_at').notNull().defaultNow(),
})

/**
 * verification — better-auth email/token verification
 */
export const verification = pgTable('verification', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expires_at').notNull(),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
  updatedAt:  timestamp('updated_at').notNull().defaultNow(),
})

// ─────────────────────────────────────────────
// TABLES
// Auth-related tables → uuid (better-auth compatible)
// CMS/business tables → serial (auto-incrementing integer, DB managed)
// ─────────────────────────────────────────────

/**
 * user_access — role-based access control (auth-related → uuid)
 */
export const userAccess = pgTable('role_access', {
  id:       uuid('id').primaryKey().defaultRandom(),
  userId:   text('user_id').notNull().unique().references(() => authUser.id, { onDelete: 'cascade' }),
  roleId:   uuid('role_id').notNull(),
  accessTo: uuid('access_to').notNull(),
})

/**
 * leads — sales leads / prospects
 */
export const leads = pgTable('leads', {
  id:          serial('id').primaryKey(),
  status:      leadStatusEnum('status').notNull().default('open'),
  clientName:  text('client_name').notNull(),
  phone:       text('phone').notNull(),
  email:       text('email').notNull(),
  inquiryDate: date('inquiry_date').notNull(),
  project:     text('project').notNull(),
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
  id:            serial('id').primaryKey(),
  clientId:      integer('client_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  firstName:     text('first_name').notNull(),
  lastName:      text('last_name').notNull(),
  email:         text('email').notNull(),
  phone:         text('phone').notNull(),
  inventoryCode: text('inventory_code').notNull(),
  projectName:   text('project_name').notNull(),
  block:         integer('block').notNull(),
  lot:           integer('lot').notNull(),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
})

/**
 * inquiry — general website/form inquiries
 */
export const inquiry = pgTable('inquiry', {
  id:        serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName:  text('last_name').notNull(),
  email:     text('email').notNull(),
  phone:     text('phone').notNull(),
  message:   text('message').notNull(),
  subject:   inquirySubjectEnum('subject').notNull(),
  source:    inquirySourceEnum('source').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * projects — real estate project listings
 */
export const projects = pgTable('projects', {
  id:          serial('id').primaryKey(),
  projectCode: text('project_code').notNull(),
  projectName: text('project_name').notNull(),
  status:      inventoryStatusEnum('status'),
  location:    text('location'),
  stage:       inventoryStageEnum('stage'),
  type:        inventoryTypeEnum('type').notNull(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

/**
 * project_details — unit/lot specifications
 */
export const projectDetails = pgTable('project_details', {
  id:          serial('id').primaryKey(),
  bathroom:    integer('bathroom').notNull(),
  kitchen:     integer('kitchen').notNull(),
  carport:     integer('carport').notNull(),
  serviceArea: integer('service_area').notNull(),
  livingRoom:  integer('living_room').notNull(),
  lotArea:     integer('lot_area').notNull(),
  floorArea:   integer('floor_area').notNull(),
  lotClass:    text('lot_class').notNull(),
})

/**
 * project_inventory — individual inventory units
 */
export const projectInventory = pgTable('project_inventory', {
  id:            serial('id').primaryKey(),
  inventoryCode: text('inventory_code').notNull(),
  modelName:     text('model_name').notNull(),
  block:         integer('block').notNull(),
  lot:           integer('lot').notNull(),
  soldTo:        integer('sold_to').references(() => leads.id, { onDelete: 'set null' }),
  sellingPrice:  integer('selling_price').notNull(),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
})

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
  createdAt: timestamp('created_at').notNull().defaultNow(),
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

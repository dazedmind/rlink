CREATE TYPE "public"."article_type" AS ENUM('news', 'blog');--> statement-breakpoint
CREATE TYPE "public"."broker_status" AS ENUM('active', 'inactive', 'resigned');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'sent');--> statement-breakpoint
CREATE TYPE "public"."career_status" AS ENUM('hiring', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."inquiry_source" AS ENUM('facebook', 'linkedin', 'youtube', 'website', 'others');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('read', 'unread');--> statement-breakpoint
CREATE TYPE "public"."inquiry_subject" AS ENUM('buying', 'assistance', 'partnership', 'career');--> statement-breakpoint
CREATE TYPE "public"."inventory_stage" AS ENUM('pre_selling', 'ongoing_development', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('sold', 'available');--> statement-breakpoint
CREATE TYPE "public"."inventory_type" AS ENUM('houselot', 'condo');--> statement-breakpoint
CREATE TYPE "public"."lead_next_action" AS ENUM('call', 'message', 'email', 'followup', 'schedule_presentation', 'tripping', 'computation', 'reservation', 'documentation');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('ads', 'organic_fb', 'organic_ig', 'email', 'website', 'tiktok');--> statement-breakpoint
CREATE TYPE "public"."lead_stage" AS ENUM('lead', 'qualified', 'presented', 'viewed', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('open', 'ongoing', 'follow_up', 'no_response', 'ineligible', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."format" AS ENUM('JPG', 'PNG', 'GIF', 'MP3', 'MP4', 'MOV');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'reserved', 'conditional', 'cancelled', 'rejected', 'expired', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."user_access" AS ENUM('hr', 'marketing', 'admin', 'infotech');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'disabled', 'locked', 'in_vacation');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"body" text NOT NULL,
	"acknowledge_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"body" text NOT NULL,
	"publish_date" date NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"type" "article_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brokers" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"status" "broker_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brokers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"preview_line" text NOT NULL,
	"body" text NOT NULL,
	"recipients" integer DEFAULT 0 NOT NULL,
	"open_rate" integer DEFAULT 0 NOT NULL,
	"click_rate" integer DEFAULT 0 NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "careers" (
	"id" serial PRIMARY KEY NOT NULL,
	"position" text NOT NULL,
	"location" text NOT NULL,
	"job_description" text NOT NULL,
	"status" "career_status" DEFAULT 'hiring' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry" (
	"id" integer PRIMARY KEY NOT NULL,
	"inquiry_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"subject" "inquiry_subject" NOT NULL,
	"message" text NOT NULL,
	"source" "inquiry_source" NOT NULL,
	"status" "inquiry_status" DEFAULT 'unread' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_inquiry" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"position" text NOT NULL,
	"location" text NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" integer PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"status" "lead_status" DEFAULT 'open' NOT NULL,
	"client_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"inquiry_date" date NOT NULL,
	"project" text NOT NULL,
	"stage" "lead_stage" DEFAULT 'lead' NOT NULL,
	"next_action" "lead_next_action" DEFAULT 'call' NOT NULL,
	"source" "lead_source" NOT NULL,
	"notes" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"purpose" text,
	"url" text,
	"format" "format",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "project_details" (
	"id" text PRIMARY KEY NOT NULL,
	"inventory_code" text NOT NULL,
	"bathroom" integer NOT NULL,
	"kitchen" integer NOT NULL,
	"carport" integer NOT NULL,
	"service_area" integer NOT NULL,
	"living_room" integer NOT NULL,
	"lot_area" integer NOT NULL,
	"floor_area" integer NOT NULL,
	"lot_class" text NOT NULL,
	CONSTRAINT "project_details_inventory_code_unique" UNIQUE("inventory_code")
);
--> statement-breakpoint
CREATE TABLE "project_inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"project_code" text NOT NULL,
	"inventory_code" text NOT NULL,
	"model_name" text NOT NULL,
	"block" integer NOT NULL,
	"lot" integer NOT NULL,
	"sold_to" integer,
	"selling_price" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_inventory_inventory_code_unique" UNIQUE("inventory_code")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"project_code" text NOT NULL,
	"project_name" text NOT NULL,
	"status" "inventory_status",
	"location" text,
	"stage" "inventory_stage",
	"type" "inventory_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_project_code_unique" UNIQUE("project_code")
);
--> statement-breakpoint
CREATE TABLE "reservation" (
	"id" integer PRIMARY KEY NOT NULL,
	"reservation_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"inventory_code" text NOT NULL,
	"status" "reservation_status" DEFAULT 'pending' NOT NULL,
	"project_name" text NOT NULL,
	"block" integer NOT NULL,
	"lot" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"first_name" text DEFAULT '',
	"last_name" text DEFAULT '',
	"middle_name" text DEFAULT '',
	"phone" text DEFAULT '',
	"position" text DEFAULT '',
	"department" text DEFAULT '',
	"employee_id" text DEFAULT '',
	"birthdate" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_details" ADD CONSTRAINT "project_details_inventory_code_project_inventory_id_fk" FOREIGN KEY ("inventory_code") REFERENCES "public"."project_inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_inventory" ADD CONSTRAINT "project_inventory_project_code_projects_id_fk" FOREIGN KEY ("project_code") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_inventory" ADD CONSTRAINT "project_inventory_sold_to_leads_id_fk" FOREIGN KEY ("sold_to") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");
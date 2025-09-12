CREATE TABLE "domains" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"registrar_id" varchar NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"renewal_period_years" integer DEFAULT 1 NOT NULL,
	"auto_renewal" boolean DEFAULT false NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"next_notification_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"item_id" varchar NOT NULL,
	"item_name" text NOT NULL,
	"notification_type" text NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrars" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"login_url" text,
	"login_username" text,
	"login_password" text,
	"two_factor_mobile" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ssl_certificates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" text NOT NULL,
	"issuer" text NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"renewal_period_years" integer DEFAULT 1 NOT NULL,
	"auto_renewal" boolean DEFAULT false NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"next_notification_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_registrar_id_registrars_id_fk" FOREIGN KEY ("registrar_id") REFERENCES "public"."registrars"("id") ON DELETE no action ON UPDATE no action;
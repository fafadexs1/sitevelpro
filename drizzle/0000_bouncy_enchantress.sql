CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "cities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "conversion_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"event_snippet" text NOT NULL,
	"selector" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"ping_label" text,
	"stability_label" text,
	"color_gradient" text,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "hero_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"desktop_image_url" text NOT NULL,
	"mobile_image_url" text NOT NULL,
	"title" text,
	"subtitle" text,
	"button_text" text,
	"button_link" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"speed" text NOT NULL,
	"price" real NOT NULL,
	"original_price" real,
	"first_month_price" real,
	"upload_speed" text,
	"download_speed" text,
	"whatsapp_number" text,
	"whatsapp_message" text,
	"conditions" text,
	"features" text[],
	"highlight" boolean DEFAULT false NOT NULL,
	"has_tv" boolean DEFAULT false NOT NULL,
	"featured_channel_ids" uuid[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "popups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"plan_id" uuid,
	"title" text,
	"content" text,
	"image_url" text,
	"button_text" text,
	"button_link" text,
	"button_action_type" text DEFAULT 'link',
	"button_whatsapp_message" text,
	"display_on" text DEFAULT 'main_site',
	"trigger_type" text DEFAULT 'delay',
	"trigger_value" integer DEFAULT 5,
	"frequency" text DEFAULT 'once_per_session',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"text" text NOT NULL,
	"stars" integer DEFAULT 5 NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tv_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"logo_url" text NOT NULL,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tv_package_channels" (
	"package_id" uuid NOT NULL,
	"channel_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tv_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "popups" ADD CONSTRAINT "popups_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tv_package_channels" ADD CONSTRAINT "tv_package_channels_package_id_tv_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."tv_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tv_package_channels" ADD CONSTRAINT "tv_package_channels_channel_id_tv_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."tv_channels"("id") ON DELETE cascade ON UPDATE no action;
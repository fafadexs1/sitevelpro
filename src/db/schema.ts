import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const domains = pgTable("domains", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  hostname: text().notNull(),
  type: text().default("sales_page").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const cities = pgTable("cities", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  slug: text().notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const conversion_events = pgTable("conversion_events", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  type: text().notNull(),
  selector: text(),
  event_snippet: text("event_snippet").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const dynamic_seo_rules = pgTable("dynamic_seo_rules", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  slug_pattern: text("slug_pattern").notNull(),
  meta_title: text("meta_title").notNull(),
  meta_description: text("meta_description").notNull(),
  canonical_url: text("canonical_url"),
  allow_indexing: boolean("allow_indexing").default(true).notNull(),
  schema_type: text("schema_type").default("None").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const hero_slides = pgTable("hero_slides", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  pre_title: text("pre_title"),
  title_regular: text("title_regular"),
  title_highlighted: text("title_highlighted"),
  subtitle: text(),
  image_url: text("image_url"),
  button_primary_text: text("button_primary_text"),
  button_primary_link: text("button_primary_link"),
  button_secondary_text: text("button_secondary_text"),
  button_secondary_link: text("button_secondary_link"),
  feature_1_text: text("feature_1_text"),
  feature_2_text: text("feature_2_text"),
  is_active: boolean("is_active").default(true).notNull(),
  sort_order: integer("sort_order").default(0),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  image_opacity: integer("image_opacity").default(30),
  image_url_mobile: text("image_url_mobile"),
  slide_type: text("slide_type").default("content").notNull(),
});

export const leads = pgTable("leads", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  full_name: text("full_name").notNull(),
  email: text().notNull(),
  phone: text().notNull(),
  cep: text(),
  street: text(),
  number: text(),
  complement: text(),
  neighborhood: text(),
  city: text(),
  state: text(),
  latitude: doublePrecision(),
  longitude: doublePrecision(),
  status: text().default("new").notNull(),
  source: text().default("signup_form"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const plans = pgTable("plans", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  type: text(),
  speed: text(),
  price: numeric(),
  highlight: boolean(),
  has_tv: boolean("has_tv"),
  features: text().array(),
  original_price: numeric("original_price"),
  featured_channel_ids: uuid("featured_channel_ids").array(),
  whatsapp_number: text("whatsapp_number"),
  whatsapp_message: text("whatsapp_message"),
  conditions: text(),
  upload_speed: text("upload_speed"),
  download_speed: text("download_speed"),
  first_month_price: numeric("first_month_price", { precision: 10, scale: 2 }),
  sort_order: integer("sort_order").default(0),
  button_action_type: text("button_action_type").default("link").notNull(),
  button_whatsapp_message: text("button_whatsapp_message"),
  display_on: text("display_on").default("sales_page").notNull(),
  trigger_type: text("trigger_type").default("delay").notNull(),
  trigger_value: integer("trigger_value").default(5),
  frequency: text().default("once_per_session").notNull(),
});

export const popups = pgTable("popups", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  title: text(),
  content: text(),
  image_url: text("image_url"),
  button_text: text("button_text"),
  button_link: text("button_link"),
  display_on: text("display_on").default("sales_page"),
  trigger_type: text("trigger_type").default("delay"),
  trigger_value: integer("trigger_value").default(5),
  frequency: text().default("once_per_session"),
  is_active: boolean("is_active").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  plan_id: uuid("plan_id"),
});

export const posts = pgTable("posts", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  title: text().notNull(),
  slug: text().notNull(),
  content: text(),
  excerpt: text(),
  cover_image_url: text("cover_image_url"),
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  is_published: boolean("is_published").default(false).notNull(),
  published_at: timestamp("published_at", { withTimezone: true, mode: "string" }),
  author_name: text("author_name"),
  author_avatar_url: text("author_avatar_url"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const seo_settings = pgTable("seo_settings", {
  id: integer().default(1).primaryKey().notNull(),
  site_title: text("site_title").notNull(),
  site_description: text("site_description").notNull(),
  og_image_url: text("og_image_url"),
  favicon_url: text("favicon_url"),
  allow_indexing: boolean("allow_indexing").default(true).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const system_settings = pgTable("system_settings", {
  key: text().primaryKey().notNull(),
  value: text(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  description: text(),
});

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  full_name: text("full_name").notNull(),
  email: text().notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: text().default("user").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  last_login_at: timestamp("last_login_at", { withTimezone: true, mode: "string" }),
});

export const tracking_tags = pgTable("tracking_tags", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  script_content: text("script_content").notNull(),
  placement: text().default("head_start").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const tv_channels = pgTable("tv_channels", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  logo_url: text("logo_url"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  description: text(),
  is_featured: boolean("is_featured").default(false).notNull(),
});

export const tv_packages = pgTable("tv_packages", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

export const tv_package_channels = pgTable(
  "tv_package_channels",
  {
    package_id: uuid("package_id").notNull(),
    channel_id: uuid("channel_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.package_id, table.channel_id] }),
  }),
);

export const faqs = pgTable("faqs", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  question: text().notNull(),
  answer: text().notNull(),
  sort_order: integer("sort_order").default(0),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const games = pgTable("games", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  description: text().notNull(),
  image_url: text("image_url").notNull(),
  ping_label: text("ping_label"),
  stability_label: text("stability_label"),
  color_gradient: text("color_gradient"),
  sort_order: integer("sort_order").default(0),
});

export const testimonials = pgTable("testimonials", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  role: text(),
  text: text().notNull(),
  stars: integer().default(5).notNull(),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const events = pgTable("events", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  visitor_id: text("visitor_id").notNull(),
  pathname: text().notNull(),
  name: text().notNull(),
  properties: jsonb(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  hostname: text(),
});

export const redirects = pgTable("redirects", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  source_path: text("source_path").notNull(),
  destination_path: text("destination_path").notNull(),
  type: text().default("permanent").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const referral_settings = pgTable("referral_settings", {
  id: integer().default(1).primaryKey().notNull(),
  reward_value: numeric("reward_value", { precision: 10, scale: 2 }).default("50.00"),
  reward_type: text("reward_type").default("discount"),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const referrals = pgTable("referrals", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  referrer_customer_id: text("referrer_customer_id"),
  referred_name: text("referred_name").notNull(),
  referred_email: text("referred_email"),
  referred_phone: text("referred_phone").notNull(),
  status: text().default("pendente").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const visits = pgTable("visits", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  visitor_id: text("visitor_id").notNull(),
  pathname: text().notNull(),
  is_new_visitor: boolean("is_new_visitor").default(false),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  hostname: text(),
});

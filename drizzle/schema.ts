import { pgTable, foreignKey, unique, pgPolicy, uuid, text, jsonb, timestamp, boolean, integer, check, numeric, doublePrecision, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const clientes = pgTable("clientes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	cpfCnpj: text("cpf_cnpj").notNull(),
	contratos: jsonb(),
	selectedContractId: text("selected_contract_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "clientes_user_id_fkey"
		}).onDelete("cascade"),
	unique("clientes_cpf_cnpj_key").on(table.cpfCnpj),
	pgPolicy("Enable update for users based on user_id", { as: "permissive", for: "update", to: ["public"], using: sql`(auth.uid() = user_id)` }),
	pgPolicy("Enable read access for authenticated users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const cities = pgTable("cities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	unique("cities_slug_key").on(table.slug),
]);

export const conversionEvents = pgTable("conversion_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	selector: text(),
	eventSnippet: text("event_snippet").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
});

export const heroSlides = pgTable("hero_slides", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	preTitle: text("pre_title"),
	titleRegular: text("title_regular"),
	titleHighlighted: text("title_highlighted"),
	subtitle: text(),
	imageUrl: text("image_url"),
	buttonPrimaryText: text("button_primary_text"),
	buttonPrimaryLink: text("button_primary_link"),
	buttonSecondaryText: text("button_secondary_text"),
	buttonSecondaryLink: text("button_secondary_link"),
	feature1Text: text("feature_1_text"),
	feature2Text: text("feature_2_text"),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	imageOpacity: integer("image_opacity").default(30),
	imageUrlMobile: text("image_url_mobile"),
	slideType: text("slide_type").default('content').notNull(),
});

export const dynamicSeoRules = pgTable("dynamic_seo_rules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slugPattern: text("slug_pattern").notNull(),
	metaTitle: text("meta_title").notNull(),
	metaDescription: text("meta_description").notNull(),
	canonicalUrl: text("canonical_url"),
	allowIndexing: boolean("allow_indexing").default(true).notNull(),
	schemaType: text("schema_type").default('None').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("dynamic_seo_rules_slug_pattern_key").on(table.slugPattern),
]);

export const events = pgTable("events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	visitorId: text("visitor_id").notNull(),
	pathname: text().notNull(),
	name: text().notNull(),
	properties: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	hostname: text(),
});

export const invoices = pgTable("invoices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contractId: text("contract_id").notNull(),
	invoicesData: jsonb("invoices_data"),
	fetchedAt: timestamp("fetched_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	userId: uuid("user_id"),
}, (table) => [
	unique("invoices_contract_id_key").on(table.contractId),
	pgPolicy("Enable read access for own invoices", { as: "permissive", for: "select", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM clientes
  WHERE ((clientes.user_id = auth.uid()) AND (clientes.selected_contract_id = invoices.contract_id))))` }),
]);

export const domains = pgTable("domains", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	hostname: text().notNull(),
	type: text().default('sales_page').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	unique("domains_hostname_key").on(table.hostname),
]);

export const tvPackages = pgTable("tv_packages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("tv_packages_name_key").on(table.name),
	pgPolicy("Enable public read access", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const tvChannels = pgTable("tv_channels", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	logoUrl: text("logo_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	description: text(),
	isFeatured: boolean("is_featured").default(false).notNull(),
}, (table) => [
	unique("tv_channels_name_key").on(table.name),
	pgPolicy("Enable public read access", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const redirects = pgTable("redirects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourcePath: text("source_path").notNull(),
	destinationPath: text("destination_path").notNull(),
	type: text().default('permanent').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	unique("redirects_source_path_key").on(table.sourcePath),
]);

export const referralSettings = pgTable("referral_settings", {
	id: integer().default(1).primaryKey().notNull(),
	rewardValue: numeric("reward_value", { precision: 10, scale:  2 }).default('50.00'),
	rewardType: text("reward_type").default('discount'),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	check("single_row_check", sql`id = 1`),
]);

export const referrals = pgTable("referrals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	referrerCustomerId: text("referrer_customer_id"),
	referredName: text("referred_name").notNull(),
	referredEmail: text("referred_email"),
	referredPhone: text("referred_phone").notNull(),
	status: text().default('pendente').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
});

export const seoSettings = pgTable("seo_settings", {
	id: integer().default(1).primaryKey().notNull(),
	siteTitle: text("site_title").notNull(),
	siteDescription: text("site_description").notNull(),
	ogImageUrl: text("og_image_url"),
	faviconUrl: text("favicon_url"),
	allowIndexing: boolean("allow_indexing").default(true).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	check("single_row_check", sql`id = 1`),
]);

export const systemSettings = pgTable("system_settings", {
	key: text().primaryKey().notNull(),
	value: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	description: text(),
});

export const trackingTags = pgTable("tracking_tags", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	scriptContent: text("script_content").notNull(),
	placement: text().default('head_start').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
});

export const leads = pgTable("leads", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fullName: text("full_name").notNull(),
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
	status: text().default('new').notNull(),
	source: text().default('signup_form'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
});

export const visits = pgTable("visits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	visitorId: text("visitor_id").notNull(),
	pathname: text().notNull(),
	isNewVisitor: boolean("is_new_visitor").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	hostname: text(),
});

export const workOrders = pgTable("work_orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contractId: text("contract_id").notNull(),
	orders: jsonb(),
	fetchedAt: timestamp("fetched_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	unique("work_orders_contract_id_key").on(table.contractId),
	pgPolicy("Enable read access for own work orders", { as: "permissive", for: "select", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM clientes
  WHERE ((clientes.user_id = auth.uid()) AND (clientes.selected_contract_id = work_orders.contract_id))))` }),
]);

export const posts = pgTable("posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	content: text(),
	excerpt: text(),
	coverImageUrl: text("cover_image_url"),
	metaTitle: text("meta_title"),
	metaDescription: text("meta_description"),
	isPublished: boolean("is_published").default(false).notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	authorName: text("author_name"),
	authorAvatarUrl: text("author_avatar_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	unique("posts_slug_key").on(table.slug),
]);

export const plans = pgTable("plans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	type: text(),
	speed: text(),
	price: numeric(),
	highlight: boolean(),
	hasTv: boolean("has_tv"),
	features: text().array(),
	originalPrice: numeric("original_price"),
	featuredChannelIds: uuid("featured_channel_ids").array(),
	whatsappNumber: text("whatsapp_number"),
	whatsappMessage: text("whatsapp_message"),
	conditions: text(),
	uploadSpeed: text("upload_speed"),
	downloadSpeed: text("download_speed"),
	firstMonthPrice: numeric("first_month_price", { precision: 10, scale:  2 }),
	sortOrder: integer("sort_order").default(0),
	buttonActionType: text("button_action_type").default('link').notNull(),
	buttonWhatsappMessage: text("button_whatsapp_message"),
	displayOn: text("display_on").default('sales_page').notNull(),
	triggerType: text("trigger_type").default('delay').notNull(),
	triggerValue: integer("trigger_value").default(5),
	frequency: text().default('once_per_session').notNull(),
});

export const popups = pgTable("popups", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	title: text(),
	content: text(),
	imageUrl: text("image_url"),
	buttonText: text("button_text"),
	buttonLink: text("button_link"),
	displayOn: text("display_on").default('sales_page'),
	triggerType: text("trigger_type").default('delay'),
	triggerValue: integer("trigger_value").default(5),
	frequency: text().default('once_per_session'),
	isActive: boolean("is_active").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	planId: uuid("plan_id"),
}, (table) => [
	foreignKey({
			columns: [table.planId],
			foreignColumns: [plans.id],
			name: "popups_plan_id_fkey"
		}).onDelete("set null"),
]);

export const tvPackageChannels = pgTable("tv_package_channels", {
	packageId: uuid("package_id").notNull(),
	channelId: uuid("channel_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.channelId],
			foreignColumns: [tvChannels.id],
			name: "tv_package_channels_channel_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.packageId],
			foreignColumns: [tvPackages.id],
			name: "tv_package_channels_package_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.packageId, table.channelId], name: "tv_package_channels_pkey"}),
	pgPolicy("Enable public read access", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

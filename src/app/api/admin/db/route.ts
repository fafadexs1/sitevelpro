import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { and, asc, desc, eq, gte, inArray, lt, sql, SQL } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/middleware";

const tableMap: Record<string, any> = {
  cities: schema.cities,
  domains: schema.domains,
  conversion_events: schema.conversion_events,
  dynamic_seo_rules: schema.dynamic_seo_rules,
  hero_slides: schema.hero_slides,
  leads: schema.leads,
  plans: schema.plans,
  popups: schema.popups,
  posts: schema.posts,
  seo_settings: schema.seo_settings,
  system_settings: schema.system_settings,
  users: schema.users,
  tracking_tags: schema.tracking_tags,
  tv_channels: schema.tv_channels,
  tv_packages: schema.tv_packages,
  tv_package_channels: schema.tv_package_channels,
  events: schema.events,
  redirects: schema.redirects,
  referral_settings: schema.referral_settings,
  referrals: schema.referrals,
  visits: schema.visits,
  faqs: schema.faqs,
  games: schema.games,
  testimonials: schema.testimonials,
};

type Filter = {
  op: "eq" | "in" | "gte" | "lt";
  column: string;
  value: any;
};

type Order = {
  column: string;
  ascending: boolean;
};

type Payload = {
  table: string;
  action: "select" | "insert" | "update" | "delete" | "upsert";
  columns?: string[] | null;
  returning?: string[] | null;
  values?: any;
  filters?: Filter[];
  order?: Order[];
  limit?: number;
  single?: boolean;
  maybeSingle?: boolean;
  onConflict?: string | null;
};

export async function POST(request: Request) {
  // Require authentication for all database operations
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return auth.error;
  }

  const payload = (await request.json()) as Payload;
  const table = tableMap[payload.table];

  if (!table) {
    return NextResponse.json({ data: null, error: { message: "Unknown table" } }, { status: 400 });
  }

  try {
    switch (payload.action) {
      case "select": {
        const query = buildSelect(table, payload.columns);
        const withFilters = applyFilters(query, table, payload.filters);
        const ordered = applyOrder(withFilters, table, payload.order);
        const limited = applyLimit(ordered, payload.limit);
        const rows = await limited;
        return NextResponse.json(formatSingle(rows, payload.single, payload.maybeSingle));
      }
      case "insert": {
        const values = sanitizeValues(table, payload.values);
        const insert = db.insert(table).values(values);
        const returning = buildReturning(table, payload.returning);
        const rows = returning ? await insert.returning(returning) : await insert.returning();
        return NextResponse.json(formatSingle(rows, payload.single, payload.maybeSingle));
      }
      case "update": {
        const values = sanitizeValues(table, payload.values);
        const base = db.update(table).set(values);
        const filtered = applyFilters(base, table, payload.filters);
        const returning = buildReturning(table, payload.returning);
        const rows = returning ? await filtered.returning(returning) : await filtered.returning();
        return NextResponse.json(formatSingle(rows, payload.single, payload.maybeSingle));
      }
      case "delete": {
        const base = db.delete(table);
        const filtered = applyFilters(base, table, payload.filters);
        const returning = buildReturning(table, payload.returning);
        const rows = returning ? await filtered.returning(returning) : await filtered.returning();
        return NextResponse.json(formatSingle(rows, payload.single, payload.maybeSingle));
      }
      case "upsert": {
        const values = sanitizeValues(table, payload.values);
        const conflictColumn =
          (payload.onConflict && table[payload.onConflict]) || table.id || null;

        if (!conflictColumn) {
          return NextResponse.json(
            { data: null, error: { message: "No conflict column available" } },
            { status: 400 },
          );
        }

        const insert = db
          .insert(table)
          .values(values)
          .onConflictDoUpdate({
            target: conflictColumn,
            set: buildExcludedSet(table, values, payload.onConflict ?? "id"),
          });

        const returning = buildReturning(table, payload.returning);
        const rows = returning ? await insert.returning(returning) : await insert.returning();

        return NextResponse.json(formatSingle(rows, payload.single, payload.maybeSingle));
      }
      default:
        return NextResponse.json({ data: null, error: { message: "Invalid action" } }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: { message: error?.message || "Database error", code: error?.code } },
      { status: 500 },
    );
  }
}

function buildSelect(table: any, columns?: string[] | null) {
  if (!columns || columns.length === 0) {
    return db.select().from(table);
  }
  const selection: Record<string, any> = {};
  columns.forEach((col) => {
    if (table[col]) {
      selection[col] = table[col];
    }
  });
  return db.select(selection).from(table);
}

function buildReturning(table: any, columns?: string[] | null) {
  if (!columns || columns.length === 0) {
    return null;
  }
  const selection: Record<string, any> = {};
  columns.forEach((col) => {
    if (table[col]) {
      selection[col] = table[col];
    }
  });
  return Object.keys(selection).length > 0 ? selection : null;
}

function applyFilters(query: any, table: any, filters?: Filter[]) {
  if (!filters || filters.length === 0) return query;

  // Collect all conditions first
  const conditions: SQL[] = [];

  for (const filter of filters) {
    const column = table[filter.column];
    if (!column) continue;

    if (filter.op === "eq") {
      conditions.push(eq(column, filter.value));
    } else if (filter.op === "in") {
      conditions.push(inArray(column, filter.value));
    } else if (filter.op === "gte") {
      conditions.push(gte(column, filter.value));
    } else if (filter.op === "lt") {
      conditions.push(lt(column, filter.value));
    }
  }

  // Apply all conditions with AND
  if (conditions.length === 0) return query;
  if (conditions.length === 1) return query.where(conditions[0]);
  return query.where(and(...conditions));
}

function applyOrder(query: any, table: any, order?: Order[]) {
  if (!order || order.length === 0) return query;
  const orderBy = order
    .map((item) => {
      const column = table[item.column];
      if (!column) return null;
      return item.ascending ? asc(column) : desc(column);
    })
    .filter(Boolean);

  if (orderBy.length === 0) return query;
  return query.orderBy(...orderBy);
}

function applyLimit(query: any, limit?: number) {
  if (!limit || limit <= 0) return query;
  return query.limit(limit);
}

function sanitizeValues(table: any, values: any): Record<string, any> | Record<string, any>[] {
  if (Array.isArray(values)) {
    return values.map((value) => sanitizeValues(table, value));
  }

  const columnKeys = getTableColumnKeys(table);
  const cleaned: Record<string, any> = {};
  Object.entries(values ?? {}).forEach(([key, value]) => {
    if (!columnKeys.has(key)) return;
    if (value === undefined) return;
    cleaned[key] = value;
  });
  return cleaned;
}

function getTableColumnKeys(table: any) {
  const keys = new Set<string>();
  Object.entries(table).forEach(([key, value]) => {
    if (value && typeof value === "object" && "name" in value && "table" in value) {
      keys.add(key);
    }
  });
  return keys;
}

function buildExcludedSet(table: any, values: any, conflictKey: string) {
  const columnKeys = getTableColumnKeys(table);
  const sample = Array.isArray(values) ? values[0] ?? {} : values ?? {};
  const set: Record<string, any> = {};

  Object.keys(sample).forEach((key) => {
    if (!columnKeys.has(key)) return;
    if (key === conflictKey) return;
    set[key] = sql.raw(`excluded.${key}`);
  });

  return set;
}

function formatSingle(rows: any[], single?: boolean, maybeSingle?: boolean) {
  if (!single && !maybeSingle) {
    return { data: rows, error: null };
  }
  const first = rows?.[0] ?? null;
  if (!first && single) {
    return { data: null, error: { message: "No rows returned" } };
  }
  return { data: first, error: null };
}

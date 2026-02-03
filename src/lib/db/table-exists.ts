import { sql } from "drizzle-orm";
import { db } from "@/db";

const tableCache = new Map<string, boolean>();

export async function tableExists(tableName: string) {
  if (tableCache.has(tableName)) {
    return tableCache.get(tableName) ?? false;
  }

  try {
    const result = await db.execute(
      sql`select to_regclass(${`public.${tableName}`}) as name`,
    );
    const rows = Array.isArray(result) ? result : ((result as any).rows ?? []);
    const exists = Boolean(rows[0]?.name);
    tableCache.set(tableName, exists);
    return exists;
  } catch (error) {
    console.error(`Error checking table "${tableName}":`, error);
    tableCache.set(tableName, false);
    return false;
  }
}

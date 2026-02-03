"use server";

import { db } from "@/db";
import { conversion_events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ConversionEvent } from '@/types/admin';

export async function getConversionEvents(): Promise<ConversionEvent[]> {
    try {
        const events = await db.select().from(conversion_events).where(eq(conversion_events.is_active, true));

        return events.map(e => ({
            id: e.id,
            name: e.name,
            event_snippet: e.event_snippet,
            selector: e.selector,
            is_active: e.is_active ?? true, // Default to true since we filtered by true anyway? or false. Schema default is true.
            type: 'custom' as const
        }));
    } catch (error) {
        console.error("Error fetching conversion events:", error);
        return [];
    }
}

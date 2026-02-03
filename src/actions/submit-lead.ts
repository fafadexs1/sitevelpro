"use server";

import { db } from "@/db";
import { leads } from "@/db/schema";

interface LeadData {
    fullName: string;
    email: string;
    phone: string;
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
}

export async function submitLead(data: LeadData) {
    try {
        const { fullName, ...rest } = data;
        await db.insert(leads).values({
            full_name: fullName,
            ...rest,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error submitting lead:", error);
        return { success: false, error: error.message };
    }
}

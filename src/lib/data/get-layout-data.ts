
import { db } from "@/db";
import { domains, system_settings, seo_settings, tracking_tags, popups, plans, conversion_events, tv_channels } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { headers } from "next/headers";

export type DomainType = 'main_site' | 'sales_page';

export async function getDomainType(): Promise<DomainType> {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const hostname = host.split(':')[0]; // Remove port if present

    // Fallback for localhost development usually treated as sales_page or main_site depending on preference
    // If not found in DB, default to sales_page
    try {
        const domainEntry = await db.select().from(domains).where(eq(domains.hostname, hostname)).limit(1);
        return (domainEntry[0]?.type as DomainType) || 'sales_page';
    } catch (e) {
        console.error("Error fetching domain type:", e);
        return 'sales_page';
    }
}

export async function getGlobalSettings() {
    try {
        const settings = await db.select().from(system_settings).where(inArray(system_settings.key, ['company_logo_url', 'commemorative_theme_enabled']));
        const logoSetting = settings.find(s => s.key === 'company_logo_url');
        const themeSetting = settings.find(s => s.key === 'commemorative_theme_enabled');

        return {
            companyLogoUrl: logoSetting?.value || null,
            commemorativeThemeEnabled: themeSetting?.value === 'true'
        };
    } catch (e) {
        console.error("Error fetching global settings:", e);
        return { companyLogoUrl: null, commemorativeThemeEnabled: false };
    }
}

export async function getSeoSettings() {
    try {
        const seo = await db.select().from(seo_settings).limit(1);
        return seo[0] || null;
    } catch (e) {
        console.error("Error fetching SEO settings:", e);
        return null;
    }
}

export async function getLayoutData() {
    const domainType = await getDomainType();
    const { companyLogoUrl, commemorativeThemeEnabled } = await getGlobalSettings();
    const seo = await getSeoSettings();

    // Tracking tags only for sales_page
    let tags: any[] = [];
    if (domainType === 'sales_page') {
        try {
            tags = await db.select().from(tracking_tags).where(eq(tracking_tags.is_active, true));
        } catch (e) {
            console.error("Error fetching tracking tags:", e);
        }
    }

    // Popups
    let formattedPopups: any[] = [];
    try {
        const activePopups = await db.select().from(popups).where(eq(popups.is_active, true));

        // Fetch plans for popups that have plan_id
        const planIds = activePopups
            .map(p => p.plan_id)
            .filter((id): id is string => typeof id === 'string' && id.length > 0);
        let popupPlans: any[] = [];
        if (planIds.length > 0) {
            popupPlans = await db.select().from(plans).where(inArray(plans.id, planIds));
        }

        // Combine popup with plan
        formattedPopups = activePopups.map(p => ({
            ...p,
            plans: popupPlans.find(pl => pl.id === p.plan_id) || null
        }));
    } catch (e) {
        console.error("Error fetching popups:", e);
    }

    let events: any[] = [];
    try {
        events = await db.select().from(conversion_events).where(eq(conversion_events.is_active, true));
    } catch (e) {
        console.error("Error fetching conversion events:", e);
    }

    return {
        seo,
        domainType,
        companyLogoUrl,
        commemorativeThemeEnabled,
        tags,
        popups: formattedPopups,
        conversionEvents: events
    };
}

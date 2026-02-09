import { NextResponse } from 'next/server';
import { db } from '@/db';
import { events } from '@/db/schema';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { visitorId, hostname, pathname, eventName, properties } = body;

        if (!visitorId || !pathname || !eventName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await db.insert(events).values({
            visitor_id: visitorId,
            hostname: hostname || null,
            pathname: pathname,
            name: eventName,
            properties: properties || {},
        });

        return new NextResponse('Event tracked successfully', { status: 200 });
    } catch (error) {
        console.error('Error tracking event:', error);
        return NextResponse.json(
            { error: 'Failed to track event' },
            { status: 500 }
        );
    }
}

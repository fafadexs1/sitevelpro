import { NextResponse } from 'next/server';
import { db } from '@/db';
import { visits } from '@/db/schema';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { visitorId, hostname, pathname, isNewVisitor } = body;

        if (!visitorId || !pathname) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await db.insert(visits).values({
            visitor_id: visitorId,
            hostname: hostname || null,
            pathname: pathname,
            is_new_visitor: isNewVisitor || false,
        });

        return new NextResponse('Visit tracked successfully', { status: 200 });
    } catch (error) {
        console.error('Error tracking visit:', error);
        return NextResponse.json(
            { error: 'Failed to track visit' },
            { status: 500 }
        );
    }
}

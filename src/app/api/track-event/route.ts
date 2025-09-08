
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { visitorId, pathname, eventName, properties } = body;

        if (!visitorId || !pathname || !eventName) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const supabase = createClient();

        const { error } = await supabase.from('events').insert({
            visitor_id: visitorId,
            pathname: pathname,
            name: eventName,
            properties: properties || {},
        });

        if (error) {
            console.error('Supabase error tracking event:', error);
            return new NextResponse(error.message, { status: 500 });
        }

        return new NextResponse('Event tracked successfully', { status: 200 });

    } catch (e) {
        console.error('Error processing track event request:', e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

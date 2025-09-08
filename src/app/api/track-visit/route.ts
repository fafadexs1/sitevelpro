
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { visitorId, pathname, isNewVisitor } = body;

        if (!visitorId || !pathname) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const supabase = createClient();

        const { error } = await supabase.from('visits').insert({
            visitor_id: visitorId,
            pathname: pathname,
            is_new_visitor: isNewVisitor,
        });

        if (error) {
            console.error('Supabase error tracking visit:', error);
            return new NextResponse(error.message, { status: 500 });
        }

        return new NextResponse('Visit tracked successfully', { status: 200 });

    } catch (e) {
        console.error('Error processing track visit request:', e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

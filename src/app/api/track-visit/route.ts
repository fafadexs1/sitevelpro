
import { NextResponse } from 'next/server';
// import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    // Analytics temporarily disabled during migration
    return new NextResponse('Visit tracked successfully', { status: 200 });
}


import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This is a Supabase client that should only be used in server-side code.
// It has the service_role key, which bypasses all RLS policies.
// Use this client for administrative tasks that need to bypass RLS.
export function createAdminClient() {
    const cookieStore = cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )
}

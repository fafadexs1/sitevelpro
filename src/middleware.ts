
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Força HTTPS em produção
  if (process.env.NODE_ENV === 'production') {
    if (request.headers.get('x-forwarded-proto') !== 'https') {
      return NextResponse.redirect(
        `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
        301
      );
    }
  }

  // Supabase Auth logic removed during migration to localized Postgres.
  // Authentication is currently disabled.

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

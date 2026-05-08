import { type NextRequest, NextResponse } from 'next/server';

const seoRedirects: Record<string, string> = {
  '/cidade-ocidental': '/internet-em-cidade-ocidental',
  '/luziania': '/internet-em-luziania',
  '/valparaiso-de-goias': '/internet-em-valparaiso-de-goias',
  '/jardim-inga-luziania': '/internet-em-jardim-inga-luziania',
  '/ponte-alta-norte-gama': '/internet-em-ponte-alta-norte-gama',
};

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const redirectTarget = seoRedirects[request.nextUrl.pathname];

  if (redirectTarget) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTarget;
    return NextResponse.redirect(url, 301);
  }

  if (process.env.NODE_ENV === 'production' && !host.startsWith('localhost')) {
    if (request.headers.get('x-forwarded-proto') !== 'https') {
      return NextResponse.redirect(
        `https://${host}${request.nextUrl.pathname}`,
        301
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Força HTTPS em produção
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
    const newUrl = new URL(request.url);
    newUrl.protocol = 'https:';
    return NextResponse.redirect(newUrl.toString(), 301); // 301 para redirecionamento permanente
  }

  // Primeiro, lida com a sessão do Supabase
  const { response, supabase } = await updateSession(request);

  // Lógica de Redirecionamento
  const { pathname } = request.nextUrl;
  
  // Evita redirecionamentos em caminhos de API, assets ou admin
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/admin')) {
    return response;
  }

  const { data: redirect, error } = await supabase
    .from('redirects')
    .select('destination_path, type')
    .eq('source_path', pathname)
    .single();

  if (error) {
    // Se não for o erro "PGRST116" (nenhuma linha encontrada), logue o erro.
    if (error.code !== 'PGRST116') {
      console.error('Redirect lookup error:', error);
    }
  }

  if (redirect) {
    const statusCode = redirect.type === 'permanent' ? 301 : 302;
    return NextResponse.redirect(new URL(redirect.destination_path, request.url), statusCode);
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

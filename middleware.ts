import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

//redirects https://exa-hallucination-detector.vercel.app to demo.exa.ai/hallucination-detector
export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  
  // Normalize old demo host redirect (fix header comparison)
  const host = request.headers.get('host');
  if (host === 'exa-hallucination-detector.vercel.app') {
    return NextResponse.redirect('https://demo.exa.ai/hallucination-detector', { status: 301 });
  }

  // Convenience redirects - basePath is currently disabled
  if (pathname === '/') {
    return NextResponse.redirect(`${origin}/hallucination-detector`, { status: 308 });
  }

  // Note: /landing redirect disabled temporarily for debugging

  return NextResponse.next();
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 

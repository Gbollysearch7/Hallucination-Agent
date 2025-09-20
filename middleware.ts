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

  // Convenience redirects so basePath pages are reachable without prefix in dev/preview
  if (pathname === '/') {
    return NextResponse.redirect(`${origin}/hallucination-detector`, { status: 308 });
  }

  if (pathname === '/landing') {
    return NextResponse.redirect(`${origin}/hallucination-detector/landing`, { status: 308 });
  }

  return NextResponse.next();
}
export const config = {
  matcher: '/:path*'
} 

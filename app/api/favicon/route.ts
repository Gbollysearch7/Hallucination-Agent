import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 86400; // 24h

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('d');
  if (!domain) return NextResponse.json({ error: 'Missing domain' }, { status: 400 });

  // Try DuckDuckGo favicon first, then Google
  const candidates = [
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { next: { revalidate } });
      if (!res.ok) continue;
      const buff = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') || 'image/x-icon';
      return new NextResponse(buff, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate}`,
        },
      });
    } catch {}
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}


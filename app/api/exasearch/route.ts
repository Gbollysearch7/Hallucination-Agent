// app/api/exasearch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Exa from 'exa-js';

import { config } from '@/lib/config';
import { withRetry } from '@/lib/retry';

const requestSchema = z.object({
  claim: z.string().min(1, 'Claim cannot be empty'),
});

const exaResultSchema = z.object({
  results: z
    .array(
      z.object({
        text: z.string().optional().nullable(),
        url: z.string().optional().nullable(),
      })
    )
    .default([]),
});

const createExaClient = () => {
  if (!config.exa.apiKey) {
    throw new Error('EXA_API_KEY is not configured');
  }

  return new Exa(config.exa.apiKey);
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const json = await req.json();
    const parsedBody = requestSchema.safeParse({
      claim: typeof json?.claim === 'string' ? json.claim.trim() : json?.claim,
    });

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: parsedBody.error.flatten().fieldErrors,
          code: 'INVALID_BODY',
        },
        { status: 400 }
      );
    }

    const { claim } = parsedBody.data;

    const exa = createExaClient();

    const rawResults = await withRetry(
      () =>
        exa.searchAndContents(
          `${claim}\n\nHere is a web page to help verify this content:`,
          {
            type: 'auto',
            numResults: config.exa.maxResults,
            livecrawl: 'always',
            text: true,
          }
        ),
      { retries: config.exa.maxRetries }
    );

    const parsedResults = exaResultSchema.safeParse(rawResults);

    if (!parsedResults.success) {
      console.error('[exasearch] Invalid response from Exa', parsedResults.error);
      return NextResponse.json(
        { error: 'Received invalid data from Exa', code: 'EXA_INVALID_RESPONSE' },
        { status: 502 }
      );
    }

    const simplifiedResults = parsedResults.data.results
      .map((item) => ({
        text: item.text?.trim() ?? '',
        url: item.url?.trim() ?? '',
      }))
      .filter((item) => item.url.length > 0 && item.text.length > 0)
      .reverse();

    console.info(
      '[exasearch] Completed',
      JSON.stringify({
        claimLength: claim.length,
        resultCount: simplifiedResults.length,
        durationMs: Date.now() - startTime,
      })
    );

    if (simplifiedResults.length === 0) {
      return NextResponse.json(
        {
          error: 'No supporting sources found',
          code: 'EXA_NO_RESULTS',
          results: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ results: simplifiedResults });
  } catch (error) {
    console.error('[exasearch] Search failed', error);
    const message =
      error instanceof Error ? error.message : 'Failed to perform search';

    const status = message.includes('not configured') ? 500 : 502;

    return NextResponse.json(
      {
        error: message,
        code: 'EXA_SEARCH_FAILED',
      },
      { status }
    );
  }
}

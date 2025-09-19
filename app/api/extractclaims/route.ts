// app/api/extractclaims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { z } from 'zod';

import { config } from '@/lib/config';
import { withRetry } from '@/lib/retry';

// This function can run for a maximum of 60 seconds
export const maxDuration = 60;

const requestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

const claimSchema = z.object({
  claim: z.string().min(1),
  original_text: z.string().min(1),
});

const claimsArraySchema = z.array(claimSchema);

const createGroqClient = () => {
  if (!config.groq.apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  return new Groq({
    apiKey: config.groq.apiKey,
  });
};

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    const json = await req.json();
    const parsedBody = requestSchema.safeParse({
      content: typeof json?.content === 'string' ? json.content.trim() : json?.content,
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

    const { content } = parsedBody.data;
    const groq = createGroqClient();

    const chatCompletion = await withRetry(
      () =>
        groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                "You are an expert at extracting claims from text. Your task is to identify and list all claims present, true or false, in the given text. Each claim should be a verifiable statement. If the input content is very lengthy, then pick the major claims. Don't repeat the same claim. For each claim, also provide the original part of the sentence from which the claim is derived. Present the claims as a JSON array of objects. Each object should have two keys: \"claim\": the extracted claim in a single verifiable statement, and \"original_text\": the portion of the original text that supports or contains the claim. Do not include any additional text or commentary. Return the output strictly as a JSON array of objects following this schema: [{\"claim\": \"extracted claim here\", \"original_text\": \"original text portion here\"}, ...] Output the result as valid JSON, strictly adhering to the defined schema. Ensure there are no markdown codes or additional elements included in the output. Do not add anything else. Return only JSON.",
            },
            {
              role: 'user',
              content: `Here is the content: ${content}`,
            },
          ],
          model: config.groq.model,
          response_format: { type: 'json_object' },
          temperature: config.groq.temperature,
          top_p: config.groq.topP,
        }),
      { retries: config.groq.maxRetries }
    );

    const response = chatCompletion.choices[0]?.message?.content;
    if (!response) {
      return NextResponse.json(
        { error: 'Groq API returned an empty response', code: 'GROQ_EMPTY_RESPONSE' },
        { status: 502 }
      );
    }

    let parsedResponse: unknown;

    try {
      parsedResponse = JSON.parse(response);
    } catch (error) {
      console.error('[extractclaims] Invalid JSON from Groq', error, response);
      return NextResponse.json(
        {
          error: 'Groq API returned invalid JSON',
          code: 'GROQ_INVALID_JSON',
        },
        { status: 502 }
      );
    }

    const claims = Array.isArray(parsedResponse)
      ? parsedResponse
      : (parsedResponse as { claims?: unknown })?.claims;

    const validatedClaims = claimsArraySchema.safeParse(claims);

    if (!validatedClaims.success) {
      console.error('[extractclaims] Groq response validation failed', validatedClaims.error);
      return NextResponse.json(
        {
          error: 'Groq API returned data in an unexpected format',
          code: 'GROQ_INVALID_SCHEMA',
        },
        { status: 502 }
      );
    }

    console.info(
      '[extractclaims] Completed',
      JSON.stringify({
        claimCount: validatedClaims.data.length,
        durationMs: Date.now() - startedAt,
      })
    );

    return NextResponse.json({ claims: validatedClaims.data });
  } catch (error) {
    console.error('[extractclaims] Failed', error);
    const message = error instanceof Error ? error.message : 'Failed to extract claims';
    const status = message.includes('not configured') ? 500 : 502;

    return NextResponse.json(
      {
        error: message,
        code: 'CLAIM_EXTRACTION_FAILED',
      },
      { status }
    );
  }
}

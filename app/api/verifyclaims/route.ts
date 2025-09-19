// app/api/verifyclaims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { z } from 'zod';

import { config } from '@/lib/config';
import { withRetry } from '@/lib/retry';

export const maxDuration = 60;

const requestSchema = z.object({
  claim: z.string().min(1),
  original_text: z.string().min(1),
  exasources: z
    .array(
      z.object({
        text: z.string().optional().nullable(),
        url: z.string().optional().nullable(),
      })
    )
    .min(1),
});

const factCheckSchema = z.object({
  claim: z.string(),
  assessment: z.enum(['True', 'False', 'Insufficient Information']),
  summary: z.string(),
  fixed_original_text: z.string(),
  confidence_score: z.number().min(0).max(100),
});

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
    const parsedBody = requestSchema.safeParse(json);

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

    const { claim, original_text, exasources } = parsedBody.data;

    const sources = exasources
      .map((source, index) => ({
        text: source.text?.trim() ?? '',
        url: source.url?.trim() ?? '',
        index,
      }))
      .filter((source) => source.text.length > 0);

    if (sources.length === 0) {
      return NextResponse.json(
        {
          error: 'At least one source with text content is required',
          code: 'NO_VALID_SOURCES',
        },
        { status: 400 }
      );
    }

    const groq = createGroqClient();

    const sourcesText = sources
      .map(
        (source, index) =>
          `Source ${index + 1}:\nText: ${source.text}${source.url ? `\nURL: ${source.url}` : ''}`
      )
      .join('\n\n');

    const systemPrompt = `You are an expert fact-checker. Given a claim and a set of sources, determine whether the claim is true or false based on the text from sources (or if there is insufficient information).

For your analysis, consider all the sources collectively.

Provide your answer as a JSON object with the following structure:
{
  "claim": "...",
  "assessment": "True" or "False" or "Insufficient Information",
  "summary": "Why is this claim correct and if it isn't correct, then what's correct. In a single line.",
  "fixed_original_text": "If the assessment is False then correct the original text (keeping everything as it is and just fix the fact in the part of the text)",
  "confidence_score": a percentage number between 0 and 100 (100 means fully confident that the decision you have made is correct, 0 means you are completely unsure)
}`;

    const userPrompt = `Here are the sources:\n${sourcesText}\n\nHere is the Original part of the text: ${original_text}\n\nHere is the claim: ${claim}`;

    const chatCompletion = await withRetry(
      () =>
        groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
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
      console.error('[verifyclaims] Invalid JSON from Groq', error, response);
      return NextResponse.json(
        { error: 'Groq API returned invalid JSON', code: 'GROQ_INVALID_JSON' },
        { status: 502 }
      );
    }

    const validatedResult = factCheckSchema.safeParse(parsedResponse);

    if (!validatedResult.success) {
      console.error('[verifyclaims] Groq response validation failed', validatedResult.error);
      return NextResponse.json(
        {
          error: 'Groq API returned data in an unexpected format',
          code: 'GROQ_INVALID_SCHEMA',
        },
        { status: 502 }
      );
    }

    console.info(
      '[verifyclaims] Completed',
      JSON.stringify({
        durationMs: Date.now() - startedAt,
        assessment: validatedResult.data.assessment,
        confidence: validatedResult.data.confidence_score,
      })
    );

    return NextResponse.json({ claims: validatedResult.data });
  } catch (error) {
    console.error('[verifyclaims] Failed', error);
    const message = error instanceof Error ? error.message : 'Failed to verify claims';
    const status = message.includes('not configured') ? 500 : 502;

    return NextResponse.json(
      {
        error: message,
        code: 'CLAIM_VERIFICATION_FAILED',
      },
      { status }
    );
  }
}

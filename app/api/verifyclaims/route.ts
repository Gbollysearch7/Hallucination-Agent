// app/api/verifyclaims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { claim, original_text, exasources } = await req.json();

    if (!claim || !original_text || !exasources) {
      return NextResponse.json({ error: 'Claim and sources are required' }, { status: 400 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Format sources for the prompt
    const sourcesText = exasources.map((source: any, index: number) =>
      `Source ${index + 1}:\nText: ${source.text}\nURL: ${source.url}`
    ).join('\n\n');

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

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      model: 'llama-3.1-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const response = chatCompletion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq API');
    }

    // Parse the JSON response
    const result = JSON.parse(response);

    // Validate the response structure
    const factCheckSchema = z.object({
      claim: z.string(),
      assessment: z.enum(["True", "False", "Insufficient Information"]),
      summary: z.string(),
      fixed_original_text: z.string(),
      confidence_score: z.number().min(0).max(100)
    });

    const validatedResult = factCheckSchema.parse(result);

    console.log('LLM response:', validatedResult);

    return NextResponse.json({ claims: validatedResult });
  } catch (error) {
    console.error('Verify claims API error:', error);
    return NextResponse.json({ error: `Failed to verify claims | ${error}` }, { status: 500 });
  }
}
// app/api/extractclaims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// This function can run for a maximum of 60 seconds
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting claims from text. Your task is to identify and list all claims present, true or false, in the given text. Each claim should be a verifiable statement. If the input content is very lengthy, then pick the major claims. Don\'t repeat the same claim. For each claim, also provide the original part of the sentence from which the claim is derived. Present the claims as a JSON array of objects. Each object should have two keys: "claim": the extracted claim in a single verifiable statement, and "original_text": the portion of the original text that supports or contains the claim. Do not include any additional text or commentary. Return the output strictly as a JSON array of objects following this schema: [{"claim": "extracted claim here", "original_text": "original text portion here"}, ...] Output the result as valid JSON, strictly adhering to the defined schema. Ensure there are no markdown codes or additional elements included in the output. Do not add anything else. Return only JSON.'
        },
        {
          role: 'user',
          content: `Here is the content: ${content}`
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
    const claims = JSON.parse(response);

    // Ensure the response is an array of claim objects
    if (!Array.isArray(claims)) {
      throw new Error('Invalid response format - expected array');
    }

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Extract claims API error:', error);
    return NextResponse.json({ error: `Failed to extract claims | ${error}` }, { status: 500 });
  }
}
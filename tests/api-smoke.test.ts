import assert from 'node:assert/strict';
import Module from 'node:module';

process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-groq-key';
process.env.EXA_API_KEY = process.env.EXA_API_KEY || 'test-exa-key';
process.env.GROQ_MODEL = 'gpt-oss-120b-128k';
process.env.GROQ_MAX_RETRIES = '0';
process.env.EXA_MAX_RETRIES = '0';
process.env.EXA_MAX_RESULTS = '2';

type GroqCreateHandler = (params: any) => Promise<any>;
type ExaSearchHandler = (...args: any[]) => Promise<any>;

type GroqRequest = Parameters<GroqCreateHandler>[0];

let groqCreateImpl: GroqCreateHandler = async () => ({
  choices: [
    {
      message: {
        content: JSON.stringify([{ claim: 'Default claim', original_text: 'Default text' }]),
      },
    },
  ],
});

let exaSearchImpl: ExaSearchHandler = async () => ({
  results: [
    {
      text: 'Example snippet',
      url: 'https://example.com',
    },
  ],
});

class GroqMock {
  public chat: { completions: { create: (params: GroqRequest) => Promise<any> } };

  constructor() {
    this.chat = {
      completions: {
        create: (params: GroqRequest) => groqCreateImpl(params),
      },
    };
  }
}

class ExaMock {
  searchAndContents(...args: any[]) {
    return exaSearchImpl(...args);
  }
}

const moduleAny = Module as unknown as { _load: (...args: any[]) => any };
const originalLoad = moduleAny._load.bind(Module);

moduleAny._load = function mockLoad(request: string, parent: NodeModule | null, isMain: boolean) {
  if (request === 'groq-sdk') {
    return { default: GroqMock };
  }

  if (request === 'exa-js') {
    return { default: ExaMock };
  }

  return originalLoad(request, parent, isMain);
};

const { POST: extractClaimsRoute } = require('../app/api/extractclaims/route');
const { POST: verifyClaimsRoute } = require('../app/api/verifyclaims/route');
const { POST: exaSearchRoute } = require('../app/api/exasearch/route');

async function testExtractClaims() {
  groqCreateImpl = async () => ({
    choices: [
      {
        message: {
          content: JSON.stringify([
            { claim: 'The sky is blue', original_text: 'The sky is blue on clear days.' },
          ]),
        },
      },
    ],
  });

  const request = new Request('http://localhost/api/extractclaims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'The sky is blue on clear days.' }),
  });

  const response = await extractClaimsRoute(request as any);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.ok(Array.isArray(payload.claims));
  assert.equal(payload.claims.length, 1);
  assert.equal(payload.claims[0].claim, 'The sky is blue');
}

async function testVerifyClaims() {
  groqCreateImpl = async (params: any) => {
    assert.ok(params.messages[1].content.includes('The sky is blue'));
    return {
      choices: [
        {
          message: {
            content: JSON.stringify({
              claim: 'The sky is blue',
              assessment: 'True',
              summary: 'Atmospheric scattering makes the sky appear blue.',
              fixed_original_text: 'The sky is blue on clear days.',
              confidence_score: 92,
            }),
          },
        },
      ],
    };
  };

  const request = new Request('http://localhost/api/verifyclaims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      claim: 'The sky is blue',
      original_text: 'The sky is blue on clear days.',
      exasources: [
        {
          text: 'Light is scattered by the atmosphere, making the sky look blue.',
          url: 'https://example.com/sky',
        },
      ],
    }),
  });

  const response = await verifyClaimsRoute(request as any);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.claims.assessment, 'True');
  assert.equal(payload.claims.confidence_score, 92);
}

async function testExaSearch() {
  exaSearchImpl = async () => ({
    results: [
      {
        text: 'Light scattering makes the sky appear blue.',
        url: 'https://example.com/physics/sky',
      },
    ],
  });

  const request = new Request('http://localhost/api/exasearch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim: 'The sky is blue' }),
  });

  const response = await exaSearchRoute(request as any);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.ok(Array.isArray(payload.results));
  assert.equal(payload.results.length, 1);
  assert.equal(payload.results[0].url, 'https://example.com/physics/sky');
}

async function run() {
  await testExtractClaims();
  await testVerifyClaims();
  await testExaSearch();
  console.log('API smoke tests passed');
}

run().catch((error) => {
  console.error('API smoke tests failed');
  console.error(error);
  process.exit(1);
});

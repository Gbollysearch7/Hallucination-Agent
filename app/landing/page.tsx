import type { Metadata } from 'next';
import CTAButton from '@/components/marketing/CTAButton';
import Newsletter from '@/components/marketing/Newsletter';
import Image from 'next/image';
import { OpenAIIcon, AnthropicIcon, GroqIcon, SlackIcon } from '@/components/icons/Logos';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FactCheck AI — Publish AI content that stands up to scrutiny',
  description: 'Extract claims, verify against the web, and approve Groq‑powered corrections in seconds. Every answer ships with proof.',
  openGraph: {
    title: 'FactCheck AI — Publish AI content that stands up to scrutiny',
    description: 'Extract claims, verify against the web, and approve corrections in seconds.',
    images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630 }],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FactCheck AI',
    description: 'Every answer ships with proof.'
  }
};

export default function Landing() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="font-semibold tracking-tight">FactCheck<span className="text-white/60"> AI</span></div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a href="#platform" className="hover:text-white">Platform</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#resources" className="hover:text-white">Resources</a>
            <a href="/hallucination-detector/pricing" className="hover:text-white">Pricing</a>
            <a href="/hallucination-detector" className="ml-4 px-3 py-1.5 rounded-full bg-white text-neutral-900">Open App</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-white/20 bg-white/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Now shipping • FactCheck AI control center
          </div>
          <h1 className="text-4xl md:text-6xl font-medium leading-tight tracking-tight max-w-3xl">
            Publish AI content that stands up to scrutiny.
          </h1>
          <p className="text-white/70 text-lg md:text-xl mt-4 max-w-2xl">
            Extract claims, verify against the web, and approve corrections in seconds. Every answer ships with proof.
          </p>
          <div className="mt-8 flex gap-3">
            <CTAButton href="/hallucination-detector" event="landing_try_app">Try the app</CTAButton>
            <CTAButton href="#how" event="landing_watch_tour" variant="ghost">Watch the product tour</CTAButton>
          </div>
        </div>
      </section>

      {/* Product preview frame */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="relative rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[80%] h-24 rounded-full bg-white/5 blur-2xl" />
            <Image src="/opengraph-image.jpg" alt="FactCheck AI interface showing claim verification results" width={1200} height={630} className="w-full h-auto object-cover opacity-95" priority />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">Compare verification methods</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-white/60 text-sm mb-2">Manual fact-checking</div>
              <div className="text-white/70 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Hours of research time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Prone to human error</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Limited source coverage</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-white/60 text-sm mb-2">Basic AI tools</div>
              <div className="text-white/70 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Fast but inaccurate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>No source verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Black box processing</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 border-emerald-500/30">
              <div className="text-emerald-400 text-sm mb-2 font-medium">FactCheck AI</div>
              <div className="text-white/70 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Seconds to results</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>97% accuracy rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Transparent sourcing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos rail */}
      <section id="platform" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="text-white/50 text-sm mb-4">Powered by</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 opacity-80">
            <div className="flex items-center justify-center h-10">
              <OpenAIIcon className="w-20 h-20 text-white/60" />
            </div>
            <div className="flex items-center justify-center h-10">
              <AnthropicIcon className="w-16 h-16 text-white/60" />
            </div>
            <div className="flex items-center justify-center h-10">
              <GroqIcon className="w-12 h-12 text-white/60" />
            </div>
            <div className="flex items-center justify-center h-10">
              <SlackIcon className="w-24 h-24 text-white/60" />
            </div>
            <div className="flex items-center justify-center h-10 text-white/60 font-semibold">
              Exa
            </div>
            <div className="flex items-center justify-center h-10 text-white/60 font-semibold">
              Vercel
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ['53,000+', 'Claims analyzed'],
            ['97%', 'Avg. precision'],
            ['< 5s', 'Avg. time to verdict'],
            ['13,000+', 'Teams exploring'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-2xl font-semibold">{k}</div>
              <div className="text-white/60 text-sm">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits grid */}
      <section id="resources" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">The benefits that set us apart</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="h-8 w-8 rounded-md bg-blue-500/20 mb-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="font-medium mb-1">Real-time verification</div>
              <div className="text-white/70 text-sm">Verify claims against live web sources in seconds, not minutes.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="h-8 w-8 rounded-md bg-green-500/20 mb-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="font-medium mb-1">Powered by Groq</div>
              <div className="text-white/70 text-sm">Lightning-fast LLM inference for instant analysis and corrections.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="h-8 w-8 rounded-md bg-purple-500/20 mb-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="font-medium mb-1">Transparent sourcing</div>
              <div className="text-white/70 text-sm">Every conclusion backed by verifiable sources with clickable links.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="h-8 w-8 rounded-md bg-yellow-500/20 mb-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="font-medium mb-1">Smart corrections</div>
              <div className="text-white/70 text-sm">AI-powered fixes that maintain your content's voice and intent.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="h-8 w-8 rounded-md bg-red-500/20 mb-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="font-medium mb-1">Confidence scoring</div>
              <div className="text-white/70 text-sm">Know exactly how confident our AI is in each assessment.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="h-8 w-8 rounded-md bg-cyan-500/20 mb-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="font-medium mb-1">Export ready</div>
              <div className="text-white/70 text-sm">Export corrected content in multiple formats with sources intact.</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-white/60 text-sm mb-2">Step 1</div>
              <div className="font-medium mb-1">Paste or import content</div>
              <div className="text-white/70 text-sm">Drop your AI-generated text into our interface. We support markdown, plain text, and rich content.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-white/60 text-sm mb-2">Step 2</div>
              <div className="font-medium mb-1">We verify with proof</div>
              <div className="text-white/70 text-sm">Our AI extracts factual claims and searches the web using Exa API to verify each one with confidence scores.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-white/60 text-sm mb-2">Step 3</div>
              <div className="font-medium mb-1">Approve fixes & export</div>
              <div className="text-white/70 text-sm">Review verified claims, accept AI-generated corrections, and export polished content with sources intact.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials & FAQ */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">What customers say</h3>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-white/80 text-sm">"FactCheck AI has completely transformed our content workflow. We can now publish AI-generated content with complete confidence."</div>
                <div className="text-white/50 text-xs mt-2">Sarah Chen, Content Director, TechCorp</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-white/80 text-sm">"The speed and accuracy are incredible. What used to take hours of manual fact-checking now takes seconds."</div>
                <div className="text-white/50 text-xs mt-2">Mike Rodriguez, AI Product Manager</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-white/80 text-sm">"Being able to see the exact sources for every claim gives us the confidence to scale our AI content production."</div>
                <div className="text-white/50 text-xs mt-2">Emily Watson, Publishing Lead</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Frequently asked questions</h3>
            <div className="space-y-3">
              <details className="rounded-xl border border-white/10 bg-white/5 p-4 group">
                <summary className="cursor-pointer text-white/90 font-medium">How accurate is the fact-checking?</summary>
                <div className="text-white/70 text-sm mt-2">Our system achieves 97% precision on average by combining multiple verification methods and using the latest AI models trained on fact-checking tasks.</div>
              </details>
              <details className="rounded-xl border border-white/10 bg-white/5 p-4 group">
                <summary className="cursor-pointer text-white/90 font-medium">What content formats are supported?</summary>
                <div className="text-white/70 text-sm mt-2">We support plain text, markdown, and rich text content. Simply paste your content and we'll extract all factual claims for verification.</div>
              </details>
              <details className="rounded-xl border border-white/10 bg-white/5 p-4 group">
                <summary className="cursor-pointer text-white/90 font-medium">Is my content kept private?</summary>
                <div className="text-white/70 text-sm mt-2">Yes, all content processing is private and secure. We don't store your content or use it for training models.</div>
              </details>
              <details className="rounded-xl border border-white/10 bg-white/5 p-4 group">
                <summary className="cursor-pointer text-white/90 font-medium">Can I export the verified content?</summary>
                <div className="text-white/70 text-sm mt-2">Yes, you can export your verified content in multiple formats with all corrections and source links preserved.</div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="pricing" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">Ready to start fact‑checking?</h2>
          <p className="text-white/70 mt-2">Every answer ships with proof. Upgrade plans coming soon.</p>
          <div className="mt-6">
            <CTAButton href="/hallucination-detector" event="landing_final_cta">Open the app</CTAButton>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Stay in the loop</h3>
              <p className="text-white/70 text-sm">Get updates on new features, fixes, and best practices.</p>
            </div>
            <Newsletter />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-12 text-white/60 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} FactCheck AI</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

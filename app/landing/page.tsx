import type { Metadata } from 'next';
import CTAButton from '@/components/marketing/CTAButton';
import Newsletter from '@/components/marketing/Newsletter';
import Image from 'next/image';

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
            <Image src="/opengraph-image.jpg" alt="Product preview" width={1200} height={630} className="w-full h-auto object-cover opacity-95" priority />
          </div>
        </div>
      </section>

      {/* Logos rail */}
      <section id="platform" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="text-white/50 text-sm mb-4">Trusted by</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 opacity-80">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg border border-white/10 bg-white/5" />
            ))}
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
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="h-8 w-8 rounded-md bg-white/10 mb-3" />
                <div className="font-medium mb-1">Benefit title</div>
                <div className="text-white/70 text-sm">Short explanation of the value and the outcome users get.</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Paste or import', 'We verify with proof', 'Approve fixes & export'].map((title) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-white/60 text-sm mb-2">Step</div>
                <div className="font-medium mb-1">{title}</div>
                <div className="text-white/70 text-sm">Brief description of the step and what happens behind the scenes.</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials & FAQ placeholders */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">What customers say</h3>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="text-white/80 text-sm">“Short quote highlighting impact and proof‑backed trust.”</div>
                  <div className="text-white/50 text-xs mt-2">Name, Role, Company</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Frequently asked questions</h3>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <details key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 group">
                  <summary className="cursor-pointer text-white/90 font-medium">Question title</summary>
                  <div className="text-white/70 text-sm mt-2">Concise answer with clear next steps and links.</div>
                </details>
              ))}
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

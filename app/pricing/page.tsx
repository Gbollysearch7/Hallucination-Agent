import type { Metadata } from 'next';
import CTAButton from '@/components/marketing/CTAButton';

export const metadata: Metadata = {
  title: 'FactCheck AI — Pricing',
  description: 'Simple plans to publish AI content that stands up to scrutiny.'
};

export default function Pricing() {
  const plans = [
    { name: 'Starter', price: '$0', blurb: 'Get started', features: ['Up to 5 checks/day', 'Basic sources', 'Community support'] },
    { name: 'Pro', price: '$39/mo', blurb: 'For teams', features: ['Unlimited checks', 'Advanced sources', 'Priority support'] },
    { name: 'Enterprise', price: 'Contact', blurb: 'Scale with confidence', features: ['SLA', 'Custom sources', 'SSO & audit logs'] },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight">Pricing</h1>
        <p className="text-white/70 mt-3 max-w-2xl">Choose a plan that scales with your team. Upgrade flows will be added later.</p>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {plans.map((p) => (
            <div key={p.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col">
              <div className="text-white/60 text-sm">{p.blurb}</div>
              <div className="text-2xl font-semibold mt-1">{p.name}</div>
              <div className="text-4xl font-semibold mt-4">{p.price}</div>
              <ul className="mt-4 space-y-2 text-white/80 text-sm">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <div className="mt-6">
                <CTAButton href="/hallucination-detector" event={`pricing_${p.name.toLowerCase()}_cta`}>
                  {p.price === 'Contact' ? 'Contact sales' : 'Get started'}
                </CTAButton>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


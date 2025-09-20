"use client";
import React, { useState } from 'react';
import { track } from '@vercel/analytics/react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      {sent ? (
        <div className="text-white/80">Thanks — we’ll be in touch soon.</div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            try { track('newsletter_submit', { email }); } catch {}
            setSent(true);
          }}
          className="flex gap-3 items-center"
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full bg-white/10 border border-white/10 px-4 h-11 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <button className="px-5 h-11 rounded-full bg-white text-neutral-900 font-medium hover:opacity-90">Subscribe</button>
        </form>
      )}
    </div>
  );
}


"use client";
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { track } from '@vercel/analytics/react';

function domainOf(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

type Source = { url: string; text?: string | null };

interface EvidenceRailProps {
  sources: Source[];
}

export const EvidenceRail: React.FC<EvidenceRailProps> = ({ sources }) => {
  if (!sources?.length) return null;
  const unique = Array.from(
    new Map(sources.map((s) => [s.url, { url: s.url, text: s.text ?? '' }])).values()
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 pb-2">
        {unique.map((s, i) => (
          <a
            key={`${s.url}-${i}`}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
            title={s.url}
            onClick={() => { try { track('evidence_click', { url: s.url, domain: domainOf(s.url) }); } catch {} }}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/10 text-white/80 text-xs overflow-hidden">
              <img
                src={`/hallucination-detector/api/favicon?d=${domainOf(s.url)}`}
                alt=""
                className="w-6 h-6 object-cover"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = 'none';
                }}
              />
              <span className="absolute text-[10px]" aria-hidden>
                {domainOf(s.url).slice(0, 2).toUpperCase()}
              </span>
            </span>
            <span className="text-sm whitespace-nowrap max-w-[240px] truncate">{domainOf(s.url)}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            {/* hover preview */}
            {s.text && (
              <div className="pointer-events-none absolute left-0 top-full mt-2 hidden w-[360px] rounded-xl border border-white/10 bg-neutral-900 p-3 text-white/80 shadow-lg group-hover:block">
                <div className="text-xs text-white/50 mb-1">Preview</div>
                <div className="text-sm line-clamp-4">{s.text}</div>
                <div className="mt-2 h-1 w-full rounded bg-white/10">
                  <div className="h-1 rounded bg-emerald-400" style={{ width: `${credibility(domainOf(s.url))}%` }} />
                </div>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

function credibility(domain: string) {
  // refined heuristic: favor .gov/.edu and established publications
  if (/\.(gov|mil)(\.|$)/i.test(domain)) return 95;
  if (/\.(edu)(\.|$)/i.test(domain)) return 90;
  if (/(reuters|apnews|associatedpress|bbc|nytimes|economist|nature|nasa|who|nih|npr)\./i.test(domain)) return 88;
  if (/\.(org)(\.|$)/i.test(domain)) return 75;
  if (/\.(com|net)(\.|$)/i.test(domain)) return 65;
  return 60;
}

export default EvidenceRail;

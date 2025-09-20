import React from 'react';

type ClaimItem = {
  claim: string;
  assessment: 'True' | 'False' | 'Insufficient Information';
  summary: string;
  original_text: string;
  fixed_original_text: string;
  confidence_score: number;
};

interface PreviewPanelProps {
  content: string;
  claims: ClaimItem[];
  acceptedKeys?: Set<string>;
}

// Attempt to highlight original or fixed texts inline within content.
// This is a simple non-overlapping highlighter based on first-occurence scanning.
export default function PreviewPanel({ content, claims, acceptedKeys }: PreviewPanelProps) {
  const segments: React.ReactNode[] = [];
  let cursor = 0;
  const text = content;

  // Build a list of searchable spans (original and/or fixed depending on acceptance)
  const spans: { text: string; kind: 'true' | 'false' | 'fixed' }[] = [];
  for (const c of claims) {
    const key = `${c.original_text}=>${c.fixed_original_text}`;
    const accepted = acceptedKeys?.has(key);
    if (accepted) {
      // Prefer highlighting fixed text when fix accepted
      spans.push({ text: c.fixed_original_text, kind: 'fixed' });
    } else {
      if (c.assessment === 'True') spans.push({ text: c.original_text, kind: 'true' });
      if (c.assessment === 'False') spans.push({ text: c.original_text, kind: 'false' });
    }
  }

  // Sort spans by first appearance to avoid nested ordering issues
  const ordered = spans
    .map((s) => ({ ...s, index: text.indexOf(s.text) }))
    .filter((s) => s.index >= 0)
    .sort((a, b) => a.index - b.index);

  for (const s of ordered) {
    if (s.index > cursor) {
      pushPlain(text.slice(cursor, s.index));
    }
    pushMark(s.text, s.kind);
    cursor = s.index + s.text.length;
  }

  if (cursor < text.length) {
    pushPlain(text.slice(cursor));
  }

  function pushPlain(t: string) {
    const parts = t.split('\n');
    parts.forEach((line, i) => {
      segments.push(line);
      if (i < parts.length - 1) segments.push(<br key={`br-${segments.length}`} />);
    });
  }

  function pushMark(t: string, kind: 'true' | 'false' | 'fixed') {
    const cls =
      kind === 'true'
        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
        : kind === 'fixed'
        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
        : 'bg-rose-100 text-rose-900 border-rose-300';
    segments.push(
      <mark
        key={`mk-${segments.length}`}
        className={`inline rounded-md border px-1 py-0.5 ${cls}`}
      >
        {t}
      </mark>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
      <div className="prose prose-neutral max-w-none">
        {segments}
      </div>
    </div>
  );
}


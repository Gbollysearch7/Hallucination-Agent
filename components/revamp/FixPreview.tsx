import React from 'react';

interface FixPreviewProps {
  original: string;
  fixed: string;
  mode?: 'inline' | 'split';
}

// Very lightweight word-diff: marks words that don't appear on the other side.
function diffWords(a: string, b: string) {
  const aw = a.split(/(\s+)/); // keep spaces
  const bw = b.split(/(\s+)/);
  const aset = new Set(a.split(/\s+/));
  const bset = new Set(b.split(/\s+/));
  const aNodes = aw.map((w, i) =>
    /\s+/.test(w) ? (
      <span key={`a-sp-${i}`}>{w}</span>
    ) : aset.has(w) && !bset.has(w) ? (
      <mark key={`a-${i}`} className="bg-rose-100 text-rose-900 rounded-sm px-0.5">{w}</mark>
    ) : (
      <span key={`a-${i}`}>{w}</span>
    )
  );
  const bNodes = bw.map((w, i) =>
    /\s+/.test(w) ? (
      <span key={`b-sp-${i}`}>{w}</span>
    ) : bset.has(w) && !aset.has(w) ? (
      <mark key={`b-${i}`} className="bg-emerald-100 text-emerald-900 rounded-sm px-0.5">{w}</mark>
    ) : (
      <span key={`b-${i}`}>{w}</span>
    )
  );
  return { aNodes, bNodes };
}

export default function FixPreview({ original, fixed, mode = 'inline' }: FixPreviewProps) {
  const { aNodes, bNodes } = diffWords(original, fixed);

  if (mode === 'split') {
    return (
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60 mb-1">Original</div>
          <p className="text-sm text-white/80 leading-relaxed">{aNodes}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60 mb-1">Suggested fix</div>
          <p className="text-sm text-white/90 leading-relaxed">{bNodes}</p>
        </div>
      </div>
    );
  }

  // inline mode: show original strike + new value under
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="text-xs text-white/60 mb-1">Original</div>
        <p className="text-sm text-white/70 line-through">{original}</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="text-xs text-white/60 mb-1">Suggested fix</div>
        <p className="text-sm text-white/90">{fixed}</p>
      </div>
    </div>
  );
}


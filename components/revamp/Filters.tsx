import React from 'react';

interface FiltersProps {
  status: 'all' | 'true' | 'false' | 'insufficient';
  onStatus: (s: 'all' | 'true' | 'false' | 'insufficient') => void;
  desc: boolean;
  onToggleSort: () => void;
  onAcceptAll?: () => void;
}

export default function Filters({ status, onStatus, desc, onToggleSort, onAcceptAll }: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <button
        className={`px-3 py-1.5 rounded-full border ${status==='all'?'border-white/40 text-white':'border-white/10 text-white/70 hover:text-white'}`}
        onClick={() => onStatus('all')}
      >All</button>
      <button
        className={`px-3 py-1.5 rounded-full border ${status==='true'?'border-emerald-400 text-emerald-300':'border-white/10 text-white/70 hover:text-white'}`}
        onClick={() => onStatus('true')}
      >Supported</button>
      <button
        className={`px-3 py-1.5 rounded-full border ${status==='false'?'border-rose-400 text-rose-300':'border-white/10 text-white/70 hover:text-white'}`}
        onClick={() => onStatus('false')}
      >Refuted</button>
      <button
        className={`px-3 py-1.5 rounded-full border ${status==='insufficient'?'border-amber-400 text-amber-300':'border-white/10 text-white/70 hover:text-white'}`}
        onClick={() => onStatus('insufficient')}
      >Insufficient</button>
      <span className="mx-2 text-white/40">•</span>
      <button
        className="px-3 py-1.5 rounded-full border border-white/10 text-white/70 hover:text-white"
        onClick={onToggleSort}
      >Sort: {desc ? 'Confidence ↓' : 'Confidence ↑'}</button>
      {onAcceptAll && (
        <>
          <span className="mx-2 text-white/40">•</span>
          <button
            className="px-3 py-1.5 rounded-full border border-emerald-400 text-emerald-300 hover:bg-emerald-500/10"
            onClick={onAcceptAll}
          >Accept all fixes</button>
        </>
      )}
    </div>
  );
}


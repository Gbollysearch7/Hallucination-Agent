import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Link2 } from 'lucide-react';

type Item = {
  claim: string;
  assessment: 'True' | 'False' | 'Insufficient Information';
  summary: string;
  fixed_original_text: string;
  confidence_score: number;
  original_text: string;
  url_sources?: string[];
};

interface ClaimRowProps {
  item: Item;
}

export const ClaimRow: React.FC<ClaimRowProps> = ({ item }) => {
  const [open, setOpen] = useState(false);
  const isTrue = item.assessment === 'True';
  const isFalse = item.assessment === 'False';
  const tone = isTrue ? 'text-emerald-300' : isFalse ? 'text-rose-300' : 'text-slate-300';
  const icon = isTrue ? (
    <CheckCircle2 className="w-5 h-5" />
  ) : isFalse ? (
    <XCircle className="w-5 h-5" />
  ) : (
    <AlertCircle className="w-5 h-5" />
  );

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/90">
      <div className="flex items-start gap-3">
        <div className={`shrink-0 ${tone}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-white/60">{item.assessment} • {item.confidence_score}%</div>
              <div className="font-medium leading-relaxed truncate">{item.claim}</div>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              className="px-3 py-1.5 rounded-md border border-white/10 bg-white/5 text-sm hover:bg-white/10"
            >
              {open ? (
                <span className="inline-flex items-center gap-1"><ChevronUp className="w-4 h-4" /> Hide</span>
              ) : (
                <span className="inline-flex items-center gap-1"><ChevronDown className="w-4 h-4" /> Details</span>
              )}
            </button>
          </div>
          {open && (
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-xs text-white/60 mb-1">Why</div>
                <p className="text-sm text-white/90 leading-relaxed">{item.summary}</p>
              </div>
              {isFalse && item.fixed_original_text && (
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60 mb-1">Original</div>
                    <p className="text-sm text-white/80">{item.original_text}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60 mb-1">Suggested fix</div>
                    <p className="text-sm text-white/90">{item.fixed_original_text}</p>
                  </div>
                </div>
              )}
              {item.url_sources && item.url_sources.length > 0 && (
                <div>
                  <div className="text-xs text-white/60 mb-2">Sources</div>
                  <div className="flex flex-wrap gap-2">
                    {item.url_sources.map((u, i) => (
                      <a
                        key={`${u}-${i}`}
                        href={u}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/10"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{u}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimRow;


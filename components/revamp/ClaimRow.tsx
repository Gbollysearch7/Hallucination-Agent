import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Link2 } from 'lucide-react';
import FixPreview from './FixPreview';

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
  accepted?: boolean;
  onAcceptFix?: (item: Item) => void;
  selected?: boolean;
  controlledOpen?: boolean;
  onToggleOpen?: () => void;
  rowRef?: React.Ref<HTMLDivElement>;
}

export const ClaimRow: React.FC<ClaimRowProps> = ({ item, accepted, onAcceptFix, selected, controlledOpen, onToggleOpen, rowRef }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const [mode, setMode] = useState<'inline' | 'split'>('inline');
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

  useEffect(() => {
    if (selected && item.assessment === 'False' && controlledOpen === undefined) setInternalOpen(true);
  }, [selected, item.assessment, controlledOpen]);

  return (
    <div ref={rowRef} className={`rounded-xl border ${selected ? 'border-white/30' : 'border-white/10'} bg-white/5 p-4 text-white/90`} role="listitem" aria-selected={selected}>
      <div className="flex items-start gap-3">
        <div className={`shrink-0 ${tone}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-white/60">{item.assessment} • {item.confidence_score}%</div>
              <div className="font-medium leading-relaxed truncate">{item.claim}</div>
            </div>
            <button
              onClick={() => { if (onToggleOpen) onToggleOpen(); else setInternalOpen((v) => !v); }}
              aria-expanded={open}
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span>View:</span>
                    <button
                      className={`px-2 py-1 rounded border ${mode==='inline'?'border-white/40 text-white':'border-white/10 text-white/70 hover:text-white'}`}
                      onClick={() => setMode('inline')}
                    >Inline</button>
                    <button
                      className={`px-2 py-1 rounded border ${mode==='split'?'border-white/40 text-white':'border-white/10 text-white/70 hover:text-white'}`}
                      onClick={() => setMode('split')}
                    >Split</button>
                  </div>
                  <FixPreview original={item.original_text} fixed={item.fixed_original_text} mode={mode} />
                </div>
              )}
              {isFalse && onAcceptFix && (
                <div>
                  <button
                    onClick={() => onAcceptFix(item)}
                    disabled={accepted}
                    className={`mt-2 px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      accepted
                        ? 'border-white/10 bg-white/5 text-white/50 cursor-not-allowed'
                        : 'border-emerald-400 text-emerald-300 hover:bg-emerald-500/10'
                    }`}
                  >
                    {accepted ? 'Accepted' : 'Accept fix'}
                  </button>
                </div>
              )}
              <div>
                <div className="text-xs text-white/60 mb-2">Sources</div>
                {item.url_sources && item.url_sources.length > 0 ? (
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
                ) : (
                  <div className="text-xs text-white/50">No sources were found for this claim.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimRow;

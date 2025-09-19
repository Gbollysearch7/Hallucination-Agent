import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';

type Item = {
  assessment: 'True' | 'False' | 'Insufficient Information';
  confidence_score: number;
};

interface VerdictBannerProps {
  results: Item[];
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({ results }) => {
  const supported = results.filter((r) => r.assessment === 'True').length;
  const refuted = results.filter((r) => r.assessment === 'False').length;
  const insufficient = results.filter((r) => r.assessment === 'Insufficient Information').length;
  const confidence = avg(results.map((r) => r.confidence_score || 0));

  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (refuted > 0) tone = 'warn';
  else if (supported > 0) tone = 'good';

  const icon = tone === 'good' ? (
    <ShieldCheck className="w-5 h-5" />
  ) : tone === 'warn' ? (
    <AlertTriangle className="w-5 h-5" />
  ) : (
    <HelpCircle className="w-5 h-5" />
  );

  const headline = tone === 'good'
    ? 'Looks supported'
    : tone === 'warn'
    ? 'Needs attention'
    : 'Inconclusive';

  const bg = tone === 'good'
    ? 'from-emerald-400/15 to-emerald-300/10 text-emerald-200'
    : tone === 'warn'
    ? 'from-amber-400/15 to-amber-300/10 text-amber-200'
    : 'from-slate-500/15 to-slate-400/10 text-slate-200';

  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${bg} p-5 md:p-6`}> 
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
            {icon}
          </div>
          <div>
            <div className="text-white/90 text-lg font-medium">{headline}</div>
            <div className="text-white/60 text-sm">{supported} supported • {refuted} refuted • {insufficient} insufficient</div>
          </div>
        </div>
        <div className="text-white/80 text-sm">
          Confidence <span className="text-white font-semibold">{confidence}%</span>
        </div>
      </div>
      <div className="mt-4">
        <span className="inline-flex items-center gap-2 text-xs text-white/70 bg-white/10 border border-white/10 rounded-full px-3 py-1">
          Proof attached
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </span>
      </div>
    </div>
  );
};

export default VerdictBanner;


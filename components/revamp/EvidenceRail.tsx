import React from 'react';
import { ExternalLink } from 'lucide-react';

function domainOf(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

interface EvidenceRailProps {
  urls: string[];
}

export const EvidenceRail: React.FC<EvidenceRailProps> = ({ urls }) => {
  if (!urls?.length) return null;
  const unique = Array.from(new Set(urls));

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 pb-2">
        {unique.map((u, i) => (
          <a
            key={`${u}-${i}`}
            href={u}
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
            title={u}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/10 text-white/80 text-xs">
              {domainOf(u).slice(0, 2).toUpperCase()}
            </span>
            <span className="text-sm whitespace-nowrap max-w-[240px] truncate">{domainOf(u)}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default EvidenceRail;


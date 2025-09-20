import React from 'react';

export const SkeletonBase = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`} />
);

export const VerdictBannerSkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <SkeletonBase className="w-10 h-10 rounded-full" />
        <div>
          <SkeletonBase className="h-4 w-44 mb-2" />
          <SkeletonBase className="h-3 w-60" />
        </div>
      </div>
      <SkeletonBase className="h-4 w-24" />
    </div>
  </div>
);

export const EvidenceRailSkeleton = () => (
  <div className="overflow-x-auto">
    <div className="flex gap-3 pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
          <SkeletonBase className="w-6 h-6 rounded-md" />
          <SkeletonBase className="h-3 w-24" />
        </div>
      ))}
    </div>
  </div>
);

export const ClaimRowSkeleton = () => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
    <div className="flex items-start gap-3">
      <SkeletonBase className="w-5 h-5 rounded" />
      <div className="flex-1 min-w-0">
        <SkeletonBase className="h-3 w-24 mb-2" />
        <SkeletonBase className="h-4 w-3/4" />
      </div>
      <SkeletonBase className="h-7 w-20 rounded-md" />
    </div>
  </div>
);

export const PreviewPanelSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-4 rounded" style={{ width: `${60 + (i % 4) * 8}%` }} />
      ))}
    </div>
  </div>
);

export default function Skeletons() { return null; }


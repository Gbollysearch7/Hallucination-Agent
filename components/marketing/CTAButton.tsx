"use client";

import React from 'react';
import { track } from '@vercel/analytics/react';

interface CTAButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  event: string;
  payload?: Record<string, any>;
  variant?: 'primary' | 'ghost';
}

export default function CTAButton({ event, payload, variant = 'primary', className = '', children, ...props }: CTAButtonProps) {
  const styles =
    variant === 'primary'
      ? 'px-5 py-3 rounded-full bg-white text-neutral-900 font-medium hover:opacity-90 active:scale-[0.99] transition'
      : 'px-5 py-3 rounded-full border border-white/20 text-white/90 hover:bg-white/10 active:scale-[0.99] transition';

  return (
    <a
      {...props}
      className={`${styles} ${className}`}
      onClick={(e) => {
        props.onClick?.(e);
        try { track(event, payload); } catch {}
      }}
    >
      {children}
    </a>
  );
}


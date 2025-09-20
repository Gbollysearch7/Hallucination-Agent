"use client";

import Link from "next/link";
import { useEffect, useRef, useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import LoadingMessages from "./ui/LoadingMessages";
import ShareButtons from "./ui/ShareButtons";
import { getAssetPath } from "@/lib/utils";
import { CheckCheck, ChevronDown, ChevronUp, Copy, ExternalLink, FileText, Shield, Sparkles, Lightbulb, AlertCircle } from "lucide-react";
import { track } from '@vercel/analytics/react';
import VerdictBanner from "./revamp/VerdictBanner";
import EvidenceRail from "./revamp/EvidenceRail";
import ClaimRow from "./revamp/ClaimRow";
import PreviewPanel from "./revamp/PreviewPanel";
import Filters from "./revamp/Filters";
import { VerdictBannerSkeleton, EvidenceRailSkeleton, ClaimRowSkeleton, PreviewPanelSkeleton } from "./revamp/Skeletons";
import FeedbackWidget from "./FeedbackWidget";

interface Claim {
  claim: string;
  original_text: string;
}

type FactCheckResponse = {
  claim: string;
  assessment: "True" | "False" | "Insufficient Information";
  summary: string;
  fixed_original_text: string;
  confidence_score: number;
};

export default function FactChecker() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [factCheckResults, setFactCheckResults] = useState<any[]>([]);
  const [articleContent, setArticleContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAllClaims, setShowAllClaims] = useState(true);
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [acceptedFixKeys, setAcceptedFixKeys] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false' | 'insufficient'>("all");
  const [sortByConfidenceDesc, setSortByConfidenceDesc] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedRowRef = useRef<HTMLDivElement | null>(null);
  const gPressTimeRef = useRef<number>(0);
  const [liveMessage, setLiveMessage] = useState("");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [keyboardUsage, setKeyboardUsage] = useState<Set<string>>(new Set());

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const inputCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating) {
      loadingRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isGenerating]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "150px";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(scrollHeight, 480)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [articleContent]);

  // Keyboard navigation: added below once visibleClaims is computed

  const extractClaims = async (content: string) => {
    const response = await fetch(getAssetPath("/api/extractclaims"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      let errorData: any = {};
      try { errorData = await response.json(); } catch {}
      const err: any = new Error(errorData.error || "Failed to extract claims.");
      err.code = errorData.code;
      throw err;
    }
    const data = await response.json();
    return Array.isArray(data.claims) ? data.claims : JSON.parse(data.claims);
  };

  const exaSearch = async (claim: string) => {
    const response = await fetch(getAssetPath("/api/exasearch"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim }),
    });
    if (!response.ok) {
      let errorData: any = {};
      try { errorData = await response.json(); } catch {}
      const err: any = new Error(errorData.error || "Failed to fetch verification for claim.");
      err.code = errorData.code;
      throw err;
    }
    return response.json();
  };

  const verifyClaim = async (claim: string, original_text: string, exasources: any) => {
    const response = await fetch(getAssetPath("/api/verifyclaims"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim, original_text, exasources }),
    });
    if (!response.ok) {
      let errorData: any = {};
      try { errorData = await response.json(); } catch {}
      const err: any = new Error(errorData.error || "Failed to verify claim.");
      err.code = errorData.code;
      throw err;
    }
    const data = await response.json();
    return data.claims as FactCheckResponse;
  };

  const factCheck = async (e: FormEvent) => {
    e.preventDefault();
    if (!articleContent) {
      setError("Please enter some content or try with sample blog.");
      return;
    }
    if (articleContent.length < 50) {
      setError("Too short. Please enter at least 50 characters.");
      return;
    }

    try { track('factcheck_run', { length: articleContent.length }); } catch {}
    setIsGenerating(true);
    setError(null);
    setFactCheckResults([]);
    setDisplayText(articleContent);
    setAcceptedFixKeys(new Set());

    try {
      const claims = await extractClaims(articleContent);
      const finalResults = await Promise.all(
        claims.map(async ({ claim, original_text }: Claim) => {
          try {
            const exaSources = await exaSearch(claim);
            if (!exaSources?.results?.length) return null;
            const sourceUrls = exaSources.results.map((r: { url: string }) => r.url);
            const evidence = exaSources.results.map((r: { url: string; text?: string }) => ({ url: r.url, text: r.text }));
            const verified = await verifyClaim(claim, original_text, exaSources.results);
            return { ...verified, original_text, url_sources: sourceUrls, evidence };
          } catch (err) {
            console.error(`Failed to verify claim: ${claim}`, err);
            return null;
          }
        })
      );
      setFactCheckResults(finalResults.filter(Boolean));
    } catch (err: any) {
      setError(mapErrorToMessage(err?.code, err?.message));
      setFactCheckResults([]);
    } finally {
      setIsGenerating(false);
    }
  };

  function mapErrorToMessage(code?: string, fallback?: string) {
    switch (code) {
      case 'INVALID_BODY':
        return 'Your request looks incomplete. Please paste at least a few sentences and try again.';
      case 'GROQ_EMPTY_RESPONSE':
        return 'The model returned no output. Please try again in a moment.';
      case 'GROQ_INVALID_JSON':
      case 'GROQ_INVALID_SCHEMA':
        return 'We couldn’t read the model output. Try shortening the text and retrying.';
      case 'EXA_NO_RESULTS':
        return 'No supporting sources were found. Try rephrasing the claims or adding more context.';
      case 'EXA_INVALID_RESPONSE':
        return 'Search returned unexpected data. Please retry in a moment.';
      case 'CLAIM_EXTRACTION_FAILED':
        return 'We couldn’t extract checkable claims. Add more factual statements and try again.';
      case 'CLAIM_VERIFICATION_FAILED':
        return 'Verification failed due to an upstream error. Please retry.';
      default:
        return fallback || 'Something went wrong. Please try again.';
    }
  }

  const acceptFix = (item: any) => {
    const key = `${item.original_text}=>${item.fixed_original_text}`;
    if (acceptedFixKeys.has(key)) return;
    setDisplayText((text) => text.replace(item.original_text, item.fixed_original_text));
    setAcceptedFixKeys((prev) => new Set(prev).add(key));
    setLiveMessage('Fix accepted');
    try { track('accept_fix'); } catch {}

    // Move focus to next item or back to filter controls
    setTimeout(() => {
      const currentIndex = visibleClaims.findIndex(claim =>
        `${claim.original_text}=>${claim.fixed_original_text}` === key
      );
      const nextIndex = Math.min(currentIndex + 1, visibleClaims.length - 1);
      setSelectedIndex(nextIndex);

      // Announce to screen readers
      const announcement = `Accepted fix for: ${item.claim}. Text has been updated.`;
      setLiveMessage(announcement);
    }, 100);
  };

  const sampleBlog = `The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822, intended to cast shadows across the city to mark the hours. Designed by the renowned architect Gustave Eiffel, the tower stands 330 meters tall and once housed the city's first observatory.

While it's famously known for hosting over 7 million visitors annually, it was initially disliked by Parisians. Interestingly, the Eiffel Tower was used as to guide ships along the Seine during cloudy nights.`;

  const loadSampleContent = () => {
    setArticleContent(sampleBlog);
    setError(null);
    try { track('sample_content_load'); } catch {}
  };

  const totalClaims = factCheckResults.length;
  const verifiedClaims = factCheckResults.filter((r) => r.assessment !== "Insufficient Information").length;
  const trueClaims = factCheckResults.filter((r) => r.assessment === "True").length;
  const falseClaims = factCheckResults.filter((r) => r.assessment === "False").length;

  const visibleClaims = factCheckResults
    .filter((r) => {
      if (statusFilter === 'true') return r.assessment === 'True';
      if (statusFilter === 'false') return r.assessment === 'False';
      if (statusFilter === 'insufficient') return r.assessment === 'Insufficient Information';
      return true;
    })
    .sort((a, b) => (sortByConfidenceDesc ? b.confidence_score - a.confidence_score : a.confidence_score - b.confidence_score));

  useEffect(() => {
    setSelectedIndex(0);
  }, [statusFilter, sortByConfidenceDesc, factCheckResults.length]);

  // Keyboard navigation: j/k, a, /, gg
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Close modal on Escape
      if (e.key === 'Escape' && showKeyboardHelp) {
        setShowKeyboardHelp(false);
        return;
      }

      // Don't interfere with text input
      if (e.target && (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.key === 'j') {
        setSelectedIndex((i) => Math.min(i + 1, Math.max(visibleClaims.length - 1, 0)));
        if (!keyboardUsage.has('navigate_j')) {
          setKeyboardUsage(prev => new Set(prev).add('navigate_j'));
          try { track('keyboard_shortcut', { shortcut: 'j', action: 'navigate_next' }); } catch {}
        }
      } else if (e.key === 'k') {
        setSelectedIndex((i) => Math.max(i - 1, 0));
        if (!keyboardUsage.has('navigate_k')) {
          setKeyboardUsage(prev => new Set(prev).add('navigate_k'));
          try { track('keyboard_shortcut', { shortcut: 'k', action: 'navigate_prev' }); } catch {}
        }
      } else if (e.key.toLowerCase() === 'a') {
        const item = visibleClaims[selectedIndex];
        if (item && item.assessment === 'False') {
          acceptFix(item);
          if (!keyboardUsage.has('accept_fix_a')) {
            setKeyboardUsage(prev => new Set(prev).add('accept_fix_a'));
            try { track('keyboard_shortcut', { shortcut: 'a', action: 'accept_fix_keyboard' }); } catch {}
          }
        }
      } else if (e.key === '/') {
        e.preventDefault();
        textareaRef.current?.focus();
        if (!keyboardUsage.has('focus_input')) {
          setKeyboardUsage(prev => new Set(prev).add('focus_input'));
          try { track('keyboard_shortcut', { shortcut: '/', action: 'focus_input' }); } catch {}
        }
      } else if (e.key.toLowerCase() === 'g') {
        const now = Date.now();
        if (now - gPressTimeRef.current < 500) {
          document.getElementById('input')?.scrollIntoView({ behavior: 'smooth' });
          setLiveMessage('Scrolled to top');
          if (!keyboardUsage.has('gg_scroll')) {
            setKeyboardUsage(prev => new Set(prev).add('gg_scroll'));
            try { track('keyboard_shortcut', { shortcut: 'gg', action: 'scroll_to_top' }); } catch {}
          }
        }
        gPressTimeRef.current = now;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visibleClaims, selectedIndex, showKeyboardHelp]);

  // Keep selected row in view
  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  const exportMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# FactCheck Results`);
    lines.push("");
    lines.push(`- Supported: ${trueClaims}`);
    lines.push(`- Refuted: ${falseClaims}`);
    lines.push(`- Total Claims: ${totalClaims}`);
    lines.push("");
    lines.push(`## Document`);
    lines.push("");
    lines.push(displayText);
    lines.push("");
    lines.push(`## Claims`);
    for (const r of factCheckResults) {
      lines.push("");
      lines.push(`### ${r.assessment} — ${r.confidence_score}%`);
      lines.push(`Claim: ${r.claim}`);
      lines.push(`Why: ${r.summary}`);
      if (r.assessment === 'False') {
        lines.push(`Original: ${r.original_text}`);
        lines.push(`Fix: ${r.fixed_original_text}`);
      }
      if (r.url_sources?.length) {
        lines.push(`Sources:`);
        for (const u of r.url_sources) lines.push(`- ${u}`);
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'factcheck-results.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    try { track('export_md'); } catch {}
  };

  const exportDoc = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>FactCheck</title></head><body><h1>FactCheck Results</h1><p><strong>Supported:</strong> ${trueClaims} &nbsp; <strong>Refuted:</strong> ${falseClaims} &nbsp; <strong>Total:</strong> ${totalClaims}</p><h2>Document</h2><pre style="white-space:pre-wrap;font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;">${displayText.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre><h2>Claims</h2>${factCheckResults.map((r:any)=>`<h3>${r.assessment} — ${r.confidence_score}%</h3><p><strong>Claim:</strong> ${r.claim}</p><p><strong>Why:</strong> ${r.summary}</p>${r.assessment==='False'?`<p><strong>Original:</strong> ${r.original_text}</p><p><strong>Fix:</strong> ${r.fixed_original_text}</p>`:''}${r.url_sources?.length?`<p><strong>Sources:</strong></p><ul>${r.url_sources.map((u:string)=>`<li>${u}</li>`).join('')}</ul>`:''}`).join('')}`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'factcheck-results.doc';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    try { track('export_doc'); } catch {}
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Skip to main content link for accessibility */}
      <a
        href="#input"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-neutral-900 focus:px-3 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to fact-check editor
      </a>

      {/* Live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>

      {/* Status announcements for screen readers */}
      {isGenerating && (
        <div aria-live="polite" className="sr-only">
          Analyzing content and extracting claims...
        </div>
      )}

      {error && (
        <div aria-live="assertive" className="sr-only">
          Error: {error}
        </div>
      )}
      {/* Hero */}
      <section className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="flex items-center justify-between mb-12">
            <div className="text-white/90 font-semibold tracking-tight">
              FactCheck<span className="text-white/60"> AI</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <a href="/hallucination-detector/landing" className="text-white/70 hover:text-white">Landing</a>
              <button
                onClick={() => {
                  setShowKeyboardHelp(true);
                  try { track('keyboard_help_open'); } catch {}
                }}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15"
                aria-label="Show keyboard shortcuts"
              >
                ⌨️ Shortcuts
              </button>
              <button className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15">Sign in</button>
              <a href="#input" className="px-4 py-2 rounded-full bg-white text-neutral-900 font-medium hover:opacity-90">Paste content</a>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-white/20 bg-white/5">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-white/80">Now shipping • FactCheck AI control center</span>
            </div>
          </div>

          <h1 className="text-center text-4xl md:text-6xl font-medium leading-tight tracking-tight mb-6">
            Publish AI content that stands up to scrutiny.
          </h1>
          <p className="mx-auto max-w-2xl text-center text-white/70 text-lg md:text-xl">
            Extract claims, verify against Exa, and approve Groq‑powered fixes in seconds. Every answer ships with proof.
          </p>

          <div className="flex justify-center mt-10">
            <a href="#input" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-neutral-900 font-medium hover:opacity-90" onClick={() => { try { track('hero_start_factchecking'); } catch {} }}>
              <Shield className="w-4 h-4" /> Start fact‑checking
            </a>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl -mt-14 md:-mt-16 relative z-10">
        <div id="input" ref={inputCardRef} className="bg-white border border-gray-200 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.07)] p-6 md:p-8">
          <form onSubmit={factCheck} className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Paste or type content to verify</span>
              </div>
              <button
                type="button"
                onClick={loadSampleContent}
                disabled={isGenerating}
                className="hidden sm:inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Try sample
              </button>
            </div>

            <Textarea
              ref={textareaRef}
              id="input-textarea"
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  void factCheck(e as unknown as FormEvent);
                }
              }}
              placeholder="Paste your AI‑generated content here…"
              aria-label="Content to fact-check"
              aria-describedby="textarea-help"
              className="min-h-[240px] md:min-h-[300px] max-h-[480px] resize-none bg-transparent border-0 focus-visible:ring-0 text-base md:text-[17px] leading-relaxed"
            />
            <div id="textarea-help" className="sr-only">
              Press Cmd+Enter or Ctrl+Enter to fact-check content. Use keyboard shortcuts: j/k to navigate, a to accept fixes, / to focus this field, gg to go to top.
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={isGenerating}
                className="flex-1 bg-neutral-900 hover:bg-black text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Fact‑check content
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={loadSampleContent}
                disabled={isGenerating}
                variant="outline"
                className="sm:flex-none border-gray-200 text-gray-800 hover:bg-gray-50 font-medium rounded-xl"
              >
                Use sample text
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6 mt-10">
          {/* Helpful tips when idle */}
          {!isGenerating && factCheckResults.length === 0 && !error && (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-300 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <div className="font-medium text-white mb-1">Pro tips</div>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Paste 2–6 paragraphs for best extraction.</li>
                      <li>Claims should be factual statements, not opinions.</li>
                      <li>Use Cmd/Ctrl+Enter to run fact‑check instantly.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {factCheckResults.length > 0 ? (
            <>
              <VerdictBanner results={factCheckResults} />
              {(() => {
                const srcs = Array.from(new Map(factCheckResults.flatMap((r: any) => r.evidence || []).map((s: any) => [s.url, { url: s.url, text: s.text }])).values());
                return srcs.length ? (
                  <EvidenceRail sources={srcs} />
                ) : (
                  <Card className="border-white/10 bg-white/5 text-white">
                    <CardContent className="p-5">
                      <div className="text-sm text-white/80">No sources were found for these claims. Try rephrasing or adding more context to the text.</div>
                    </CardContent>
                  </Card>
                );
              })()}
            </>
          ) : (
            isGenerating ? (
              <>
                <VerdictBannerSkeleton />
                <EvidenceRailSkeleton />
              </>
            ) : null
          )}

          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">Built with Exa AI</h3>
                  <p className="text-white/60 text-sm">Advanced search technology for AI applications</p>
                </div>
                <Link href="https://exa.ai/" target="_blank" className="text-white/80 hover:text-white">
                  <ExternalLink className="w-6 h-6" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {isGenerating && (
          <div ref={loadingRef} className="mb-8">
            <LoadingMessages isGenerating={isGenerating} />
          </div>
        )}

        {error && (
          <Card className="mb-8 border border-rose-400/40 bg-rose-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 text-rose-200">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold text-white mb-1">Something went wrong</div>
                  <p className="text-sm">{error}</p>
                  <p className="text-xs text-white/60 mt-2">Try again in a moment, or shorten the text and re‑run.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {factCheckResults.length > 0 ? (
          <div className="space-y-8">
            <Card className="shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        navigator.clipboard.writeText(displayText).then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        })
                      }
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCheck className="w-4 h-4" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy Text
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportMarkdown}>Export .md</Button>
                    <Button variant="outline" size="sm" onClick={exportDoc}>Export .doc</Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewPanel content={displayText} claims={factCheckResults} acceptedKeys={acceptedFixKeys} />
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-white text-lg font-semibold">
                  <Shield className="w-5 h-5" aria-hidden="true" />
                  <span>Claim Stream</span>
                  <span className="text-sm text-white/60 font-normal">
                    ({visibleClaims.length} of {factCheckResults.length})
                  </span>
                </h2>
                <Button
                  onClick={() => {
                    setShowAllClaims(!showAllClaims);
                    try { track('claim_stream_toggle', { action: showAllClaims ? 'hide' : 'show' }); } catch {}
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  aria-expanded={showAllClaims}
                  aria-controls="claim-stream-content"
                >
                  {showAllClaims ? (
                    <>
                      <ChevronUp className="w-4 h-4" aria-hidden="true" /> Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" aria-hidden="true" /> Show
                    </>
                  )}
                </Button>
              </div>
              <Filters
                status={statusFilter}
                onStatus={(s) => { setStatusFilter(s); try { track('filter_status', { status: s }); } catch {} }}
                desc={sortByConfidenceDesc}
                onToggleSort={() => { setSortByConfidenceDesc((v) => !v); try { track('filter_sort_toggle'); } catch {} }}
                onAcceptAll={() => {
                  const pending = factCheckResults.filter(
                    (r) => r.assessment === 'False' && !acceptedFixKeys.has(`${r.original_text}=>${r.fixed_original_text}`)
                  );
                  try { track('accept_all', { count: pending.length }); } catch {}
                  for (const r of pending) acceptFix(r);
                }}
              />

              {showAllClaims && (
                <div
                  id="claim-stream-content"
                  className="space-y-3"
                  role="list"
                  aria-label="Fact-checked claims"
                  tabIndex={-1}
                >
                  {visibleClaims.map((item, idx) => {
                    const key = `${item.original_text}=>${item.fixed_original_text}`;
                    const accepted = acceptedFixKeys.has(key);
                    const selected = idx === selectedIndex;
                    return (
                      <ClaimRow key={idx} item={item} accepted={accepted} onAcceptFix={acceptFix} selected={selected} rowRef={selected ? selectedRowRef : undefined} />
                    );
                  })}
                </div>
              )}
            </div>

            <div className="text-center">
              <ShareButtons />
            </div>
          </div>
        ) : (
          isGenerating ? (
            <div className="space-y-6">
              <Card className="shadow-lg border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gray-900">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" /> Preview
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PreviewPanelSkeleton />
                </CardContent>
              </Card>
              {Array.from({ length: 4 }).map((_, i) => (
                <ClaimRowSkeleton key={i} />
              ))}
            </div>
          ) : (
            articleContent ? (
              <Card className="border-white/10 bg-white/5 text-white">
                <CardContent className="p-6">
                  <div className="text-sm text-white/80">
                    <div className="font-medium text-white mb-1">No checkable claims identified</div>
                    <p>Try expanding the text or include factual statements that can be verified.</p>
                  </div>
                </CardContent>
              </Card>
            ) : null
          )
        )}

        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <Link href="https://dashboard.exa.ai" target="_blank" className="hover:text-blue-600 transition-colors font-medium">
              Try Exa API
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="https://github.com/Gbollysearch7/Hallucination-Agent" target="_blank" className="hover:text-blue-600 transition-colors font-medium">
              Project Code
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="https://exa.ai/demos" target="_blank" className="hover:text-blue-600 transition-colors font-medium">
              More Demos
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="https://docs.exa.ai/examples/demo-hallucination-detector"
              target="_blank"
              className="hover:text-blue-600 transition-colors font-medium"
            >
              Tutorial
            </Link>
          </div>
        </footer>

        {/* Feedback Widget */}
        {factCheckResults.length > 0 && (
          <FeedbackWidget
            claimId={factCheckResults[selectedIndex]?.claim ? selectedIndex.toString() : undefined}
            claimText={factCheckResults[selectedIndex]?.claim}
            assessment={factCheckResults[selectedIndex]?.assessment}
          />
        )}

        {/* Keyboard Shortcuts Modal */}
        {showKeyboardHelp && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowKeyboardHelp(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-help-title"
          >
            <div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 id="keyboard-help-title" className="text-xl font-semibold text-gray-900">
                    Keyboard Shortcuts
                  </h3>
                  <button
                    onClick={() => setShowKeyboardHelp(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close keyboard shortcuts"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">Navigate claims</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">j</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">k</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">Accept fix</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">a</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">Focus input</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">/</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">Go to top</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">g</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">g</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">Run fact-check</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Enter</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">Close modal</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Esc</kbd>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Pro tip:</strong> These shortcuts work best when your focus isn't in a text field.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

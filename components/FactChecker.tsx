"use client";

import Link from "next/link";
import { useEffect, useRef, useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import ClaimsListResults from "./ClaimsListResult";
import LoadingMessages from "./ui/LoadingMessages";
import PreviewBox from "./PreviewBox";
import ShareButtons from "./ui/ShareButtons";
import { getAssetPath } from "@/lib/utils";
import { CheckCheck, ChevronDown, ChevronUp, Copy, ExternalLink, FileText, Shield, Sparkles } from "lucide-react";
import VerdictBanner from "./revamp/VerdictBanner";
import EvidenceRail from "./revamp/EvidenceRail";
import ClaimRow from "./revamp/ClaimRow";

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

  const extractClaims = async (content: string) => {
    const response = await fetch(getAssetPath("/api/extractclaims"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to extract claims.");
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
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch verification for claim.");
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
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to verify claim.");
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

    setIsGenerating(true);
    setError(null);
    setFactCheckResults([]);

    try {
      const claims = await extractClaims(articleContent);
      const finalResults = await Promise.all(
        claims.map(async ({ claim, original_text }: Claim) => {
          try {
            const exaSources = await exaSearch(claim);
            if (!exaSources?.results?.length) return null;
            const sourceUrls = exaSources.results.map((r: { url: string }) => r.url);
            const verified = await verifyClaim(claim, original_text, exaSources.results);
            return { ...verified, original_text, url_sources: sourceUrls };
          } catch (err) {
            console.error(`Failed to verify claim: ${claim}`, err);
            return null;
          }
        })
      );
      setFactCheckResults(finalResults.filter(Boolean));
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setFactCheckResults([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const sampleBlog = `The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822, intended to cast shadows across the city to mark the hours. Designed by the renowned architect Gustave Eiffel, the tower stands 330 meters tall and once housed the city's first observatory.\n\nWhile it's famously known for hosting over 7 million visitors annually, it was initially disliked by Parisians. Interestingly, the Eiffel Tower was used as to guide ships along the Seine during cloudy nights.`;

  const loadSampleContent = () => {
    setArticleContent(sampleBlog);
    setError(null);
  };

  const totalClaims = factCheckResults.length;
  const verifiedClaims = factCheckResults.filter((r) => r.assessment !== "Insufficient Information").length;
  const trueClaims = factCheckResults.filter((r) => r.assessment === "True").length;
  const falseClaims = factCheckResults.filter((r) => r.assessment === "False").length;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero */}
      <section className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="flex items-center justify-between mb-12">
            <div className="text-white/90 font-semibold tracking-tight">
              FactCheck<span className="text-white/60"> AI</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm">
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
            <a href="#input" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-neutral-900 font-medium hover:opacity-90">
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
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  void factCheck(e as unknown as FormEvent);
                }
              }}
              placeholder="Paste your AI‑generated content here…"
              className="min-h-[240px] md:min-h-[300px] max-h-[480px] resize-none bg-transparent border-0 focus-visible:ring-0 text-base md:text-[17px] leading-relaxed"
            />

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
          {factCheckResults.length > 0 && (
            <>
              <VerdictBanner results={factCheckResults} />
              <EvidenceRail
                urls={Array.from(new Set(factCheckResults.flatMap((r: any) => r.url_sources || [])))}
              />
            </>
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
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-700">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {factCheckResults.length > 0 && (
          <div className="space-y-8">
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> Content Analysis
                  </span>
                  <Button
                    onClick={() =>
                      navigator.clipboard.writeText(articleContent).then(() => {
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
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewBox content={articleContent} claims={factCheckResults} />
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Claim Stream</span>
                </div>
                <Button
                  onClick={() => setShowAllClaims(!showAllClaims)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {showAllClaims ? (
                    <>
                      <ChevronUp className="w-4 h-4" /> Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" /> Show
                    </>
                  )}
                </Button>
              </div>
              {showAllClaims && (
                <div className="space-y-3">
                  {factCheckResults.map((item, idx) => (
                    <ClaimRow key={idx} item={item} />
                  ))}
                </div>
              )}
            </div>

            <div className="text-center">
              <ShareButtons />
            </div>
          </div>
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
      </div>
    </div>
  );
}

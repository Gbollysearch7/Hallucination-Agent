"use client";

import Link from "next/link";
import { useState, FormEvent, useRef, useEffect } from "react";
import ClaimsListResults from "./ClaimsListResult";
import LoadingMessages from "./ui/LoadingMessages";
import PreviewBox from "./PreviewBox";
import { ChevronDown, ChevronRight, ChevronUp, Sparkles, Shield, Copy, CheckCheck, FileText, ExternalLink } from "lucide-react";
import AnimatedGradientText from "./ui/animated-gradient-text";
import ShareButtons from "./ui/ShareButtons";
import { getAssetPath } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";

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
  const [articleContent, setArticleContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAllClaims, setShowAllClaims] = useState(true);
  const [copied, setCopied] = useState(false);

  // Create a ref for the loading or bottom section
  const loadingRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the loading section
  const scrollToLoading = () => {
    loadingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Watch for changes to `isGenerating` and scroll when it becomes `true`
  useEffect(() => {
    if (isGenerating) {
      scrollToLoading();
    }
  }, [isGenerating]);

  // Function to adjust textarea height
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '150px';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 300)}px`;
    }
  };

  // Adjust height when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [articleContent]);

  // Extract claims function
  const extractClaims = async (content: string) => {
    const response = await fetch(getAssetPath('/api/extractclaims'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract claims.');
    }

    const data = await response.json();
    return Array.isArray(data.claims) ? data.claims : JSON.parse(data.claims);
  };

  // ExaSearch function
  const exaSearch = async (claim: string) => {
    console.log(`Claim recieved in exa search: ${claim}`);

    const response = await fetch(getAssetPath('/api/exasearch'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch verification for claim.');
    }

    const data = await response.json();
    return data;
  };

  // Verify claims function
  const verifyClaim = async (claim: string, original_text: string, exasources: any) => {
    const response = await fetch(getAssetPath('/api/verifyclaims'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim, original_text, exasources }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to verify claim.');
    }

    const data = await response.json();
    console.log("VerifyClaim response:", data.claims);

    return data.claims as FactCheckResponse;
  };

  // Fact check function
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

            if (!exaSources?.results?.length) {
              return null;
            }

            const sourceUrls = exaSources.results.map((result: { url: any; }) => result.url);

            const verifiedClaim = await verifyClaim(claim, original_text, exaSources.results);

            return { ...verifiedClaim, original_text, url_sources: sourceUrls };
          } catch (error) {
            console.error(`Failed to verify claim: ${claim}`, error);
            return null;
          }
        })
      );

      setFactCheckResults(finalResults.filter(result => result !== null));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
      setFactCheckResults([]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Sample blog content
  const sampleBlog = `The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822, intended to cast shadows across the city to mark the hours. Designed by the renowned architect Gustave Eiffel, the tower stands 330 meters tall and once housed the city's first observatory.\n\nWhile it's famously known for hosting over 7 million visitors annually, it was initially disliked by Parisians. Interestingly, the Eiffel Tower was used as to guide ships along the Seine during cloudy nights.`;

  // Load sample content function
  const loadSampleContent = () => {
    setArticleContent(sampleBlog);
    setError(null);
  };

  // Calculate statistics
  const totalClaims = factCheckResults.length;
  const verifiedClaims = factCheckResults.filter(r => r.assessment !== 'Insufficient Information').length;
  const trueClaims = factCheckResults.filter(r => r.assessment === 'True').length;
  const falseClaims = factCheckResults.filter(r => r.assessment === 'False').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Powered by Groq AI & Exa Search
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            AI Hallucination
            <span className="text-blue-600"> Detector</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verify AI-generated content against real web sources. Detect inaccuracies and ensure factual reliability.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Enter Content to Verify
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={factCheck} className="space-y-4">
                  <Textarea
                    ref={textareaRef}
                    value={articleContent}
                    onChange={(e) => setArticleContent(e.target.value)}
                    placeholder="Paste your AI-generated content here to fact-check for potential hallucinations..."
                    className="min-h-[200px] max-h-[300px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Detect Hallucinations
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={loadSampleContent}
                      disabled={isGenerating}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Try Sample
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            {factCheckResults.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Total Claims</p>
                        <p className="text-2xl font-bold text-blue-900">{totalClaims}</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Verified</p>
                        <p className="text-2xl font-bold text-green-900">{verifiedClaims}</p>
                      </div>
                      <Shield className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-emerald-700">Accurate</p>
                        <p className="text-2xl font-bold text-emerald-900">{trueClaims}</p>
                      </div>
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700">Inaccurate</p>
                        <p className="text-2xl font-bold text-red-900">{falseClaims}</p>
                      </div>
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✗</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Brand Badge */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Built with Exa AI</h3>
                    <p className="text-blue-100 text-sm">Advanced search technology for AI applications</p>
                  </div>
                  <Link href="https://exa.ai/" target="_blank">
                    <ExternalLink className="w-6 h-6 text-white hover:text-blue-200 transition-colors" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div ref={loadingRef} className="mb-8">
            <LoadingMessages isGenerating={isGenerating} />
          </div>
        )}

        {/* Error State */}
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

        {/* Results Section */}
        {factCheckResults.length > 0 && (
          <div className="space-y-8">
            {/* Preview Box */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Content Analysis
                  </span>
                  <Button
                    onClick={() => navigator.clipboard.writeText(articleContent).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    })}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Text
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewBox
                  content={articleContent}
                  claims={factCheckResults}
                />
              </CardContent>
            </Card>

            {/* Claims List */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Detailed Analysis
                  </span>
                  <Button
                    onClick={() => setShowAllClaims(!showAllClaims)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {showAllClaims ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide Claims
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show All Claims
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showAllClaims && (
                <CardContent>
                  <ClaimsListResults results={factCheckResults} />
                </CardContent>
              )}
            </Card>

            {/* Share Section */}
            <div className="text-center">
              <ShareButtons />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <Link
              href="https://dashboard.exa.ai"
              target="_blank"
              className="hover:text-blue-600 transition-colors font-medium"
            >
              Try Exa API
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="https://github.com/Gbollysearch7/Hallucination-Agent"
              target="_blank"
              className="hover:text-blue-600 transition-colors font-medium"
            >
              Project Code
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="https://exa.ai/demos"
              target="_blank"
              className="hover:text-blue-600 transition-colors font-medium"
            >
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
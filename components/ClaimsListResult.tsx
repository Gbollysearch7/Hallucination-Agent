import React from 'react';
import { ChevronRight, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface ClaimsListResult {
  claim: string;
  assessment: string;
  summary: string;
  fixed_original_text: string;
  confidence_score: number;
  url_sources?: string[];
}

interface ClaimsListResultsProps {
  results: ClaimsListResult[];
}

const ClaimsListResults: React.FC<ClaimsListResultsProps> = ({ results }) => {
  const getStatusBadge = (assessment: string) => {
    const isTrue = assessment.toLowerCase().includes('true');
    const isFalse = assessment.toLowerCase().includes('false');
    const isInsufficient = assessment.toLowerCase().includes('insufficient');

    if (isTrue) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Supported
        </span>
      );
    } else if (isFalse) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 text-sm font-medium">
          <XCircle className="w-4 h-4" />
          Refuted
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          Insufficient Info
        </span>
      );
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {results
        .filter((result) => result.assessment.toLowerCase() !== 'insufficient information')
        .map((result, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* Claim Header */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 pr-4 leading-relaxed">
                {result.claim}
              </h3>
              {getStatusBadge(result.assessment)}
            </div>

            {/* Assessment Details */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Confidence:</span>
                <span className={`font-semibold ${getConfidenceColor(result.confidence_score)}`}>
                  {result.confidence_score}%
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis:</h4>
              <p className="text-gray-700 leading-relaxed">{result.summary}</p>
            </div>

            {/* Sources */}
            {result.url_sources && result.url_sources.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <ChevronRight size={16} />
                  Sources
                </h4>
                <div className="space-y-2">
                  {result.url_sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span className="truncate">{source}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Correction (if applicable) */}
            {result.assessment.toLowerCase() === 'false' && result.fixed_original_text && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Suggested Correction:</h4>
                <p className="text-yellow-900 text-sm">{result.fixed_original_text}</p>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default ClaimsListResults;
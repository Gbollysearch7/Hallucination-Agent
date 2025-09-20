"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { MessageCircle, Send, X } from 'lucide-react';
import { track } from '@vercel/analytics/react';

interface FeedbackWidgetProps {
  claimId?: string;
  claimText?: string;
  assessment?: string;
}

export default function FeedbackWidget({ claimId, claimText, assessment }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'incorrect' | 'improvement' | 'general'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      // Track feedback submission
      await track('feedback_submit', {
        type: feedbackType,
        hasClaimId: !!claimId,
        assessment: assessment,
        feedbackLength: feedback.length,
      });

      // Here you would typically send to your feedback service
      console.log('Feedback submitted:', {
        type: feedbackType,
        claimId,
        claimText: claimText?.substring(0, 100) + '...',
        assessment,
        feedback,
        timestamp: new Date().toISOString(),
      });

      setIsSubmitted(true);
      setFeedback('');

      // Reset after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => {
          setIsOpen(true);
          try { track('feedback_widget_open'); } catch {}
        }}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
        aria-label="Report feedback"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Feedback
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-xl border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Share Feedback
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
              aria-label="Close feedback"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-green-700 font-medium">Thank you for your feedback!</p>
              <p className="text-sm text-gray-600 mt-1">This helps us improve FactCheck AI.</p>
            </div>
          ) : (
            <>
              {claimText && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Regarding claim:</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {claimText}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      assessment === 'True' ? 'bg-green-100 text-green-800' :
                      assessment === 'False' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assessment}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Feedback type:</label>
                <div className="flex gap-2">
                  {[
                    { value: 'incorrect', label: 'Incorrect verdict', color: 'bg-red-100 text-red-700' },
                    { value: 'improvement', label: 'Suggest improvement', color: 'bg-blue-100 text-blue-700' },
                    { value: 'general', label: 'General feedback', color: 'bg-gray-100 text-gray-700' }
                  ].map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setFeedbackType(value as any)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                        feedbackType === value
                          ? `${color} ring-2 ring-offset-2 ring-current`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="feedback-text" className="text-sm font-medium text-gray-700">
                  Your feedback:
                </label>
                <Textarea
                  id="feedback-text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    feedbackType === 'incorrect' ? "Explain why you think this verdict is incorrect..." :
                    feedbackType === 'improvement' ? "What could be improved about this analysis?" :
                    "Any suggestions or comments?"
                  }
                  className="min-h-[80px] text-sm"
                  aria-label="Feedback text"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!feedback.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
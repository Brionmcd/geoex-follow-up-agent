'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  sampleResponses,
  categoryLabels,
  categoryColors,
  SampleResponse,
} from '@/lib/sampleResponses';

interface InterpretationResult {
  summary: string;
  interpretation: string;
  sentiment: 'positive' | 'neutral' | 'concerned' | 'frustrated';
  recommended_action: {
    type: 'none' | 'wait' | 'remind' | 'clarify' | 'call' | 'escalate' | 'reply';
    description: string;
  };
  urgency: 'low' | 'medium' | 'high';
  key_details: {
    commitments: string[];
    requests: string[];
    concerns: string[];
    dates_mentioned: string[];
  };
  suggested_reply: string | null;
  reasoning: string;
}

const sentimentConfig = {
  positive: { emoji: '😊', label: 'Positive', color: 'bg-green-100 text-green-800' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'bg-gray-100 text-gray-800' },
  concerned: { emoji: '😟', label: 'Concerned', color: 'bg-amber-100 text-amber-800' },
  frustrated: { emoji: '😤', label: 'Frustrated', color: 'bg-red-100 text-red-800' },
};

const actionConfig = {
  none: { icon: '✅', label: 'No action needed' },
  wait: { icon: '⏳', label: 'Wait for submission' },
  remind: { icon: '📅', label: 'Set reminder' },
  clarify: { icon: '✉️', label: 'Send clarification' },
  call: { icon: '📞', label: 'Phone call recommended' },
  escalate: { icon: '⚠️', label: 'Escalate to manager' },
  reply: { icon: '💬', label: 'Reply needed' },
};

const urgencyConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
};

export default function InterpretPage() {
  const [responseText, setResponseText] = useState('');
  const [travelerName, setTravelerName] = useState('');
  const [requestedItems, setRequestedItems] = useState<string[]>([]);
  const [previousContacts, setPreviousContacts] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InterpretationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedReply, setCopiedReply] = useState(false);

  const documentOptions = [
    'Passport scan',
    'Medical form',
    'Signed waiver',
    'Emergency contact',
    'Dietary preferences',
  ];

  const handleItemToggle = (item: string) => {
    setRequestedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSampleSelect = (sample: SampleResponse) => {
    setResponseText(sample.text);
    setResult(null);
    setError(null);
  };

  const handleInterpret = async () => {
    if (!responseText.trim()) {
      setError('Please enter or select a response to interpret');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseText,
          travelerName: travelerName || undefined,
          requestedItems: requestedItems.length > 0 ? requestedItems : undefined,
          previousContacts: previousContacts || undefined,
          additionalContext: additionalContext || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to interpret response');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReply = async () => {
    if (result?.suggested_reply) {
      await navigator.clipboard.writeText(result.suggested_reply);
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 2000);
    }
  };

  const groupedSamples = sampleResponses.reduce(
    (acc, sample) => {
      if (!acc[sample.category]) {
        acc[sample.category] = [];
      }
      acc[sample.category].push(sample);
      return acc;
    },
    {} as Record<string, SampleResponse[]>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold text-slate-900">GeoEx</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/follow-up"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Follow-Up Agent
              </Link>
              <Link
                href="/digest"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Daily Digest
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Response Interpreter</h1>
          <p className="text-slate-600">
            Paste a traveler&apos;s email response to understand what they need
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Email Response</h2>

          {/* Text Area */}
          <textarea
            value={responseText}
            onChange={(e) => {
              setResponseText(e.target.value);
              setResult(null);
              setError(null);
            }}
            placeholder="Paste the traveler's email response here..."
            className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900 placeholder-slate-400"
          />

          {/* Context Section (Collapsible) */}
          <div className="mt-4">
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showContext ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Add context (optional)
            </button>

            {showContext && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4">
                {/* Traveler Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Traveler Name
                  </label>
                  <input
                    type="text"
                    value={travelerName}
                    onChange={(e) => setTravelerName(e.target.value)}
                    placeholder="e.g., Sarah Mitchell"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                  />
                </div>

                {/* Requested Items */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    What we asked them for
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {documentOptions.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleItemToggle(item)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          requestedItems.includes(item)
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Previous Contacts */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Previous follow-ups
                  </label>
                  <select
                    value={previousContacts}
                    onChange={(e) => setPreviousContacts(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                  >
                    <option value="">Select...</option>
                    <option value="1">1 previous contact</option>
                    <option value="2">2 previous contacts</option>
                    <option value="3+">3+ previous contacts</option>
                  </select>
                </div>

                {/* Additional Context */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Additional context
                  </label>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="Any other relevant information..."
                    className="w-full h-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Interpret Button */}
          <button
            onClick={handleInterpret}
            disabled={isLoading || !responseText.trim()}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Interpreting...
              </>
            ) : (
              'Interpret Response'
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Sample Responses Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Try Sample Responses</h2>
          <p className="text-sm text-slate-600 mb-4">
            Click any sample to load it into the text area above
          </p>

          <div className="space-y-4">
            {Object.entries(groupedSamples).map(([category, samples]) => (
              <div key={category}>
                <h3
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${categoryColors[category as SampleResponse['category']]}`}
                >
                  {categoryLabels[category as SampleResponse['category']]}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {samples.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSampleSelect(sample)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        responseText === sample.text
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Interpretation</h2>

            {/* Summary */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">What they said</h3>
              <p className="text-slate-900">{result.summary}</p>
            </div>

            {/* Interpretation */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">What this means</h3>
              <p className="text-slate-900">{result.interpretation}</p>
            </div>

            {/* Sentiment & Urgency Row */}
            <div className="flex flex-wrap gap-4">
              {/* Sentiment */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Sentiment</h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${sentimentConfig[result.sentiment].color}`}
                >
                  <span>{sentimentConfig[result.sentiment].emoji}</span>
                  {sentimentConfig[result.sentiment].label}
                </span>
              </div>

              {/* Urgency */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Urgency</h3>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${urgencyConfig[result.urgency].color}`}
                >
                  {urgencyConfig[result.urgency].label}
                </span>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500 mb-2">Recommended Action</h3>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{actionConfig[result.recommended_action.type].icon}</span>
                <div>
                  <p className="font-medium text-slate-900">
                    {actionConfig[result.recommended_action.type].label}
                  </p>
                  <p className="text-slate-600 text-sm mt-0.5">
                    {result.recommended_action.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Details */}
            {(result.key_details.commitments.length > 0 ||
              result.key_details.requests.length > 0 ||
              result.key_details.concerns.length > 0 ||
              result.key_details.dates_mentioned.length > 0) && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Key Details Extracted</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.key_details.commitments.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs font-medium text-green-700 mb-1">Commitments</p>
                      <ul className="text-sm text-green-800">
                        {result.key_details.commitments.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.key_details.requests.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-700 mb-1">Requests</p>
                      <ul className="text-sm text-blue-800">
                        {result.key_details.requests.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.key_details.concerns.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-xs font-medium text-amber-700 mb-1">Concerns</p>
                      <ul className="text-sm text-amber-800">
                        {result.key_details.concerns.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.key_details.dates_mentioned.length > 0 && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs font-medium text-purple-700 mb-1">Dates Mentioned</p>
                      <ul className="text-sm text-purple-800">
                        {result.key_details.dates_mentioned.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggested Reply */}
            {result.suggested_reply && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-500">Suggested Reply</h3>
                  <button
                    onClick={handleCopyReply}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    {copiedReply ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy Reply
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-700 whitespace-pre-wrap">{result.suggested_reply}</p>
                </div>
              </div>
            )}

            {/* Reasoning */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-medium text-slate-500 mb-1">AI Reasoning</h3>
              <p className="text-sm text-slate-600">{result.reasoning}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

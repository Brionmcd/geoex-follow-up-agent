'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sampleResponses, SampleResponse } from '@/lib/sampleResponses';
import { DataSourceIndicator } from '@/components/DataSourceIndicator';

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
  positive: { emoji: '😊', label: 'Positive', color: 'bg-green-100 text-green-800', borderColor: 'border-green-200' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-200' },
  concerned: { emoji: '😟', label: 'Concerned', color: 'bg-amber-100 text-amber-800', borderColor: 'border-amber-200' },
  frustrated: { emoji: '😤', label: 'Frustrated', color: 'bg-red-100 text-red-800', borderColor: 'border-red-200' },
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

// Loading messages that rotate (reference Sugati)
const LOADING_MESSAGES = [
  'Analyzing response...',
  'Cross-referencing with Sugati records...',
  'Checking traveler history in Salesforce...',
  'Analyzing tone and sentiment...',
  'Identifying key commitments or requests...',
  'Checking for signs of frustration or confusion...',
  'Determining if action is needed...',
  'Formulating recommendation...',
];

export default function InterpretPage() {
  const [responseText, setResponseText] = useState('');
  const [travelerName, setTravelerName] = useState('');
  const [requestedItems, setRequestedItems] = useState<string[]>([]);
  const [previousContacts, setPreviousContacts] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<InterpretationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedReply, setCopiedReply] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(true);

  // Note: In production, this would come from API response
  // For now, using sample data (isLive = false)
  const isLiveData = false;

  const documentOptions = [
    'Passport scan',
    'Medical form',
    'Signed waiver',
    'Emergency contact',
    'Dietary preferences',
  ];

  // Rotate loading messages
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleItemToggle = (item: string) => {
    setRequestedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSampleSelect = (sample: SampleResponse) => {
    setResponseText(sample.text);
    setResult(null);
    setError(null);
    setIsInputExpanded(true);
  };

  const handleInterpret = async () => {
    if (!responseText.trim()) {
      setError('Please enter or select a response to interpret');
      return;
    }

    setIsLoading(true);
    setLoadingMessageIndex(0);
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
      setIsInputExpanded(false); // Collapse input when results arrive
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

  const handleInterpretAnother = () => {
    setResponseText('');
    setTravelerName('');
    setRequestedItems([]);
    setPreviousContacts('');
    setAdditionalContext('');
    setResult(null);
    setError(null);
    setIsInputExpanded(true);
    setShowContext(false);
  };

  // Get truncated text for collapsed view
  const getTruncatedText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Get frustration signals for display
  const getFrustrationSignals = () => {
    if (result?.sentiment !== 'frustrated') return null;
    const signals = [];
    const text = responseText.toLowerCase();
    if (text.includes('third') || text.includes('again') || text.includes('already')) {
      signals.push('"Third email" or "again" — they\'re counting contacts');
    }
    if (text.includes('already told') || text.includes('already said')) {
      signals.push('"Already told you" — feeling unheard');
    }
    if (text.includes('stop') || text.includes('please stop')) {
      signals.push('"Please stop" — explicit request to change approach');
    }
    if (text.includes('frustrated') || text.includes('annoying') || text.includes('overwhelming')) {
      signals.push('Direct frustration language detected');
    }
    return signals.length > 0 ? signals : null;
  };

  const frustrationSignals = getFrustrationSignals();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">GeoEx</Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Response Interpreter</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/trips"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Trip Health
              </Link>
              <Link
                href="/follow-up"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Follow-Up
              </Link>
              <Link
                href="/digest"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Digest
              </Link>
              <Link
                href="/anomalies"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Anomalies
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1">
        {/* Data Source Indicator */}
        <div className="flex justify-end mb-4">
          <DataSourceIndicator isLive={isLiveData} />
        </div>

        {/* Title - Only show when no results */}
        {!result && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Response Interpreter</h1>
            <p className="text-slate-600">
              Paste a traveler&apos;s email response to understand what they need
            </p>
          </div>
        )}

        {/* AI Capabilities Card (Collapsible) - Only show when no results */}
        {!result && (
          <div className="border border-dashed border-gray-300 rounded-lg overflow-hidden mb-6">
            <button
              onClick={() => setShowCapabilities(!showCapabilities)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <span>🧠</span>
                What this AI does
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                {showCapabilities ? 'Hide' : 'Show'}
                <svg
                  className={`w-4 h-4 transition-transform ${showCapabilities ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {showCapabilities && (
              <div className="px-4 py-4 bg-white border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  Paste any traveler response and the AI will:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-gray-700">Understand what they&apos;re really saying (even if vague)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-gray-700">Detect frustration, confusion, or concerns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-gray-700">Identify commitments (&ldquo;I&apos;ll send it tonight&rdquo;)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-gray-700">Spot potential problems (cancellation, issues)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-gray-700">Recommend your next action</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-gray-700">Draft a reply if needed</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Input Section - Collapsed or Expanded */}
        {result && !isInputExpanded ? (
          // Collapsed Input State
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg">📧</span>
                <p className="text-slate-700 truncate">
                  &ldquo;{getTruncatedText(responseText)}&rdquo;
                </p>
              </div>
              <button
                onClick={() => setIsInputExpanded(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 ml-4"
              >
                Edit
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          // Expanded Input State
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
              className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
            >
              {isLoading ? (
                <>
                  <div className="flex items-center gap-2">
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
                    <span>Interpreting response...</span>
                  </div>
                  <span className="text-blue-200 text-sm">
                    {LOADING_MESSAGES[loadingMessageIndex]}
                  </span>
                </>
              ) : result ? (
                'Re-interpret Response'
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
        )}

        {/* Results Section - Now prominently placed right after collapsed input */}
        {result && (
          <div className="space-y-4 mb-6">
            {/* Frustration Warning (if detected) */}
            {result.sentiment === 'frustrated' && frustrationSignals && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">
                      I detected frustration in this response
                    </h3>
                    <p className="text-sm text-red-800 mb-2">Signals I noticed:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {frustrationSignals.map((signal, i) => (
                        <li key={i}>• {signal}</li>
                      ))}
                    </ul>
                    <p className="text-sm text-red-800 mt-3 font-medium">
                      This traveler needs a different approach. More emails will likely make things worse.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Interpretation Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* What they said */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📝</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-1">What they said</h3>
                    <p className="text-slate-900">&ldquo;{result.summary}&rdquo;</p>
                  </div>
                </div>
              </div>

              {/* What I'm reading between the lines */}
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔍</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-1">What I&apos;m reading between the lines</h3>
                    <p className="text-slate-800 italic">{result.interpretation}</p>
                  </div>
                </div>
              </div>

              {/* Sentiment & Urgency */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-wrap gap-6">
                  {/* Sentiment */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${sentimentConfig[result.sentiment].color}`}>
                      <span className="text-2xl">{sentimentConfig[result.sentiment].emoji}</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Sentiment</p>
                      <p className="font-medium text-slate-900">{sentimentConfig[result.sentiment].label}</p>
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${urgencyConfig[result.urgency].color}`}>
                      <span className="text-lg">
                        {result.urgency === 'high' ? '🔴' : result.urgency === 'medium' ? '🟡' : '⚪'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Urgency</p>
                      <p className="font-medium text-slate-900">{urgencyConfig[result.urgency].label}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              {(result.key_details.commitments.length > 0 ||
                result.key_details.requests.length > 0 ||
                result.key_details.concerns.length > 0 ||
                result.key_details.dates_mentioned.length > 0) && (
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-xl">📌</span>
                    <h3 className="text-sm font-semibold text-slate-500">Key details I extracted</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-9">
                    {result.key_details.commitments.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs font-medium text-green-700 mb-1">Commitments</p>
                        <ul className="text-sm text-green-800">
                          {result.key_details.commitments.map((c, i) => (
                            <li key={i}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.key_details.requests.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-700 mb-1">Requests</p>
                        <ul className="text-sm text-blue-800">
                          {result.key_details.requests.map((r, i) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.key_details.concerns.length > 0 && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs font-medium text-amber-700 mb-1">Concerns</p>
                        <ul className="text-sm text-amber-800">
                          {result.key_details.concerns.map((c, i) => (
                            <li key={i}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.key_details.dates_mentioned.length > 0 && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
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

              {/* My Recommendation */}
              <div className="p-6 bg-blue-50 border-b border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">My recommendation</h3>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{actionConfig[result.recommended_action.type].icon}</span>
                      <div>
                        <p className="font-medium text-blue-900">
                          {actionConfig[result.recommended_action.type].label}
                        </p>
                        <p className="text-blue-800 text-sm mt-0.5">
                          {result.recommended_action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="p-6 bg-slate-50">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🧠</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-1">How I reached this conclusion</h3>
                    <p className="text-sm text-slate-600 italic">&ldquo;{result.reasoning}&rdquo;</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Reply */}
            {result.suggested_reply && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    <h3 className="font-medium text-slate-900">Suggested Reply</h3>
                  </div>
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
                <div className="p-6">
                  <p className="text-slate-700 whitespace-pre-wrap">{result.suggested_reply}</p>
                </div>
              </div>
            )}

            {/* Interpret Another Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleInterpretAnother}
                className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Interpret Another Response
              </button>
            </div>
          </div>
        )}

        {/* Sample Responses Section - Always at the bottom */}
        <div className="border border-dashed border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowSamples(!showSamples)}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <span>🧪</span>
              Test with sample responses
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              {showSamples ? 'Collapse' : 'Expand'}
              <svg
                className={`w-4 h-4 transition-transform ${showSamples ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {showSamples && (
            <div className="px-4 py-3 bg-gray-50/50">
              <p className="text-xs text-gray-400 mb-3">
                Example responses for testing the interpreter. Click any to load it above.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sampleResponses.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSampleSelect(sample)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      responseText === sample.text
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <p className="text-center text-xs text-gray-400">
            Powered by AI · Recommendations are suggestions — use your judgment for final decisions
          </p>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sampleTravelers, Traveler } from '@/lib/sampleTravelers';
import { DataSourceIndicator, SyncStatus } from '@/components/DataSourceIndicator';

// Extended traveler type with AI analysis
interface AnalyzedTraveler extends Traveler {
  priority: 'critical' | 'attention' | 'wait' | 'none';
  shouldFollowUp: boolean;
  urgency: 'low' | 'medium' | 'high';
  channel: 'email' | 'phone';
  reasoning: string;
  message?: {
    subject: string;
    body: string;
  } | null;
}

interface DigestResult {
  travelers: AnalyzedTraveler[];
  summary: {
    total: number;
    critical: number;
    attention: number;
    wait: number;
    complete: number;
  };
}

// Loading messages that rotate to show AI activity (reference Sugati)
const LOADING_MESSAGES = [
  'Connecting to Sugati...',
  'Syncing traveler data from Salesforce...',
  'Pulling trip records and departure dates...',
  'Checking document completion status in Sugati...',
  'Retrieving communication history...',
  'Analyzing patterns across bookings...',
  'Calculating days until departures...',
  'Identifying travelers needing attention...',
  'Prioritizing by urgency and context...',
  'Preparing personalized recommendations...',
];

export default function DigestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<DigestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [markedDone, setMarkedDone] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [loadingDrafts, setLoadingDrafts] = useState<Set<string>>(new Set());
  const [generatedDrafts, setGeneratedDrafts] = useState<Record<string, { subject: string; body: string }>>(
    {}
  );
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Note: In production, this would come from API response
  // For now, using sample data (isLive = false)
  const isLiveData = false;

  // Format today's date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Rotate loading messages
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Load digest on mount
  useEffect(() => {
    generateDigest();
  }, []);

  const generateDigest = async () => {
    setIsLoading(true);
    setLoadingMessageIndex(0);
    setError(null);
    setGeneratedDrafts({});

    try {
      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          travelers: sampleTravelers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate digest');
      }

      const data = await response.json();
      setResult(data);
      setLastSyncTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDraft = async (traveler: AnalyzedTraveler) => {
    setLoadingDrafts((prev) => new Set(prev).add(traveler.id));

    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: traveler.name,
          email: traveler.email,
          tripName: traveler.tripName,
          daysUntilDeparture: traveler.daysUntilDeparture,
          previousContacts: traveler.previousContacts,
          missingItems: traveler.missingItems,
          notes: traveler.notes,
          channel: traveler.channel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate draft');
      }

      const data = await response.json();
      setGeneratedDrafts((prev) => ({
        ...prev,
        [traveler.id]: data,
      }));
      setExpandedCards((prev) => new Set(prev).add(traveler.id));
    } catch (err) {
      console.error('Error generating draft:', err);
    } finally {
      setLoadingDrafts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(traveler.id);
        return newSet;
      });
    }
  };

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleDone = (id: string) => {
    setMarkedDone((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Group travelers by priority
  const criticalTravelers = result?.travelers.filter((t) => t.priority === 'critical') || [];
  const attentionTravelers = result?.travelers.filter((t) => t.priority === 'attention') || [];
  const waitTravelers = result?.travelers.filter((t) => t.priority === 'wait') || [];

  // Calculate stats for the header
  const totalTravelers = sampleTravelers.length;
  const totalPreviousContacts = sampleTravelers.reduce((sum, t) => sum + t.previousContacts, 0);
  const totalMissingItems = sampleTravelers.reduce((sum, t) => sum + t.missingItems.length, 0);
  const uniqueTrips = new Set(sampleTravelers.map((t) => t.tripName)).size;

  // Build URL for Follow-Up Agent with traveler data
  const buildFollowUpUrl = (traveler: AnalyzedTraveler) => {
    const params = new URLSearchParams({
      name: traveler.name,
      email: traveler.email,
      days: traveler.daysUntilDeparture.toString(),
      contacts: traveler.previousContacts.toString(),
      missing: traveler.missingItems.join(','),
      notes: traveler.notes || '',
      from: 'digest',
    });
    return `/follow-up?${params.toString()}`;
  };

  // Traveler Card Component
  const TravelerCard = ({ traveler }: { traveler: AnalyzedTraveler }) => {
    const isExpanded = expandedCards.has(traveler.id);
    const isDone = markedDone.has(traveler.id);
    const isLoadingDraft = loadingDrafts.has(traveler.id);
    const draft = generatedDrafts[traveler.id];

    const getDaysColor = (days: number) => {
      if (days <= 7) return 'text-red-600 bg-red-50';
      if (days <= 14) return 'text-amber-600 bg-amber-50';
      return 'text-gray-600 bg-gray-50';
    };

    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all ${
          isDone ? 'opacity-50' : ''
        }`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-medium text-gray-900 ${isDone ? 'line-through' : ''}`}>
                  {traveler.name}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDaysColor(
                    traveler.daysUntilDeparture
                  )}`}
                >
                  {traveler.daysUntilDeparture} days
                </span>
                {traveler.channel === 'phone' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                    📞 Call recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{traveler.tripName}</p>

              {/* Missing Items */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {traveler.missingItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    {item}
                  </span>
                ))}
                {traveler.previousContacts > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700">
                    {traveler.previousContacts} previous contact{traveler.previousContacts > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* AI Insight - More prominent reasoning */}
              <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">💡 AI Insight:</span>{' '}
                  <span className="italic">&ldquo;{traveler.reasoning}&rdquo;</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link
                href={buildFollowUpUrl(traveler)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center"
              >
                Open Details →
              </Link>
              {draft ? (
                <button
                  onClick={() => toggleCard(traveler.id)}
                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {isExpanded ? 'Hide Draft' : 'View Draft'}
                </button>
              ) : (
                <button
                  onClick={() => generateDraft(traveler)}
                  disabled={isLoadingDraft}
                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:bg-blue-50 disabled:text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {isLoadingDraft ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Draft'
                  )}
                </button>
              )}
              <button
                onClick={() => toggleDone(traveler.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isDone
                    ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    : 'text-green-700 bg-green-50 hover:bg-green-100'
                }`}
              >
                {isDone ? 'Undo' : 'Mark Done'}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Message Draft */}
        {isExpanded && draft && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
                <p className="text-xs text-gray-500">Subject</p>
                <p className="text-sm font-medium text-gray-900">{draft.subject}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{draft.body}</p>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
              }}
              className="mt-3 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    );
  };

  // Section Component
  const Section = ({
    title,
    icon,
    colorClass,
    travelers,
    sectionKey,
  }: {
    title: string;
    icon: string;
    colorClass: string;
    travelers: AnalyzedTraveler[];
    sectionKey: string;
  }) => {
    const isCollapsed = collapsedSections.has(sectionKey);
    const activeTravelers = travelers.filter((t) => !markedDone.has(t.id));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full px-6 py-4 flex items-center justify-between ${colorClass} transition-colors`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <span className="px-2 py-0.5 rounded-full text-sm font-medium bg-white/50">
              {activeTravelers.length} / {travelers.length}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {!isCollapsed && (
          <div className="p-4 space-y-3">
            {travelers.length > 0 ? (
              travelers.map((traveler) => (
                <TravelerCard key={traveler.id} traveler={traveler} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No travelers in this category</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">GeoEx</Link>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">Daily Digest</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{today}</p>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/follow-up"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Follow-Up
              </Link>
              <Link
                href="/interpret"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Interpret
              </Link>
              <Link
                href="/anomalies"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Anomalies
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 flex-1">
        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="animate-spin h-10 w-10 text-blue-600 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-gray-900 font-medium mb-2">Analyzing {sampleTravelers.length} travelers...</p>
              <p className="text-blue-600 text-sm h-5 transition-opacity duration-300">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={generateDigest}
              className="mt-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 hover:bg-red-50 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <>
            {/* Data Source Indicator */}
            <div className="flex items-center justify-between">
              <DataSourceIndicator isLive={isLiveData} />
              <SyncStatus lastSyncTime={lastSyncTime || undefined} isLive={isLiveData} />
            </div>

            {/* AI Analysis Summary Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis Complete</h2>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Analyzed <strong>{totalTravelers} travelers</strong> across{' '}
                    <strong>{uniqueTrips} upcoming departures</strong>. Reviewed{' '}
                    <strong>{totalPreviousContacts} past communications</strong> and{' '}
                    <strong>{totalMissingItems} pending documents</strong>.
                    {result.summary.critical > 0 && (
                      <span className="text-red-700">
                        {' '}Found <strong>{result.summary.critical} critical situation{result.summary.critical > 1 ? 's' : ''}</strong> requiring immediate action.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {result.summary.critical + result.summary.attention + result.summary.wait}
                  </p>
                  <p className="text-sm text-gray-500">Need Attention</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{result.summary.critical}</p>
                  <p className="text-sm text-gray-500">Critical</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{result.summary.attention}</p>
                  <p className="text-sm text-gray-500">This Week</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-400">{result.summary.wait}</p>
                  <p className="text-sm text-gray-500">Can Wait</p>
                </div>
              </div>
            </div>

            {/* All Caught Up State */}
            {criticalTravelers.length === 0 &&
              attentionTravelers.length === 0 &&
              waitTravelers.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
                  <p className="text-4xl mb-4">🎉</p>
                  <h2 className="text-xl font-semibold text-green-800">All caught up!</h2>
                  <p className="text-green-600 mt-2">No follow-ups needed today.</p>
                </div>
              )}

            {/* Priority Sections */}
            {criticalTravelers.length > 0 && (
              <Section
                title="Critical — Act Today"
                icon="🔴"
                colorClass="bg-red-50 hover:bg-red-100"
                travelers={criticalTravelers}
                sectionKey="critical"
              />
            )}

            {attentionTravelers.length > 0 && (
              <Section
                title="Needs Attention — This Week"
                icon="🟡"
                colorClass="bg-amber-50 hover:bg-amber-100"
                travelers={attentionTravelers}
                sectionKey="attention"
              />
            )}

            {waitTravelers.length > 0 && (
              <Section
                title="Can Wait — Monitor"
                icon="⚪"
                colorClass="bg-gray-50 hover:bg-gray-100"
                travelers={waitTravelers}
                sectionKey="wait"
              />
            )}

            {/* Refresh Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={generateDigest}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh Digest
              </button>
            </div>
          </>
        )}
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

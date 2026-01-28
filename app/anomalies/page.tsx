'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataSourceIndicator, SyncStatus } from '@/components/DataSourceIndicator';

interface AnomalySummary {
  tripsAnalyzed: number;
  travelersAnalyzed: number;
  anomaliesFound: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

interface Anomaly {
  id: string;
  type: 'pattern' | 'behavior_change' | 'statistical_outlier' | 'timing' | 'data_inconsistency';
  priority: 'high' | 'medium' | 'low';
  title: string;
  affectedEntity: string;
  description: string;
  reasoning: string;
  possibleCauses: string[];
  suggestedAction: string;
  affectedTravelers?: string[];
  metrics?: Record<string, number | string>;
}

interface AnomalyResult {
  summary: AnomalySummary;
  anomalies: Anomaly[];
}

// Loading messages that reference Sugati
const LOADING_MESSAGES = [
  'Connecting to Sugati...',
  'Pulling all active trip data from Salesforce...',
  'Loading traveler records from Sugati...',
  'Analyzing document completion patterns...',
  'Comparing against historical baselines...',
  'Checking for behavior anomalies...',
  'Identifying statistical outliers...',
  'Correlating timing patterns across trips...',
  'Cross-referencing VIP behavior patterns...',
  'Compiling findings...',
];

const ANOMALY_TYPE_CONFIG = {
  pattern: { emoji: '🔗', label: 'PATTERN DETECTED', color: 'text-blue-700', bg: 'bg-blue-50' },
  behavior_change: { emoji: '👤', label: 'BEHAVIOR CHANGE', color: 'text-purple-700', bg: 'bg-purple-50' },
  statistical_outlier: { emoji: '📊', label: 'STATISTICAL OUTLIER', color: 'text-orange-700', bg: 'bg-orange-50' },
  timing: { emoji: '⏱️', label: 'TIMING ANOMALY', color: 'text-teal-700', bg: 'bg-teal-50' },
  data_inconsistency: { emoji: '⚠️', label: 'DATA INCONSISTENCY', color: 'text-amber-700', bg: 'bg-amber-50' },
};

const PRIORITY_CONFIG = {
  high: { emoji: '🔴', label: 'High', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' },
  medium: { emoji: '🟡', label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
  low: { emoji: '⚪', label: 'Low', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
};

export default function AnomaliesPage() {
  const [result, setResult] = useState<AnomalyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [hasScanned, setHasScanned] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Note: In production, this would come from API response
  // For now, using sample data (isLive = false)
  const isLiveData = false;

  // Rotate loading messages
  useEffect(() => {
    if (!loading) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, [loading]);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setHasScanned(true);

    try {
      const response = await fetch('/api/anomalies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to detect anomalies');
      }

      setResult(data);
      setLastSyncTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Render progress bar for statistical outliers
  const renderProgressBar = (actual: number, expected: number) => {
    const actualPercent = Math.min(actual, 100);
    const expectedPercent = Math.min(expected, 100);

    return (
      <div className="space-y-2 mt-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-20">This trip:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-red-400 h-full rounded-full"
              style={{ width: `${actualPercent}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 w-12">{actual}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-20">Expected:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-green-400 h-full rounded-full"
              style={{ width: `${expectedPercent}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 w-12">{expected}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xl font-bold text-slate-900 hover:text-blue-600">
                GeoEx
              </Link>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">Anomaly Detection</span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/follow-up" className="text-slate-600 hover:text-blue-600">
                Follow-Up
              </Link>
              <Link href="/digest" className="text-slate-600 hover:text-blue-600">
                Digest
              </Link>
              <Link href="/interpret" className="text-slate-600 hover:text-blue-600">
                Interpret
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Anomaly Detection</h1>
          <p className="text-slate-600">
            AI-spotted patterns that may need your attention
          </p>
        </div>

        {/* What This AI Does (only show before scan) */}
        {!hasScanned && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span>🧠</span>
              What this AI does
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Unlike traditional software that can only flag what you explicitly program,
              this AI agent:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-slate-700">
                  <strong>Notices patterns</strong> across multiple travelers (&quot;4 people missing the same form is unusual&quot;)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-slate-700">
                  <strong>Detects behavior changes</strong> (&quot;This VIP usually responds in 24 hours&quot;)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-slate-700">
                  <strong>Identifies statistical outliers</strong> (&quot;This trip is behind similar trips&quot;)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-slate-700">
                  <strong>Reasons about what&apos;s normal vs. abnormal</strong> and explains why
                </span>
              </li>
            </ul>
          </div>
        )}

        {/* Scan Button */}
        {!loading && !result && (
          <button
            onClick={handleScan}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <span>🔍</span>
            Scan for Anomalies
          </button>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-slate-700 font-medium mb-2">{loadingMessage}</p>
            <p className="text-sm text-slate-500">
              Analyzing all trips and travelers for unusual patterns...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Analysis Failed</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={handleScan}
                  className="mt-3 text-sm text-red-700 underline hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Data Source Indicator */}
            <div className="flex items-center justify-between mb-4">
              <DataSourceIndicator isLive={isLiveData} />
              <SyncStatus lastSyncTime={lastSyncTime || undefined} isLive={isLiveData} />
            </div>

            {/* Summary Stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔍</span>
                <span className="text-slate-700">
                  Scanned <strong>{result.summary.tripsAnalyzed} trips</strong> and{' '}
                  <strong>{result.summary.travelersAnalyzed} travelers</strong>
                </span>
              </div>

              {result.summary.anomaliesFound > 0 ? (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-800 font-medium mb-3">
                    Found {result.summary.anomaliesFound} anomal{result.summary.anomaliesFound === 1 ? 'y' : 'ies'} that may need attention:
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {result.summary.highPriority > 0 && (
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>🔴</span>
                        <span className="text-red-700 font-medium">
                          {result.summary.highPriority} High priority
                        </span>
                      </span>
                    )}
                    {result.summary.mediumPriority > 0 && (
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>🟡</span>
                        <span className="text-amber-700 font-medium">
                          {result.summary.mediumPriority} Medium priority
                        </span>
                      </span>
                    )}
                    {result.summary.lowPriority > 0 && (
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>⚪</span>
                        <span className="text-gray-600 font-medium">
                          {result.summary.lowPriority} Low priority
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="text-green-800 font-medium mb-1">No anomalies detected</p>
                      <p className="text-green-700 text-sm">
                        Everything looks normal across your trips and travelers. No unusual patterns,
                        behavior changes, or outliers found.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Anomaly Cards */}
            {result.anomalies.length > 0 && (
              <div className="space-y-4">
                {result.anomalies.map((anomaly) => {
                  const typeConfig = ANOMALY_TYPE_CONFIG[anomaly.type];
                  const priorityConfig = PRIORITY_CONFIG[anomaly.priority];

                  return (
                    <div
                      key={anomaly.id}
                      className={`bg-white border rounded-xl overflow-hidden ${priorityConfig.border}`}
                    >
                      {/* Card Header */}
                      <div className={`px-5 py-3 border-b ${priorityConfig.border} flex items-center justify-between ${typeConfig.bg}`}>
                        <div className="flex items-center gap-2">
                          <span>{typeConfig.emoji}</span>
                          <span className={`text-sm font-semibold ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${priorityConfig.color} ${priorityConfig.bg} px-2.5 py-1 rounded-full flex items-center gap-1`}>
                          {priorityConfig.emoji} {priorityConfig.label}
                        </span>
                      </div>

                      {/* Card Title */}
                      <div className="px-5 py-3 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-900">{anomaly.affectedEntity}</h3>
                        <p className="text-slate-600 text-sm">{anomaly.title}</p>
                      </div>

                      {/* Card Body */}
                      <div className="px-5 py-4 space-y-4">
                        {/* What I Noticed */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                            <span>🧠</span>
                            What I noticed:
                          </h4>
                          <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">
                            &quot;{anomaly.description}&quot;
                          </p>
                        </div>

                        {/* Reasoning / Why This Matters */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                            <span>🔍</span>
                            {anomaly.type === 'behavior_change' ? 'Why this matters:' : 'Why this is unusual:'}
                          </h4>
                          <p className="text-slate-600 text-sm">{anomaly.reasoning}</p>
                        </div>

                        {/* Progress Bar for Statistical Outliers */}
                        {anomaly.type === 'statistical_outlier' &&
                          anomaly.metrics?.actual !== undefined &&
                          anomaly.metrics?.expected !== undefined && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-1">
                                <span>📈</span>
                                Comparison:
                              </h4>
                              {renderProgressBar(
                                Number(anomaly.metrics.actual),
                                Number(anomaly.metrics.expected)
                              )}
                            </div>
                          )}

                        {/* Possible Causes */}
                        {anomaly.possibleCauses && anomaly.possibleCauses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                              <span>❓</span>
                              Possible causes:
                            </h4>
                            <ul className="text-sm text-slate-600 space-y-1">
                              {anomaly.possibleCauses.map((cause, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-slate-400">•</span>
                                  <span>{cause}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Affected Travelers */}
                        {anomaly.affectedTravelers && anomaly.affectedTravelers.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                              <span>👥</span>
                              Affected travelers:
                            </h4>
                            <p className="text-sm text-slate-600">
                              {anomaly.affectedTravelers.join(', ')}
                            </p>
                          </div>
                        )}

                        {/* Data Metrics for Data Inconsistency */}
                        {anomaly.type === 'data_inconsistency' && anomaly.metrics && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                              <span>📋</span>
                              The math:
                            </h4>
                            <ul className="text-sm text-slate-600 space-y-1">
                              {Object.entries(anomaly.metrics).map(([key, value]) => (
                                <li key={key} className="flex items-center gap-2">
                                  <span className="text-slate-400">•</span>
                                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                  <span className="font-medium">{value}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggested Action */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-blue-800 flex items-center gap-1.5 mb-1">
                            <span>💡</span>
                            Suggested action:
                          </h4>
                          <p className="text-sm text-blue-700">{anomaly.suggestedAction}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Scan Again Button */}
            <div className="mt-6">
              <button
                onClick={handleScan}
                className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                Scan Again
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>
            AI-powered anomaly detection. Findings are suggestions based on pattern analysis.
            Use your judgment for final decisions.
          </p>
        </div>
      </main>
    </div>
  );
}

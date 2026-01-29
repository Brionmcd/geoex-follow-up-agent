'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataSourceIndicator } from '@/components/DataSourceIndicator';
import { sampleTrips, Trip } from '@/lib/sampleTrips';

// Types for the API response
interface TripReadiness {
  actual: number;
  expected: number;
  difference: number;
  differenceLabel: string;
}

interface TripTrajectory {
  prediction: string;
  confidence: 'high' | 'medium' | 'low';
}

interface TripHealthResult {
  tripId: string;
  tripName: string;
  status: 'critical' | 'at_risk' | 'healthy' | 'complete';
  readiness: TripReadiness;
  trajectory: TripTrajectory;
  concerns: string[];
  positives: string[];
  assessment: string;
  recommendations: string[];
  hasAnomalies: boolean;
  anomalyHint?: string;
  // Merged from original trip data
  id: string;
  name: string;
  destination: string;
  departureDate: string;
  daysUntilDeparture: number;
  totalTravelers: number;
  tripLeader: string | null;
  completionRate: number;
  expectedCompletionRate: number;
  responseRate: number;
  documentsCollected: number;
  documentsRequired: number;
}

interface TripHealthSummary {
  totalTrips: number;
  totalTravelers: number;
  critical: number;
  atRisk: number;
  healthy: number;
  complete: number;
}

// Loading messages
const LOADING_MESSAGES = [
  'Calculating readiness for 5 trips...',
  'Comparing to historical baselines...',
  'Analyzing response patterns...',
  'Predicting completion trajectories...',
  'Identifying trips that need attention...',
  'Generating insights and recommendations...',
];

export default function TripHealthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [summary, setSummary] = useState<TripHealthSummary | null>(null);
  const [trips, setTrips] = useState<TripHealthResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Filters
  const [sortBy, setSortBy] = useState<'priority' | 'departure' | 'travelers'>('priority');
  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'at_risk'>('all');

  const isLiveData = false;

  // Rotate loading messages
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-analyze on mount
  useEffect(() => {
    if (!hasAnalyzed) {
      analyzeTrips();
    }
  }, [hasAnalyzed]);

  const analyzeTrips = async () => {
    setIsLoading(true);
    setLoadingMessageIndex(0);
    setError(null);

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trips: sampleTrips }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze trips');
      }

      const data = await response.json();
      setSummary(data.summary);
      setTrips(data.trips);
      setHasAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-700',
          icon: '🔴',
          label: 'Critical',
          accent: 'border-l-red-500',
        };
      case 'at_risk':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badge: 'bg-amber-100 text-amber-700',
          icon: '⚠️',
          label: 'At Risk',
          accent: 'border-l-amber-500',
        };
      case 'healthy':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-700',
          icon: '✅',
          label: 'Healthy',
          accent: 'border-l-green-500',
        };
      case 'complete':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
          icon: '✨',
          label: 'Complete',
          accent: 'border-l-blue-500',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-700',
          icon: '⚪',
          label: 'Unknown',
          accent: 'border-l-gray-500',
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter and sort trips
  const getFilteredTrips = () => {
    let filtered = [...trips];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // Apply sorting
    if (sortBy === 'departure') {
      filtered.sort((a, b) => a.daysUntilDeparture - b.daysUntilDeparture);
    } else if (sortBy === 'travelers') {
      filtered.sort((a, b) => b.totalTravelers - a.totalTravelers);
    }
    // 'priority' is already sorted by the API

    return filtered;
  };

  const filteredTrips = getFilteredTrips();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                GeoEx
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Trip Health Dashboard</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/digest"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Digest
              </Link>
              <Link
                href="/follow-up"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Follow-Up
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
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 flex-1">
        {/* Data Source Indicator */}
        <div className="flex justify-end">
          <DataSourceIndicator isLive={isLiveData} />
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <span>🌍</span> Trip Health Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            AI-powered overview of your upcoming departures
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-lg font-medium text-gray-900">Analyzing trip health...</p>
                <p className="text-sm text-gray-500 mt-2">{LOADING_MESSAGES[loadingMessageIndex]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">Error analyzing trips</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={analyzeTrips}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && summary && (
          <>
            {/* Summary Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="text-lg">📊</span>
                  <span className="font-medium">
                    {summary.totalTrips} upcoming trips · {summary.totalTravelers} travelers
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {summary.critical > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      🔴 {summary.critical} Critical
                    </span>
                  )}
                  {summary.atRisk > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      ⚠️ {summary.atRisk} At Risk
                    </span>
                  )}
                  {summary.healthy > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ✅ {summary.healthy} Healthy
                    </span>
                  )}
                  {summary.complete > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      ✨ {summary.complete} Complete
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="priority">Priority</option>
                  <option value="departure">Departure Date</option>
                  <option value="travelers">Travelers</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Filter:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Trips</option>
                  <option value="critical">Critical Only</option>
                  <option value="at_risk">At Risk Only</option>
                </select>
              </div>
              <button
                onClick={analyzeTrips}
                className="ml-auto text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh Analysis
              </button>
            </div>

            {/* Trip Cards */}
            <div className="space-y-6">
              {filteredTrips.map((trip) => {
                const style = getStatusStyle(trip.status);
                const actualPercent = Math.round(trip.readiness.actual * 100);
                const expectedPercent = Math.round(trip.readiness.expected * 100);

                return (
                  <div
                    key={trip.tripId}
                    className={`bg-white rounded-xl shadow-sm border ${style.border} overflow-hidden border-l-4 ${style.accent}`}
                  >
                    {/* Header */}
                    <div className={`${style.bg} px-6 py-4 border-b ${style.border}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                            {trip.name}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            {trip.destination} · Departs {formatDate(trip.departureDate)} ({trip.daysUntilDeparture} days)
                          </p>
                          <p className="text-sm text-gray-500">
                            {trip.totalTravelers} travelers
                            {trip.tripLeader && ` · Trip leader: ${trip.tripLeader}`}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${style.badge}`}>
                          {style.icon} {style.label}
                        </span>
                      </div>
                    </div>

                    {/* Readiness Section */}
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span>📊</span> Readiness
                      </h3>

                      {/* Progress Bars */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-16">Actual:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${
                                trip.status === 'critical'
                                  ? 'bg-red-500'
                                  : trip.status === 'at_risk'
                                    ? 'bg-amber-500'
                                    : 'bg-green-500'
                              }`}
                              style={{ width: `${actualPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12">{actualPercent}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-16">Expected:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gray-400 h-3 rounded-full"
                              style={{ width: `${expectedPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-500 w-12">{expectedPercent}%</span>
                        </div>
                      </div>

                      {/* Difference Label */}
                      <p className={`text-sm mt-2 ${
                        trip.readiness.difference >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trip.readiness.difference >= 0 ? '✓' : '▲'} {trip.readiness.differenceLabel}
                      </p>

                      {/* Trajectory */}
                      {trip.trajectory && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <h4 className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                            <span>📈</span> Trajectory
                          </h4>
                          <p className="text-sm text-gray-700">{trip.trajectory.prediction}</p>
                        </div>
                      )}
                    </div>

                    {/* AI Assessment */}
                    <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <span>🧠</span> AI Assessment
                      </h3>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                        {trip.assessment}
                      </p>

                      {/* Recommendations */}
                      {trip.recommendations && trip.recommendations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <h4 className="text-xs font-medium text-blue-700 mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {trip.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                                <span className="text-blue-400 mt-0.5">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 bg-gray-50 flex flex-wrap gap-3">
                      <Link
                        href={`/digest?trip=${trip.tripId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View Travelers
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      {(trip.status === 'critical' || trip.status === 'at_risk') && (
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Draft Group Email
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      {trip.hasAnomalies && (
                        <Link
                          href={`/anomalies?trip=${trip.tripId}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                        >
                          See Anomalies
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State for Filters */}
            {filteredTrips.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No trips match the current filter.</p>
                <button
                  onClick={() => setFilterStatus('all')}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Show all trips
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-center text-xs text-gray-400">
            Powered by AI · Health assessments are predictions — use your judgment for final decisions
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './components/Header';
import { OverallSummary } from './components/OverallSummary';
import { SingaporeMapDashboard } from './components/SingaporeMapDashboard';
import { AirQualityLegends } from './components/AirQualityLegends';
import { OutdoorActivityGuidance } from './components/OutdoorActivityGuidance';
import { HistoricalCharts } from './components/HistoricalCharts';
import { Footer } from './components/Footer';
import { fetchLatestAirQuality, fetchHistoricalAirQuality } from './services/airQualityService';
import { LatestAirQualityResponse, HistoricalReadingPoint } from './types/haze';
import { formatSingaporeTime } from './utils/classification';
import { AlertCircle, RefreshCw } from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 300; // 5 minutes

export default function App() {
  const [data, setData] = useState<LatestAirQualityResponse | null>(null);
  const [historyPoints, setHistoryPoints] = useState<HistoricalReadingPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedString, setLastRefreshedString] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(REFRESH_INTERVAL_SECONDS);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core data loader
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }

    try {
      setError(null);
      const latest = await fetchLatestAirQuality(isManual);
      setData(latest);

      const formatted = formatSingaporeTime(new Date());
      setLastRefreshedString(formatted.timeString);

      // Reset auto-refresh countdown
      setCountdown(REFRESH_INTERVAL_SECONDS);
    } catch (err) {
      console.error('Failed to load air quality readings:', err);
      setError(err instanceof Error ? err.message : 'Failed to retrieve air quality data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // History loader
  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const points = await fetchHistoricalAirQuality();
      setHistoryPoints(points);
    } catch (err) {
      console.warn('History fetch encountered an issue:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // Initial mount
  useEffect(() => {
    loadData(false);
    loadHistory();
  }, [loadData, loadHistory]);

  // Countdown timer & auto-refresh interval
  useEffect(() => {
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger automatic refresh
          loadData(false);
          loadHistory();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [loadData, loadHistory]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-rose-200">
      <Analytics />
      {/* 1. Header with live Singapore clock & auto-refresh controls */}
      <Header
        lastUpdated={lastRefreshedString}
        isRefreshing={isRefreshing}
        isStale={data?.isStale ?? false}
        onRefresh={() => {
          loadData(true);
          loadHistory();
        }}
        countdownSeconds={countdown}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error notification banner if any */}
        {error && !data && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Unable to connect to air-quality servers</h4>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => {
                loadData(true);
                loadHistory();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Initial Loading Screen */}
        {isLoading && !data ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-rose-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-slate-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-sm">
                Retrieving official Singapore air quality data...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Connecting to NEA and Data.gov.sg real-time monitoring stations
              </p>
            </div>
          </div>
        ) : (
          data && (
            <>
              {/* 2. Overall Singapore Air-Quality Summary */}
              <OverallSummary summary={data.summary} sourceText={data.source} />

              {/* 3. Singapore Regional Air-Quality Map Dashboard */}
              <SingaporeMapDashboard regions={data.regions} />

              {/* 4. PM2.5 and PSI Colour Legends & Guidance Descriptors */}
              <AirQualityLegends />

              {/* 5. Outdoor Activity Guidance */}
              <OutdoorActivityGuidance
                summary={data.summary}
              />

              {/* 6. Recent Haze Readings / Historical Trends */}
              <HistoricalCharts
                points={historyPoints}
                isLoading={isHistoryLoading}
              />
            </>
          )
        )}
      </main>

      {/* 7. Footer & Attributions */}
      <Footer />
    </div>
  );
}

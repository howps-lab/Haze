/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatSingaporeTime } from '../utils/classification';

interface HeaderProps {
  lastUpdated: string | null;
  isRefreshing: boolean;
  isStale: boolean;
  onRefresh: () => void;
  countdownSeconds: number;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  isRefreshing,
  isStale,
  onRefresh,
  countdownSeconds,
}) => {
  const [clock, setClock] = useState(() => formatSingaporeTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(formatSingaporeTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      {/* Top Banner if stale */}
      {isStale && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-center gap-2 text-center">
          <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
          <span>Notice: Live official upstream connection is delayed. Displaying last successfully retrieved official readings.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title and Singapore live clock */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                Live Official Data
              </span>
              <span className="text-xs text-slate-500 font-medium">NEA &amp; Data.gov.sg</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Singapore Haze Update
            </h1>

            {/* Singapore Clock in prominent dark red accent */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base font-semibold text-rose-700">
              <Clock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Singapore Standard Time:</span>
              <span className="font-mono bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-rose-900 font-bold tracking-tight">
                {clock.fullString}
              </span>
            </div>

            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
              Live 1-hour PM<sub>2.5</sub> and 24-hour PSI readings across all five regions to help you plan outdoor activities.
            </p>
          </div>

          {/* Action bar: Live status, countdown, manual refresh button */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 self-start lg:self-center shadow-xs">
            <div className="flex flex-col text-xs pr-2 border-r border-slate-200">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                {isStale ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-amber-700">Stale Mode</span>
                  </>
                ) : isRefreshing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span className="text-blue-700">Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Live &amp; Connected</span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Auto-refresh in <span className="font-mono font-medium text-slate-700">{formatCountdown(countdownSeconds)}</span>
              </div>
            </div>

            <div className="flex flex-col text-xs hidden sm:flex pr-2 border-r border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Last Refreshed</span>
              <span className="font-mono font-semibold text-slate-700">
                {lastUpdated || 'Initialising...'}
              </span>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                isRefreshing
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 cursor-pointer'
              }`}
              title="Refresh readings immediately"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing' : 'Refresh Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

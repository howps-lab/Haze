/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AirQualitySummary } from '../types/haze';
import {
  formatReadingTimestamp,
  getPM25ReadingTheme,
  getPSIReadingTheme,
} from '../utils/classification';
import { Activity, Wind, Clock } from 'lucide-react';

interface OverallSummaryProps {
  summary: AirQualitySummary;
  sourceText?: string;
}

export const OverallSummary: React.FC<OverallSummaryProps> = ({ summary }) => {
  const { highestPm25, highestPsi, latestTimestamp } = summary;

  const pmTheme = getPM25ReadingTheme(highestPm25.value);
  const psiTheme = getPSIReadingTheme(highestPsi.value);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-slate-900 rounded-full" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Singapore Air-Quality Summary
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
            Regional Maxima
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Latest Official Reading:</span>
          <span className="font-mono font-semibold text-slate-800">
            {formatReadingTimestamp(latestTimestamp)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Highest 1-hour PM2.5 */}
        <div className="p-4 rounded-xl border border-slate-200 bg-linear-to-b from-white to-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-slate-600" />
                Highest 1-Hour PM<sub>2.5</sub>
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {highestPm25.regionName}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {highestPm25.value !== null ? highestPm25.value : 'Unavailable'}
              </span>
              {highestPm25.value !== null && (
                <span className="text-xs font-semibold text-slate-500">µg/m³</span>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span
              className="inline-block px-2.5 py-1 rounded text-xs font-bold border shadow-2xs"
              style={{
                backgroundColor: pmTheme.bgHex,
                color: pmTheme.textColor,
                borderColor: pmTheme.badgeBorderHex,
              }}
            >
              {pmTheme.band} ({highestPm25.value !== null ? `${highestPm25.value} µg/m³` : 'No data'})
            </span>
            <span className="text-[11px] text-slate-500">Immediate Activities</span>
          </div>
        </div>

        {/* Highest 24-hour PSI */}
        <div className="p-4 rounded-xl border border-slate-200 bg-linear-to-b from-white to-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-slate-600" />
                Highest 24-Hour PSI
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {highestPsi.regionName}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {highestPsi.value !== null ? highestPsi.value : 'Unavailable'}
              </span>
              {highestPsi.value !== null && (
                <span className="text-xs font-semibold text-slate-500">PSI</span>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span
              className="inline-block px-2.5 py-1 rounded text-xs font-bold border shadow-2xs"
              style={{
                backgroundColor: psiTheme.bgHex,
                color: psiTheme.textColor,
                borderColor: psiTheme.badgeBorderHex,
              }}
            >
              {psiTheme.band} ({highestPsi.value !== null ? `${highestPsi.value} PSI` : 'No data'})
            </span>
            <span className="text-[11px] text-slate-500">Daily Planning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

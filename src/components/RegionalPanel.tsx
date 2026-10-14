/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RegionalReading } from '../types/haze';
import {
  formatReadingTimestamp,
  getPM25ReadingTheme,
  getPSIReadingTheme,
} from '../utils/classification';
import { MapPin } from 'lucide-react';

interface RegionalPanelProps {
  reading: RegionalReading;
}

export const RegionalPanel: React.FC<RegionalPanelProps> = ({ reading }) => {
  const { name, pm25, psi, pm25Timestamp } = reading;

  // Calculate themes based directly on the official numerical values
  const pmTheme = getPM25ReadingTheme(pm25);
  const psiTheme = getPSIReadingTheme(psi);

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-rose-400" />
          <span className="font-black text-sm sm:text-base tracking-wider uppercase text-slate-100">
            {name}
          </span>
        </div>
        <span className="text-[11px] text-slate-300 font-mono">
          {pm25Timestamp ? formatReadingTimestamp(pm25Timestamp) : 'Live'}
        </span>
      </div>

      {/* Side-by-side Air Quality Readings with colored backgrounds */}
      <div className="grid grid-cols-2 divide-x divide-black/10 grow">
        {/* 1-hour PM2.5 reading cell */}
        <div
          className="p-3.5 sm:p-4 flex flex-col justify-between transition-colors"
          style={{ backgroundColor: pmTheme.bgHex }}
        >
          <div>
            <div className="flex items-baseline justify-between">
              <span
                className="text-xs font-bold tracking-tight"
                style={{ color: pmTheme.textColor }}
              >
                1-hr PM<sub>2.5</sub>
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: pmTheme.subTextColor }}
              >
                µg/m³
              </span>
            </div>
            <div
              className="mt-2 text-3xl sm:text-4xl font-black tracking-tight"
              style={{ color: pmTheme.textColor }}
            >
              {pm25 !== null ? pm25 : '—'}
            </div>
          </div>

          <div className="mt-3">
            <span
              className="inline-block w-full text-center py-1.5 px-1 rounded-md text-xs font-black shadow-xs tracking-wide border"
              style={{
                backgroundColor: pmTheme.badgeBgHex,
                color: pmTheme.badgeTextColor,
                borderColor: pmTheme.badgeBorderHex,
              }}
            >
              {pmTheme.band}
            </span>
          </div>
        </div>

        {/* 24-hour PSI reading cell */}
        <div
          className="p-3.5 sm:p-4 flex flex-col justify-between transition-colors"
          style={{ backgroundColor: psiTheme.bgHex }}
        >
          <div>
            <div className="flex items-baseline justify-between">
              <span
                className="text-xs font-bold tracking-tight"
                style={{ color: psiTheme.textColor }}
              >
                24-hr PSI
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: psiTheme.subTextColor }}
              >
                Index
              </span>
            </div>
            <div
              className="mt-2 text-3xl sm:text-4xl font-black tracking-tight"
              style={{ color: psiTheme.textColor }}
            >
              {psi !== null ? psi : '—'}
            </div>
          </div>

          <div className="mt-3">
            <span
              className="inline-block w-full text-center py-1.5 px-1 rounded-md text-xs font-black shadow-xs tracking-wide border"
              style={{
                backgroundColor: psiTheme.badgeBgHex,
                color: psiTheme.badgeTextColor,
                borderColor: psiTheme.badgeBorderHex,
              }}
            >
              {psiTheme.band}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

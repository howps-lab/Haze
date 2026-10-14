/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, ShieldCheck, Database, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1">
              <Globe className="w-4 h-4 text-rose-600" />
              <span>Singapore Real-Time Haze Monitoring System</span>
            </div>
            <p className="text-slate-500 max-w-xl text-[11px] leading-relaxed">
              Official real-time air quality data retrieved directly from the National Environment Agency (NEA) and Singapore Government Open Data Portal (Data.gov.sg).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://www.haze.gov.sg/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
            >
              <span>Official NEA Haze Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

            <a
              href="https://data.gov.sg/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
            >
              <span>Data.gov.sg API</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-slate-500">
          <div>
            <span className="font-bold text-slate-700 block mb-1">1-Hour PM2.5 Readings</span>
            <p className="leading-relaxed">
              1-hour PM<sub>2.5</sub> concentration levels indicate immediate air quality over the preceding hour. These values help individuals decide on immediate outdoor physical activities.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-1">24-Hour PSI Index</span>
            <p className="leading-relaxed">
              The 24-hour Pollutant Standards Index (PSI) is calculated from the average concentrations of PM<sub>2.5</sub> and five other key air pollutants over the past 24 hours. Used for broad daily activity planning.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-1">Data Disclaimer</span>
            <p className="leading-relaxed">
              All readings are sourced from official government stations. Regional maxima represent the highest reporting regional monitor and do not represent an official national average.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center text-slate-400 text-[10px]">
          Official Singapore Air Quality Monitoring · Asia/Singapore (SGT, UTC+8)
        </div>
      </div>
    </footer>
  );
};

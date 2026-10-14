/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RegionalReading, RegionKey } from '../types/haze';
import { RegionalPanel } from './RegionalPanel';
import { LayoutGrid, Info } from 'lucide-react';

interface SingaporeMapDashboardProps {
  regions: Record<RegionKey, RegionalReading>;
}

export const SingaporeMapDashboard: React.FC<SingaporeMapDashboardProps> = ({ regions }) => {
  const { north, south, east, west, central } = regions;

  const regionList = [
    { key: 'north', reading: north },
    { key: 'south', reading: south },
    { key: 'east', reading: east },
    { key: 'west', reading: west },
    { key: 'central', reading: central },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-slate-900 rounded-full" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-slate-700" />
              <span>Singapore Regional Air Quality</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live official 1-hour PM<sub>2.5</sub> and 24-hour PSI readings for all five Singapore regions
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
          Card Grid View
        </div>
      </div>

      {/* 5-Card Responsive Grid */}
      <div className="p-4 sm:p-6 lg:p-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {regionList.map(({ key, reading }) => (
            reading ? <RegionalPanel key={key} reading={reading} /> : null
          ))}
        </div>
      </div>

      {/* Bottom informational note */}
      <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          Readings update automatically every hour from official National Environment Agency (NEA) stations.
        </span>
        <span className="font-semibold text-slate-600">
          5 Monitored Regions
        </span>
      </div>
    </div>
  );
};

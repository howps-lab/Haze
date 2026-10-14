/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wind, Activity } from 'lucide-react';

export const AirQualityLegends: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Air-Quality Colour Code &amp; Descriptors
        </h3>
        <p className="text-xs text-slate-500">
          Official colour thresholds and category definitions for 1-hour PM<sub>2.5</sub> and 24-hour PSI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1-hour PM2.5 Legend */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-900">
                  1-Hour PM<sub>2.5</sub> Colour Code
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                µg/m³
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Indicator for <strong>immediate outdoor activities</strong> in the next 1–3 hours.
            </p>

            <div className="space-y-2">
              {/* 0-55 is Green */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-green-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-green-950">
                      Normal (Green)
                    </span>
                    <p className="text-[10px] text-green-800">
                      Normal outdoor activities can proceed
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-green-600 px-2.5 py-1 rounded shadow-2xs">
                  0 – 55
                </span>
              </div>

              {/* 56-150 is Yellow */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-yellow-50 border border-yellow-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-yellow-950">
                      Elevated (Yellow)
                    </span>
                    <p className="text-[10px] text-yellow-900">
                      Vulnerable groups reduce strenuous activity
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-yellow-950 bg-yellow-400 px-2.5 py-1 rounded shadow-2xs">
                  56 – 150
                </span>
              </div>

              {/* 151-250 is Orange */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-50 border border-orange-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-orange-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-orange-950">
                      High (Orange)
                    </span>
                    <p className="text-[10px] text-orange-900">
                      Healthy reduce; vulnerable avoid strenuous exercise
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-orange-500 px-2.5 py-1 rounded shadow-2xs">
                  151 – 250
                </span>
              </div>

              {/* 250 and above is Red */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 border border-red-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-red-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-red-950">
                      Very High (Red)
                    </span>
                    <p className="text-[10px] text-red-900">
                      Avoid outdoor physical exertion. Stay indoors.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-red-600 px-2.5 py-1 rounded shadow-2xs">
                  &ge; 250
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 24-hour PSI Legend */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-900">
                  24-Hour PSI Colour Code
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                PSI Scale
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Indicator for <strong>daily planning and next-day outdoor activities</strong>.
            </p>

            <div className="space-y-1.5">
              {/* 0-50 is Green */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-green-600 shrink-0" />
                  <span className="text-xs font-bold text-green-950">Good (Green)</span>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-green-600 px-2.5 py-0.5 rounded shadow-2xs">
                  0 – 50
                </span>
              </div>

              {/* 51-100 is Blue */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-blue-950">Moderate (Blue)</span>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-blue-600 px-2.5 py-0.5 rounded shadow-2xs">
                  51 – 100
                </span>
              </div>

              {/* 101-200 is Yellow */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 border border-yellow-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 shrink-0" />
                  <span className="text-xs font-bold text-yellow-950">Unhealthy (Yellow)</span>
                </div>
                <span className="text-xs font-mono font-bold text-yellow-950 bg-yellow-400 px-2.5 py-0.5 rounded shadow-2xs">
                  101 – 200
                </span>
              </div>

              {/* 201-300 is Orange */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 border border-orange-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shrink-0" />
                  <span className="text-xs font-bold text-orange-950">Very Unhealthy (Orange)</span>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-orange-500 px-2.5 py-0.5 rounded shadow-2xs">
                  201 – 300
                </span>
              </div>

              {/* 300 above is Red */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0" />
                  <span className="text-xs font-bold text-red-950">Hazardous (Red)</span>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-red-600 px-2.5 py-0.5 rounded shadow-2xs">
                  &gt; 300
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AirQualitySummary } from '../types/haze';
import { ShieldCheck, HeartPulse, ExternalLink, AlertOctagon, UserCheck } from 'lucide-react';

interface OutdoorActivityGuidanceProps {
  summary: AirQualitySummary;
}

export const OutdoorActivityGuidance: React.FC<OutdoorActivityGuidanceProps> = ({
  summary,
}) => {
  const { highestPm25 } = summary;

  // Guidance matrix based on PM2.5 band for immediate activities
  const getImmediateAdvice = () => {
    switch (highestPm25.classification.band) {
      case 'Normal':
        return {
          headline: 'Normal outdoor activities may proceed.',
          healthy: 'Normal activities.',
          vulnerable: 'Normal activities.',
          highRisk: 'Normal activities.',
        };
      case 'Elevated':
        return {
          headline: 'Air quality is elevated; vulnerable individuals should take precaution.',
          healthy: 'Normal activities can proceed.',
          vulnerable: 'Reduce strenuous outdoor physical exertion for the next few hours.',
          highRisk: 'Avoid prolonged or strenuous outdoor physical exertion.',
        };
      case 'High':
        return {
          headline: 'Air quality is high; reduce strenuous exertion outdoors.',
          healthy: 'Reduce prolonged or strenuous outdoor physical exertion.',
          vulnerable: 'Avoid strenuous outdoor physical exertion; minimise time outside.',
          highRisk: 'Avoid outdoor physical exertion. Stay indoors with windows closed.',
        };
      case 'Very High':
        return {
          headline: 'Air quality is very high; avoid outdoor physical exertion.',
          healthy: 'Avoid prolonged or strenuous outdoor physical exertion.',
          vulnerable: 'Avoid outdoor activity. Remain indoors where possible.',
          highRisk: 'Stay indoors. Keep physical exertion minimal and seek medical advice if unwell.',
        };
      default:
        return {
          headline: 'Refer to latest official guidance on Haze.gov.sg.',
          healthy: 'Check current conditions before strenuous exercise.',
          vulnerable: 'Monitor conditions closely.',
          highRisk: 'Follow personal doctor advice.',
        };
    }
  };

  const immediate = getImmediateAdvice();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-6 bg-slate-900 rounded-full" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Outdoor Activity Guidance
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Official health recommendations based on 1-hour PM<sub>2.5</sub> concentration for immediate activities
        </p>
      </div>

      {/* Planning outdoor activities now */}
      <div className="border border-slate-200 rounded-xl p-5 bg-linear-to-b from-slate-50/70 to-white flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <UserCheck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Planning Outdoor Activities NOW
                </h4>
                <span className="text-[11px] text-slate-500">
                  Governed by 1-Hour PM<sub>2.5</sub> concentration
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              Immediate
            </span>
          </div>

          {/* Current Region with highest reading */}
          <div className="mb-4 p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
            <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-800">
              <span>Peak Regional 1-hr PM<sub>2.5</sub>: </span>
              <strong className="text-slate-950 font-bold">{highestPm25.regionName}</strong> at{' '}
              <strong className="font-mono">{highestPm25.value !== null ? `${highestPm25.value} µg/m³` : 'Unavailable'}</strong>{' '}
              ({highestPm25.classification.label}).
              <p className="text-slate-600 mt-1">{immediate.headline}</p>
            </div>
          </div>

          {/* Group recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Healthy Persons
              </div>
              <p className="text-slate-600 leading-relaxed">{immediate.healthy}</p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
                Elderly, Pregnant Women &amp; Children
              </div>
              <p className="text-slate-600 leading-relaxed">{immediate.vulnerable}</p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                Persons with Chronic Disease
              </div>
              <p className="text-slate-600 leading-relaxed">{immediate.highRisk}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-500">Check current readings before engaging in strenuous physical activity</span>
          <a
            href="https://www.haze.gov.sg/guidance"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-700 hover:text-rose-800 font-semibold inline-flex items-center gap-1"
          >
            <span>Official NEA Health Advisories</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

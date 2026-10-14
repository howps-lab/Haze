/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { HistoricalReadingPoint, RegionKey } from '../types/haze';
import { REGION_NAMES } from '../utils/classification';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface HistoricalChartsProps {
  points: HistoricalReadingPoint[];
  isLoading: boolean;
}

const REGION_COLORS: Record<RegionKey, string> = {
  north: '#2563EB', // Blue
  south: '#059669', // Emerald
  east: '#D97706', // Amber
  west: '#DC2626', // Red
  central: '#7C3AED', // Purple
};

export const HistoricalCharts: React.FC<HistoricalChartsProps> = ({
  points,
  isLoading,
}) => {
  const [metric, setMetric] = useState<'pm25' | 'psi'>('pm25');
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | 'all'>('all');

  const hasData = points && points.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-slate-900 rounded-full" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Recent Haze Readings (Past 24 Hours)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Historical hourly readings retrieved from official Data.gov.sg records
          </p>
        </div>

        {/* Controls: Metric Toggle & Region Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setMetric('pm25')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                metric === 'pm25'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1-hr PM<sub>2.5</sub>
            </button>
            <button
              onClick={() => setMetric('psi')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                metric === 'psi'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24-hr PSI
            </button>
          </div>

          {/* Region filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as RegionKey | 'all')}
            aria-label="Filter historical readings by Singapore region"
            className="text-xs bg-slate-100 border border-slate-200 text-slate-800 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-slate-400 cursor-pointer"
          >
            <option value="all">All 5 Regions</option>
            <option value="north">North Region</option>
            <option value="south">South Region</option>
            <option value="east">East Region</option>
            <option value="west">West Region</option>
            <option value="central">Central Region</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
            <span>Loading official historical records...</span>
          </div>
        </div>
      ) : !hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
          <p className="font-semibold text-slate-700">Historical air quality data currently unavailable</p>
          <p className="text-slate-500 mt-1 max-w-md">
            The upstream official Data.gov.sg API has not published historical archives for this timeframe yet. Only live data is currently available.
          </p>
        </div>
      ) : (
        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={points}
              margin={{ top: 10, right: 15, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="formattedTime"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval="preserveStartEnd"
                dy={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                unit={metric === 'pm25' ? ' µg' : ''}
                dx={-2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: any, name: any) => {
                  const label = String(name).replace('_pm25', '').replace('_psi', '');
                  const formattedName = REGION_NAMES[label as RegionKey] || label;
                  return [`${value ?? 'N/A'} ${metric === 'pm25' ? 'µg/m³' : 'PSI'}`, formattedName];
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => {
                  const rKey = val.replace(`_${metric}`, '') as RegionKey;
                  return (
                    <span className="text-xs font-semibold text-slate-700">
                      {REGION_NAMES[rKey] || val}
                    </span>
                  );
                }}
              />

              {(selectedRegion === 'all' || selectedRegion === 'north') && (
                <Line
                  type="monotone"
                  dataKey={`north_${metric}`}
                  stroke={REGION_COLORS.north}
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                  name={`north_${metric}`}
                />
              )}
              {(selectedRegion === 'all' || selectedRegion === 'south') && (
                <Line
                  type="monotone"
                  dataKey={`south_${metric}`}
                  stroke={REGION_COLORS.south}
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                  name={`south_${metric}`}
                />
              )}
              {(selectedRegion === 'all' || selectedRegion === 'east') && (
                <Line
                  type="monotone"
                  dataKey={`east_${metric}`}
                  stroke={REGION_COLORS.east}
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                  name={`east_${metric}`}
                />
              )}
              {(selectedRegion === 'all' || selectedRegion === 'west') && (
                <Line
                  type="monotone"
                  dataKey={`west_${metric}`}
                  stroke={REGION_COLORS.west}
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                  name={`west_${metric}`}
                />
              )}
              {(selectedRegion === 'all' || selectedRegion === 'central') && (
                <Line
                  type="monotone"
                  dataKey={`central_${metric}`}
                  stroke={REGION_COLORS.central}
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                  name={`central_${metric}`}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

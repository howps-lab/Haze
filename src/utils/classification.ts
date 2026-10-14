/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PM25Classification, PSIClassification, RegionKey } from '../types/haze';

export const REGION_NAMES: Record<RegionKey, string> = {
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
  central: 'Central',
};

export const REGION_KEYS: RegionKey[] = ['north', 'south', 'east', 'west', 'central'];

/**
 * Classifies 1-hour PM2.5 concentration according to official NEA thresholds:
 * 0 - 55: Normal (Band 1) -> Green
 * 56 - 150: Elevated (Band 2) -> Yellow
 * 151 - 250: High (Band 3) -> Orange
 * 251+: Very High (Band 4) -> Red
 */
export function classifyPM25(val: number | null | undefined): PM25Classification {
  if (val === null || val === undefined || isNaN(val) || val < 0) {
    return {
      band: 'Unavailable',
      label: 'Unavailable',
      category: 'No Data',
      colorName: 'gray',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-600',
      badgeBorder: 'border-slate-300',
      panelBg: 'bg-slate-50',
      dotColor: 'bg-slate-400',
      description: 'Reading unavailable',
    };
  }

  // Rounded or floating: handle boundary values directly
  const v = Math.round(val);

  if (v <= 55) {
    return {
      band: 'Normal',
      bandNumber: 1,
      label: 'Normal (0–55)',
      category: 'Normal',
      colorName: 'green',
      badgeBg: 'bg-green-600 text-white font-bold',
      badgeText: 'text-white',
      badgeBorder: 'border-green-600',
      panelBg: 'bg-green-50/90 border-green-300',
      dotColor: 'bg-green-600',
      description: 'Normal outdoor activities can proceed.',
    };
  } else if (v <= 150) {
    return {
      band: 'Elevated',
      bandNumber: 2,
      label: 'Elevated (56–150)',
      category: 'Elevated',
      colorName: 'yellow',
      badgeBg: 'bg-yellow-400 text-yellow-950 font-bold',
      badgeText: 'text-yellow-950',
      badgeBorder: 'border-yellow-400',
      panelBg: 'bg-yellow-50/90 border-yellow-300',
      dotColor: 'bg-yellow-500',
      description: 'Vulnerable individuals should reduce strenuous outdoor activities.',
    };
  } else if (v < 250) {
    return {
      band: 'High',
      bandNumber: 3,
      label: 'High (151–250)',
      category: 'High',
      colorName: 'orange',
      badgeBg: 'bg-orange-500 text-white font-bold',
      badgeText: 'text-white',
      badgeBorder: 'border-orange-500',
      panelBg: 'bg-orange-50/90 border-orange-300',
      dotColor: 'bg-orange-500',
      description: 'Healthy persons should reduce strenuous outdoor activity; vulnerable persons avoid it.',
    };
  } else {
    return {
      band: 'Very High',
      bandNumber: 4,
      label: 'Very High (250+)',
      category: 'Very High',
      colorName: 'red',
      badgeBg: 'bg-red-600 text-white font-bold',
      badgeText: 'text-white',
      badgeBorder: 'border-red-600',
      panelBg: 'bg-red-50/90 border-red-300',
      dotColor: 'bg-red-600',
      description: 'Avoid outdoor physical exertion. Stay indoors where possible.',
    };
  }
}

/**
 * Classifies 24-hour PSI according to official NEA thresholds:
 * 0 - 50: Good -> Green
 * 51 - 100: Moderate -> Blue
 * 101 - 200: Unhealthy -> Yellow
 * 201 - 300: Very Unhealthy -> Orange
 * > 300 (301+): Hazardous -> Red
 */
export function classifyPSI(val: number | null | undefined): PSIClassification {
  if (val === null || val === undefined || isNaN(val) || val < 0) {
    return {
      band: 'Unavailable',
      label: 'Unavailable',
      category: 'No Data',
      colorName: 'gray',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-600',
      badgeBorder: 'border-slate-300',
      panelBg: 'bg-slate-50',
      dotColor: 'bg-slate-400',
      description: 'Reading unavailable',
    };
  }

  const v = Math.round(val);

  if (v <= 50) {
    return {
      band: 'Good',
      label: 'Good (0–50)',
      category: 'Good',
      colorName: 'green',
      badgeBg: 'bg-green-600 text-white font-bold',
      badgeText: 'text-white',
      badgeBorder: 'border-green-600',
      panelBg: 'bg-green-50/90 border-green-300',
      dotColor: 'bg-green-600',
      description: 'Air quality is satisfactory (0–50).',
    };
  } else if (v <= 100) {
    return {
      band: 'Moderate',
      label: 'Moderate (51–100)',
      category: 'Moderate',
      colorName: 'blue',
      badgeBg: 'bg-blue-600 text-white font-bold',
      badgeText: 'text-white',
      badgeBorder: 'border-blue-600',
      panelBg: 'bg-blue-50/90 border-blue-300',
      dotColor: 'bg-blue-600',
      description: 'Air quality is acceptable (51–100).',
    };
  } else if (v <= 200) {
    return {
      band: 'Unhealthy',
      label: 'Unhealthy (101–200)',
      category: 'Unhealthy',
      colorName: 'yellow',
      badgeBg: 'bg-yellow-400 text-yellow-950 font-bold',
      badgeText: 'text-yellow-950',
      badgeBorder: 'border-yellow-400',
      panelBg: 'bg-yellow-50/90 border-yellow-300',
      dotColor: 'bg-yellow-500',
      description: 'Everyone may begin to experience health effects (101–200).',
    };
  } else if (v <= 300) {
    return {
      band: 'Very Unhealthy',
      label: 'Very Unhealthy (201–300)',
      category: 'Very Unhealthy',
      colorName: 'orange',
      badgeBg: 'bg-orange-500 text-white font-bold',
      badgeText: 'text-white',
      badgeBorder: 'border-orange-500',
      panelBg: 'bg-orange-50/90 border-orange-300',
      dotColor: 'bg-orange-500',
      description: 'Health alert: risk of health effects increased for everyone (201–300).',
    };
  } else {
    return {
      band: 'Hazardous',
      label: 'Hazardous (300+)',
      category: 'Hazardous',
      colorName: 'red',
      badgeBg: 'bg-red-600 text-white font-bold',
      badgeText: 'text-white',
      badgeBorder: 'border-red-600',
      panelBg: 'bg-red-50/90 border-red-300',
      dotColor: 'bg-red-600',
      description: 'Health warning of emergency conditions. Above 300 is hazardous.',
    };
  }
}

export interface ReadingCellTheme {
  colorName: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'gray';
  bgHex: string;
  textColor: string;
  subTextColor: string;
  badgeBgHex: string;
  badgeTextColor: string;
  badgeBorderHex: string;
  band: string;
}

/**
 * 1-Hour PM2.5 Background Color Code:
 * 0 – 55: Green
 * 56 – 150: Yellow
 * 151 – 250: Orange
 * 250 and above: Red
 */
export function getPM25ReadingTheme(val: number | null | undefined): ReadingCellTheme {
  if (val === null || val === undefined || isNaN(val) || val < 0) {
    return {
      colorName: 'gray',
      bgHex: '#f1f5f9',
      textColor: '#475569',
      subTextColor: '#64748b',
      badgeBgHex: '#e2e8f0',
      badgeTextColor: '#334155',
      badgeBorderHex: '#cbd5e1',
      band: 'Unavailable',
    };
  }

  const v = Math.round(val);
  if (v <= 55) {
    // 0 – 55: Green
    return {
      colorName: 'green',
      bgHex: '#16a34a', // vibrant green
      textColor: '#ffffff',
      subTextColor: '#dcfce7',
      badgeBgHex: '#15803d',
      badgeTextColor: '#ffffff',
      badgeBorderHex: '#22c55e',
      band: 'Normal',
    };
  } else if (v <= 150) {
    // 56 – 150: Yellow
    return {
      colorName: 'yellow',
      bgHex: '#facc15', // vibrant yellow
      textColor: '#0f172a', // high contrast black
      subTextColor: '#334155',
      badgeBgHex: '#eab308',
      badgeTextColor: '#451a03',
      badgeBorderHex: '#ca8a04',
      band: 'Elevated',
    };
  } else if (v < 250) {
    // 151 – 250: Orange
    return {
      colorName: 'orange',
      bgHex: '#ea580c', // vibrant orange
      textColor: '#ffffff',
      subTextColor: '#ffedd5',
      badgeBgHex: '#c2410c',
      badgeTextColor: '#ffffff',
      badgeBorderHex: '#f97316',
      band: 'High',
    };
  } else {
    // 250 and above: Red
    return {
      colorName: 'red',
      bgHex: '#dc2626', // vibrant red
      textColor: '#ffffff',
      subTextColor: '#fee2e2',
      badgeBgHex: '#b91c1c',
      badgeTextColor: '#ffffff',
      badgeBorderHex: '#ef4444',
      band: 'Very High',
    };
  }
}

/**
 * 24-Hour PSI Background Color Code:
 * 0 – 50: Green
 * 51 – 100: Blue
 * 101 – 200: Yellow
 * 201 – 300: Orange
 * 300 above: Red
 */
export function getPSIReadingTheme(val: number | null | undefined): ReadingCellTheme {
  if (val === null || val === undefined || isNaN(val) || val < 0) {
    return {
      colorName: 'gray',
      bgHex: '#f1f5f9',
      textColor: '#475569',
      subTextColor: '#64748b',
      badgeBgHex: '#e2e8f0',
      badgeTextColor: '#334155',
      badgeBorderHex: '#cbd5e1',
      band: 'Unavailable',
    };
  }

  const v = Math.round(val);
  if (v <= 50) {
    // 0 – 50: Green
    return {
      colorName: 'green',
      bgHex: '#16a34a', // vibrant green
      textColor: '#ffffff',
      subTextColor: '#dcfce7',
      badgeBgHex: '#15803d',
      badgeTextColor: '#ffffff',
      badgeBorderHex: '#22c55e',
      band: 'Good',
    };
  } else if (v <= 100) {
    // 51 – 100: Blue
    return {
      colorName: 'blue',
      bgHex: '#2563eb', // vibrant blue
      textColor: '#ffffff',
      subTextColor: '#dbeafe',
      badgeBgHex: '#1d4ed8',
      badgeTextColor: '#ffffff',
      badgeBorderHex: '#3b82f6',
      band: 'Moderate',
    };
  } else if (v <= 200) {
    // 101 – 200: Yellow
    return {
      colorName: 'yellow',
      bgHex: '#facc15', // vibrant yellow
      textColor: '#0f172a', // high contrast black
      subTextColor: '#334155',
      badgeBgHex: '#eab308',
      badgeTextColor: '#451a03',
      badgeBorderHex: '#ca8a04',
      band: 'Unhealthy',
    };
  } else if (v <= 300) {
    // 201 – 300: Orange
    return {
      colorName: 'orange',
      bgHex: '#ea580c', // vibrant orange
      textColor: '#ffffff',
      subTextColor: '#ffedd5',
      badgeBgHex: '#c2410c',
      badgeTextColor: '#ffffff',
      badgeBorderHex: '#f97316',
      band: 'Very Unhealthy',
    };
  } else {
    // 300 above: Red
    return {
      colorName: 'red',
      bgHex: '#dc2626', // vibrant red
      textColor: '#ffffff',
      subTextColor: '#fee2e2',
      badgeBgHex: '#b91c1c',
      badgeTextColor: '#ffffff',
      badgeBorderHex: '#ef4444',
      band: 'Hazardous',
    };
  }
}

/**
 * Format timestamps nicely in Singapore time
 */
export function formatSingaporeTime(date: Date = new Date()): {
  dateString: string;
  timeString: string;
  fullString: string;
  hour: number;
} {
  const optionsDate: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Singapore',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  const optionsTime: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const datePart = new Intl.DateTimeFormat('en-GB', optionsDate).format(date);
  const timePart = new Intl.DateTimeFormat('en-GB', optionsTime).format(date);

  const hourSingapore = parseInt(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Singapore',
      hour: 'numeric',
      hour12: false,
    }).format(date),
    10
  );

  return {
    dateString: datePart,
    timeString: timePart,
    fullString: `${datePart} · ${timePart} SGT`,
    hour: hourSingapore,
  };
}

export function formatReadingTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return 'Unavailable';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Unavailable';
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Singapore',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return 'Unavailable';
  }
}

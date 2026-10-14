/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RegionKey = 'north' | 'south' | 'east' | 'west' | 'central';

export interface RegionalReading {
  key: RegionKey;
  name: string; // e.g. "North"
  pm25: number | null;
  psi: number | null;
  pm25Timestamp: string | null;
  psiTimestamp: string | null;
  pm25Classification: PM25Classification;
  psiClassification: PSIClassification;
}

export type PM25Band = 'Normal' | 'Elevated' | 'High' | 'Very High' | 'Unavailable';
export type PSIBand = 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' | 'Unavailable';

export interface ClassificationResult {
  label: string;
  category: string;
  colorName: 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'gray';
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  panelBg: string;
  dotColor: string;
  description: string;
}

export interface PM25Classification extends ClassificationResult {
  band: PM25Band;
  bandNumber?: 1 | 2 | 3 | 4;
}

export interface PSIClassification extends ClassificationResult {
  band: PSIBand;
}

export interface AirQualitySummary {
  highestPm25: {
    value: number | null;
    regionKey: RegionKey | null;
    regionName: string;
    classification: PM25Classification;
  };
  highestPsi: {
    value: number | null;
    regionKey: RegionKey | null;
    regionName: string;
    classification: PSIClassification;
  };
  overallStatus: string;
  overallColor: 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'gray';
  latestTimestamp: string | null;
  latestPsiTimestamp: string | null;
  isStale: boolean;
}

export interface NEAAdvisory {
  airQualityBlurb: string; // e.g. "24-hr PSI Forecast: Unhealthy"
  healthAdvisoryBlurb: string; // HTML or text breakdown
  boldItalicLabel: string;
  dateOfArticle: string;
}

export interface LatestAirQualityResponse {
  regions: Record<RegionKey, RegionalReading>;
  summary: AirQualitySummary;
  advisory: NEAAdvisory | null;
  retrievedAt: string;
  source: string;
  isStale: boolean;
  status: 'current' | 'delayed' | 'unavailable' | 'stale';
  error?: string;
}

export interface HistoricalReadingPoint {
  timestamp: string;
  formattedTime: string;
  north_pm25: number | null;
  south_pm25: number | null;
  east_pm25: number | null;
  west_pm25: number | null;
  central_pm25: number | null;
  north_psi: number | null;
  south_psi: number | null;
  east_psi: number | null;
  west_psi: number | null;
  central_psi: number | null;
}

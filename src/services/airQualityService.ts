/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AirQualitySummary,
  HistoricalReadingPoint,
  LatestAirQualityResponse,
  NEAAdvisory,
  RegionalReading,
  RegionKey,
} from '../types/haze';
import {
  classifyPM25,
  classifyPSI,
  REGION_KEYS,
  REGION_NAMES,
} from '../utils/classification';

const STORAGE_KEY_LATEST = 'sg_haze_latest_cache_v1';

export async function fetchLatestAirQuality(forceRefresh = false): Promise<LatestAirQualityResponse> {
  // 1. Try server proxy endpoint first
  try {
    const res = await fetch(`/api/air-quality/latest${forceRefresh ? '?force=true' : ''}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data: LatestAirQualityResponse = await res.json();
      if (data && data.regions) {
        // Cache in localStorage for offline resilience
        try {
          localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(data));
        } catch {
          // ignore storage quota errors
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Server proxy fetch failed, falling back to direct Data.gov.sg API:', err);
  }

  // 2. Fallback: Direct call to official Data.gov.sg endpoints
  try {
    const [pm25Res, psiRes] = await Promise.allSettled([
      fetch('https://api-open.data.gov.sg/v2/real-time/api/pm25').then((r) => r.json()),
      fetch('https://api-open.data.gov.sg/v2/real-time/api/psi').then((r) => r.json()),
    ]);

    const pm25Json = pm25Res.status === 'fulfilled' ? pm25Res.value : null;
    const psiJson = psiRes.status === 'fulfilled' ? psiRes.value : null;

    const pm25Item = pm25Json?.data?.items?.[0] || null;
    const psiItem = psiJson?.data?.items?.[0] || null;

    const pm25Readings = pm25Item?.readings?.pm25_one_hourly || {};
    const psiReadings = psiItem?.readings?.psi_twenty_four_hourly || {};

    const pm25Timestamp = pm25Item?.updatedTimestamp || pm25Item?.timestamp || null;
    const psiTimestamp = psiItem?.updatedTimestamp || psiItem?.timestamp || null;

    const regions = {} as Record<RegionKey, RegionalReading>;

    let maxPm25Val: number | null = null;
    let maxPm25Region: RegionKey | null = null;
    let maxPsiVal: number | null = null;
    let maxPsiRegion: RegionKey | null = null;

    for (const key of REGION_KEYS) {
      const pmVal = typeof pm25Readings[key] === 'number' ? pm25Readings[key] : null;
      const psiVal = typeof psiReadings[key] === 'number' ? psiReadings[key] : null;

      const pmClass = classifyPM25(pmVal);
      const psiClass = classifyPSI(psiVal);

      regions[key] = {
        key,
        name: REGION_NAMES[key],
        pm25: pmVal,
        psi: psiVal,
        pm25Timestamp,
        psiTimestamp,
        pm25Classification: pmClass,
        psiClassification: psiClass,
      };

      if (pmVal !== null) {
        if (maxPm25Val === null || pmVal > maxPm25Val) {
          maxPm25Val = pmVal;
          maxPm25Region = key;
        }
      }

      if (psiVal !== null) {
        if (maxPsiVal === null || psiVal > maxPsiVal) {
          maxPsiVal = psiVal;
          maxPsiRegion = key;
        }
      }
    }

    const maxPmClass = classifyPM25(maxPm25Val);
    const maxPsiClass = classifyPSI(maxPsiVal);

    let overallStatus = 'Normal';
    let overallColor: 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'gray' = 'green';

    if (maxPmClass.colorName === 'red' || maxPsiClass.colorName === 'red') {
      overallStatus = 'Very High / Hazardous';
      overallColor = 'red';
    } else if (maxPmClass.colorName === 'orange' || maxPsiClass.colorName === 'orange') {
      overallStatus = 'High / Very Unhealthy';
      overallColor = 'orange';
    } else if (maxPmClass.colorName === 'yellow' || maxPsiClass.colorName === 'yellow') {
      overallStatus = 'Elevated / Unhealthy';
      overallColor = 'yellow';
    } else if (maxPsiClass.colorName === 'blue') {
      overallStatus = 'Moderate';
      overallColor = 'blue';
    } else if (maxPmClass.colorName === 'green' && maxPsiClass.colorName === 'green') {
      overallStatus = 'Good / Normal';
      overallColor = 'green';
    }

    const summary: AirQualitySummary = {
      highestPm25: {
        value: maxPm25Val,
        regionKey: maxPm25Region,
        regionName: maxPm25Region ? REGION_NAMES[maxPm25Region] : 'Unavailable',
        classification: maxPmClass,
      },
      highestPsi: {
        value: maxPsiVal,
        regionKey: maxPsiRegion,
        regionName: maxPsiRegion ? REGION_NAMES[maxPsiRegion] : 'Unavailable',
        classification: maxPsiClass,
      },
      overallStatus,
      overallColor,
      latestTimestamp: pm25Timestamp || psiTimestamp,
      latestPsiTimestamp: psiTimestamp,
      isStale: false,
    };

    const directResult: LatestAirQualityResponse = {
      regions,
      summary,
      advisory: {
        airQualityBlurb: '24-hr PSI Forecast: Refer to official NEA advisory',
        healthAdvisoryBlurb: 'Check 1-hr PM2.5 for immediate outdoor activities, and 24-hr PSI for planning ahead.',
        boldItalicLabel: 'Refer to the 1-hr PM2.5 for immediate activities, and the 24-hr PSI forecast to plan ahead.',
        dateOfArticle: pm25Timestamp || new Date().toISOString(),
      },
      retrievedAt: new Date().toISOString(),
      source: 'Data.gov.sg (National Environment Agency)',
      isStale: false,
      status: 'current',
    };

    try {
      localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(directResult));
    } catch {
      // ignore
    }

    return directResult;
  } catch (directErr) {
    console.error('All live data retrieval attempts failed:', directErr);
    // 3. Last fallback: Retrieve cached data from localStorage and label as stale
    try {
      const cachedStr = localStorage.getItem(STORAGE_KEY_LATEST);
      if (cachedStr) {
        const cachedData = JSON.parse(cachedStr) as LatestAirQualityResponse;
        return {
          ...cachedData,
          isStale: true,
          status: 'stale',
          error: 'Network error: could not connect to official NEA servers. Displaying last successfully retrieved data.',
        };
      }
    } catch {
      // ignore
    }

    throw new Error('Air quality readings currently unavailable. Please check your network connection.');
  }
}

export async function fetchHistoricalAirQuality(): Promise<HistoricalReadingPoint[]> {
  try {
    const res = await fetch('/api/air-quality/history');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.points)) {
        return data.points;
      }
    }
  } catch (err) {
    console.warn('Failed to load history from server proxy, falling back to direct query:', err);
  }

  // Fallback direct
  try {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Singapore',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const [pmRes, psiRes] = await Promise.allSettled([
      fetch(`https://api-open.data.gov.sg/v2/real-time/api/pm25?date=${today}`).then((r) => r.json()),
      fetch(`https://api-open.data.gov.sg/v2/real-time/api/psi?date=${today}`).then((r) => r.json()),
    ]);

    const pmItems = pmRes.status === 'fulfilled' ? pmRes.value?.data?.items || [] : [];
    const psiItems = psiRes.status === 'fulfilled' ? psiRes.value?.data?.items || [] : [];

    const map = new Map<string, any>();

    for (const item of pmItems) {
      const ts = item.timestamp;
      if (!ts) continue;
      const r = item.readings?.pm25_one_hourly || {};
      const obj = map.get(ts) || { timestamp: ts };
      obj.north_pm25 = r.north ?? null;
      obj.south_pm25 = r.south ?? null;
      obj.east_pm25 = r.east ?? null;
      obj.west_pm25 = r.west ?? null;
      obj.central_pm25 = r.central ?? null;
      map.set(ts, obj);
    }

    for (const item of psiItems) {
      const ts = item.timestamp;
      if (!ts) continue;
      const r = item.readings?.psi_twenty_four_hourly || {};
      const obj = map.get(ts) || { timestamp: ts };
      obj.north_psi = r.north ?? null;
      obj.south_psi = r.south ?? null;
      obj.east_psi = r.east ?? null;
      obj.west_psi = r.west ?? null;
      obj.central_psi = r.central ?? null;
      map.set(ts, obj);
    }

    const sorted = Array.from(map.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return sorted.map((p) => {
      const d = new Date(p.timestamp);
      return {
        ...p,
        formattedTime: new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(d),
      };
    });
  } catch (e) {
    console.error('Error fetching direct historical data:', e);
    return [];
  }
}

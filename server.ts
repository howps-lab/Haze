/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-memory cache for live readings and advisory
interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

let latestCache: CacheEntry<any> | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache to protect upstream APIs

let historyCache: CacheEntry<any> | null = null;
const HISTORY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minute cache for historical trends

// Region mapping
const REGION_KEYS = ['north', 'south', 'east', 'west', 'central'] as const;
type RegionKey = (typeof REGION_KEYS)[number];

const REGION_LABELS: Record<RegionKey, string> = {
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
  central: 'Central',
};

// PM2.5 classification helper for summary computation
function getPM25Classification(val: number | null | undefined) {
  if (val === null || val === undefined || isNaN(val) || val < 0) {
    return { band: 'Unavailable', colorName: 'gray', label: 'Unavailable' };
  }
  const v = Math.round(val);
  if (v <= 55) return { band: 'Normal', colorName: 'green', label: 'Normal (0–55)' };
  if (v <= 150) return { band: 'Elevated', colorName: 'yellow', label: 'Elevated (56–150)' };
  if (v < 250) return { band: 'High', colorName: 'orange', label: 'High (151–250)' };
  return { band: 'Very High', colorName: 'red', label: 'Very High (250+)' };
}

// PSI classification helper for summary computation
function getPSIClassification(val: number | null | undefined) {
  if (val === null || val === undefined || isNaN(val) || val < 0) {
    return { band: 'Unavailable', colorName: 'gray', label: 'Unavailable' };
  }
  const v = Math.round(val);
  if (v <= 50) return { band: 'Good', colorName: 'green', label: 'Good' };
  if (v <= 100) return { band: 'Moderate', colorName: 'blue', label: 'Moderate' };
  if (v <= 200) return { band: 'Unhealthy', colorName: 'yellow', label: 'Unhealthy' };
  if (v <= 300) return { band: 'Very Unhealthy', colorName: 'orange', label: 'Very Unhealthy' };
  return { band: 'Hazardous', colorName: 'red', label: 'Hazardous' };
}

async function fetchWithTimeout(url: string, timeoutMs = 8000, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SingaporeHazeMonitor/1.0',
        Accept: 'application/json, text/plain, */*',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Fetch advisory from NEA website API
async function fetchNEAAdvisory() {
  try {
    const res = await fetchWithTimeout(
      'https://www.nea.gov.sg/api/advisory/latesthazesituationupdate/',
      6000
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      airQualityBlurb: data.AirQualityBlurb || '24-hr PSI Forecast: Not available',
      healthAdvisoryBlurb: data.HealthAdvisoryBlurb || '',
      boldItalicLabel: data.BoldItalicLabel || 'Refer to the 1-hr PM2.5 for immediate activities, and the 24-hr PSI forecast to plan ahead.',
      dateOfArticle: data.DateOfArticle || '',
    };
  } catch (e) {
    console.warn('Failed to retrieve NEA advisory:', e instanceof Error ? e.message : e);
    return null;
  }
}

// Helper: format YYYY-MM-DD in Singapore time
function getSingaporeDateString(offsetDays = 0): string {
  const now = new Date(Date.now() + offsetDays * 86400000);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

// /api/air-quality/latest
app.get('/api/air-quality/latest', async (req, res) => {
  const force = req.query.force === 'true';
  const now = Date.now();

  if (!force && latestCache && now - latestCache.cachedAt < CACHE_TTL_MS) {
    return res.json({
      ...latestCache.data,
      isStale: false,
      retrievedAt: new Date(latestCache.cachedAt).toISOString(),
    });
  }

  try {
    const [pm25Res, psiRes, advisoryData] = await Promise.allSettled([
      fetchWithTimeout('https://api-open.data.gov.sg/v2/real-time/api/pm25', 8000).then((r) => r.json()),
      fetchWithTimeout('https://api-open.data.gov.sg/v2/real-time/api/psi', 8000).then((r) => r.json()),
      fetchNEAAdvisory(),
    ]);

    const pm25Json = pm25Res.status === 'fulfilled' ? pm25Res.value : null;
    const psiJson = psiRes.status === 'fulfilled' ? psiRes.value : null;
    const advisory = advisoryData.status === 'fulfilled' ? advisoryData.value : null;

    if (!pm25Json && !psiJson && latestCache) {
      // Both failed, return previous cached data marked as stale
      return res.json({
        ...latestCache.data,
        isStale: true,
        status: 'stale',
      });
    }

    const pm25Item = pm25Json?.data?.items?.[0] || null;
    const psiItem = psiJson?.data?.items?.[0] || null;

    const pm25Readings = pm25Item?.readings?.pm25_one_hourly || {};
    const psiReadings = psiItem?.readings?.psi_twenty_four_hourly || {};

    const pm25Timestamp = pm25Item?.updatedTimestamp || pm25Item?.timestamp || null;
    const psiTimestamp = psiItem?.updatedTimestamp || psiItem?.timestamp || null;

    const regions: Record<string, any> = {};

    let maxPm25Val: number | null = null;
    let maxPm25Region: RegionKey | null = null;
    let maxPsiVal: number | null = null;
    let maxPsiRegion: RegionKey | null = null;

    for (const key of REGION_KEYS) {
      const pmVal = typeof pm25Readings[key] === 'number' ? pm25Readings[key] : null;
      const psiVal = typeof psiReadings[key] === 'number' ? psiReadings[key] : null;

      const pmClass = getPM25Classification(pmVal);
      const psiClass = getPSIClassification(psiVal);

      regions[key] = {
        key,
        name: REGION_LABELS[key],
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

    // Determine overall status based on highest severity
    let overallStatus = 'Normal';
    let overallColor: 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'gray' = 'green';

    const maxPmClass = getPM25Classification(maxPm25Val);
    const maxPsiClass = getPSIClassification(maxPsiVal);

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
    } else {
      overallStatus = 'Data Pending';
      overallColor = 'gray';
    }

    const payload = {
      regions,
      summary: {
        highestPm25: {
          value: maxPm25Val,
          regionKey: maxPm25Region,
          regionName: maxPm25Region ? REGION_LABELS[maxPm25Region] : 'Unavailable',
          classification: maxPmClass,
        },
        highestPsi: {
          value: maxPsiVal,
          regionKey: maxPsiRegion,
          regionName: maxPsiRegion ? REGION_LABELS[maxPsiRegion] : 'Unavailable',
          classification: maxPsiClass,
        },
        overallStatus,
        overallColor,
        latestTimestamp: pm25Timestamp || psiTimestamp,
        latestPsiTimestamp: psiTimestamp,
        isStale: false,
      },
      advisory,
      retrievedAt: new Date().toISOString(),
      source: 'National Environment Agency (NEA) & Data.gov.sg',
      isStale: false,
      status: 'current',
    };

    latestCache = {
      data: payload,
      cachedAt: now,
    };

    return res.json(payload);
  } catch (error) {
    console.error('Error fetching latest air quality data:', error);
    if (latestCache) {
      return res.json({
        ...latestCache.data,
        isStale: true,
        status: 'stale',
        error: 'Live upstream fetch failed; displaying last known readings.',
      });
    }
    return res.status(502).json({
      error: 'Failed to retrieve air quality data from official sources.',
      status: 'unavailable',
    });
  }
});

// /api/air-quality/history
app.get('/api/air-quality/history', async (req, res) => {
  const force = req.query.force === 'true';
  const now = Date.now();

  if (!force && historyCache && now - historyCache.cachedAt < HISTORY_CACHE_TTL_MS) {
    return res.json(historyCache.data);
  }

  try {
    const todayStr = getSingaporeDateString(0);
    const yesterdayStr = getSingaporeDateString(-1);

    const [pm25Today, pm25Yesterday, psiToday, psiYesterday] = await Promise.allSettled([
      fetchWithTimeout(`https://api-open.data.gov.sg/v2/real-time/api/pm25?date=${todayStr}`, 8000).then((r) => r.json()),
      fetchWithTimeout(`https://api-open.data.gov.sg/v2/real-time/api/pm25?date=${yesterdayStr}`, 8000).then((r) => r.json()),
      fetchWithTimeout(`https://api-open.data.gov.sg/v2/real-time/api/psi?date=${todayStr}`, 8000).then((r) => r.json()),
      fetchWithTimeout(`https://api-open.data.gov.sg/v2/real-time/api/psi?date=${yesterdayStr}`, 8000).then((r) => r.json()),
    ]);

    // Combine PM2.5 items
    const pmItems: any[] = [];
    if (pm25Yesterday.status === 'fulfilled' && pm25Yesterday.value?.data?.items) {
      pmItems.push(...pm25Yesterday.value.data.items);
    }
    if (pm25Today.status === 'fulfilled' && pm25Today.value?.data?.items) {
      pmItems.push(...pm25Today.value.data.items);
    }

    // Combine PSI items
    const psiItems: any[] = [];
    if (psiYesterday.status === 'fulfilled' && psiYesterday.value?.data?.items) {
      psiItems.push(...psiYesterday.value.data.items);
    }
    if (psiToday.status === 'fulfilled' && psiToday.value?.data?.items) {
      psiItems.push(...psiToday.value.data.items);
    }

    // Map by timestamp
    const timeMap = new Map<string, any>();

    for (const item of pmItems) {
      const ts = item.timestamp;
      if (!ts) continue;
      const existing = timeMap.get(ts) || { timestamp: ts };
      const readings = item.readings?.pm25_one_hourly || {};
      existing.north_pm25 = readings.north ?? null;
      existing.south_pm25 = readings.south ?? null;
      existing.east_pm25 = readings.east ?? null;
      existing.west_pm25 = readings.west ?? null;
      existing.central_pm25 = readings.central ?? null;
      timeMap.set(ts, existing);
    }

    for (const item of psiItems) {
      const ts = item.timestamp;
      if (!ts) continue;
      const existing = timeMap.get(ts) || { timestamp: ts };
      const readings = item.readings?.psi_twenty_four_hourly || {};
      existing.north_psi = readings.north ?? null;
      existing.south_psi = readings.south ?? null;
      existing.east_psi = readings.east ?? null;
      existing.west_psi = readings.west ?? null;
      existing.central_psi = readings.central ?? null;
      timeMap.set(ts, existing);
    }

    // Sort chronologically ascending
    const sorted = Array.from(timeMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Format timestamps for chart labels (SGT)
    const formatted = sorted.map((p) => {
      const d = new Date(p.timestamp);
      const timeLabel = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Singapore',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);
      return {
        ...p,
        formattedTime: timeLabel,
      };
    });

    const result = {
      points: formatted,
      retrievedAt: new Date().toISOString(),
    };

    historyCache = {
      data: result,
      cachedAt: now,
    };

    return res.json(result);
  } catch (err) {
    console.error('Error fetching historical data:', err);
    if (historyCache) {
      return res.json(historyCache.data);
    }
    return res.status(502).json({ error: 'Failed to retrieve historical readings', points: [] });
  }
});

// Advisory endpoint
app.get('/api/air-quality/advisory', async (req, res) => {
  const advisory = await fetchNEAAdvisory();
  res.json({ advisory });
});

// Setup dev vs production
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Singapore Haze Monitor server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Server startup error:', err);
});

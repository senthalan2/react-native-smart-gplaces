import { Cache } from '../utils/cache';
import { type TimeZoneOptions, type TimeZoneResult } from '../types';

const TIMEZONE_BASE_URL = 'https://maps.googleapis.com/maps/api/timezone/json';

// Rounds to 4 decimal places (~11m precision) — more than enough for timezone resolution
const COORD_PRECISION = 4;

// Aborts the previous in-flight request when a new one is made
let pendingController: AbortController | null = null;

const buildCacheKey = (lat: number, lng: number, language?: string): string =>
  `tz:${lat.toFixed(COORD_PRECISION)},${lng.toFixed(COORD_PRECISION)}${language ? `:${language}` : ''}`;

export const fetchTimeZone = async (
  latitude: number,
  longitude: number,
  options: TimeZoneOptions,
  signal?: AbortSignal
): Promise<TimeZoneResult> => {
  // Return cached result immediately — zero API cost for repeated coordinates
  const cacheKey = buildCacheKey(latitude, longitude, options.language);
  if (options.enableCache !== false) {
    const cached = Cache.get(cacheKey) as TimeZoneResult | undefined;
    if (cached) return cached;
  }

  // Cancel any in-flight timezone request before starting a new one
  pendingController?.abort();
  const controller = new AbortController();
  pendingController = controller;

  // Propagate the caller's external signal into our controller
  signal?.addEventListener('abort', () => controller.abort(), { once: true });

  const timestamp = options.timestamp ?? Math.floor(Date.now() / 1000);

  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    timestamp: String(timestamp),
    key: options.apiKey,
  });

  if (options.language) params.set('language', options.language);

  const url = `${options.proxyUrl ?? TIMEZONE_BASE_URL}?${params.toString()}`;

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      throw new Error(`Timezone API request failed with status ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== 'OK') {
      throw new Error(data.errorMessage ?? `Timezone API error: ${data.status}`);
    }

    const result: TimeZoneResult = {
      timeZoneId: data.timeZoneId,
      timeZoneName: data.timeZoneName,
      dstOffset: data.dstOffset,
      rawOffset: data.rawOffset,
      utcOffset: data.rawOffset + data.dstOffset,
      originalData: data,
    };

    if (options.enableCache !== false) {
      Cache.set(cacheKey, result);
    }

    return result;
  } finally {
    // Clear the reference so it doesn't hold stale state after completion
    if (pendingController === controller) pendingController = null;
  }
};

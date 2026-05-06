import { type TimeZoneOptions, type TimeZoneResult } from '../types';

const TIMEZONE_BASE_URL = 'https://maps.googleapis.com/maps/api/timezone/json';

export const fetchTimeZone = async (
  latitude: number,
  longitude: number,
  options: TimeZoneOptions,
  signal?: AbortSignal
): Promise<TimeZoneResult> => {
  const timestamp = options.timestamp ?? Math.floor(Date.now() / 1000);

  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    timestamp: String(timestamp),
    key: options.apiKey,
  });

  if (options.language) params.set('language', options.language);

  const url = `${options.proxyUrl ?? TIMEZONE_BASE_URL}?${params.toString()}`;

  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error(`Timezone API request failed with status ${res.status}`);
  }

  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(data.errorMessage ?? `Timezone API error: ${data.status}`);
  }

  return {
    timeZoneId: data.timeZoneId,
    timeZoneName: data.timeZoneName,
    dstOffset: data.dstOffset,
    rawOffset: data.rawOffset,
    utcOffset: data.rawOffset + data.dstOffset,
    originalData: data,
  };
};

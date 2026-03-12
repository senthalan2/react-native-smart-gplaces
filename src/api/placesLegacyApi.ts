import {
  type PlacePrediction,
  type PlaceDetails,
  type PlacesHookOptions,
} from '../types';

export const fetchLegacyAutocomplete = async (
  query: string,
  apiKey: string,
  sessionToken: string,
  signal: AbortSignal,
  options: PlacesHookOptions
): Promise<PlacePrediction[]> => {
  const params = new URLSearchParams({
    input: query,
    key: apiKey,
    sessiontoken: sessionToken,
  });

  if (options.language) params.append('language', options.language);
  if (options.region) params.append('region', options.region);
  if (options.offset) params.append('offset', options.offset.toString());
  if (options.origin)
    params.append(
      'origin',
      `${options.origin.latitude},${options.origin.longitude}`
    );

  if (options.types) {
    const typesStr = Array.isArray(options.types)
      ? options.types.join('|')
      : options.types;
    params.append('types', typesStr);
  }

  // Legacy API maps Countries to `components=country:US|country:PR` (Max 5)
  if (options.countries) {
    const codes = Array.isArray(options.countries)
      ? options.countries
      : [options.countries];
    params.append(
      'components',
      codes.map((c) => `country:${c.toLowerCase()}`).join('|')
    );
  }

  // Location Rules
  if (options.locationRestriction) {
    params.append(
      'location',
      `${options.locationRestriction.latitude},${options.locationRestriction.longitude}`
    );
    params.append('radius', (options.locationRadius || 50000).toString());
    params.append('strictbounds', 'true'); // 🔥 Legacy API Hard Limit
  } else if (options.currentLocation) {
    params.append(
      'location',
      `${options.currentLocation.latitude},${options.currentLocation.longitude}`
    );
    params.append('radius', (options.locationRadius || 50000).toString());
  } else if (options.locationBias) {
    params.append('location', options.locationBias);
    if (options.radius) params.append('radius', options.radius.toString());
  }

  const baseUrl =
    options.autocompleteProxyUrl ||
    'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  const res = await fetch(`${baseUrl}?${params.toString()}`, { signal });
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS')
    throw new Error(data.error_message || data.status);

  return data.predictions.map((p: Record<string, any>) => ({
    placeId: p.place_id,
    description: p.description,
    primaryText: p.structured_formatting?.main_text || p.description,
    secondaryText: p.structured_formatting?.secondary_text || '',
    distanceMeters: p.distance_meters, // Present if origin was passed
    types: p.types,
    originalData: p,
  }));
};

export const fetchLegacyDetails = async (
  placeId: string,
  apiKey: string,
  sessionToken: string,
  options: PlacesHookOptions
): Promise<PlaceDetails> => {
  const defaultFields =
    'place_id,name,formatted_address,geometry,formatted_phone_number,international_phone_number,opening_hours,photos,website,rating,user_ratings_total,address_components,types';
  const fieldsStr = options.detailsFields
    ? Array.isArray(options.detailsFields)
      ? options.detailsFields.join(',')
      : options.detailsFields
    : defaultFields;

  const params = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    sessiontoken: sessionToken,
    fields: fieldsStr,
  });

  if (options.language) params.append('language', options.language);
  if (options.region) params.append('region', options.region);
  if (options.reviewsNoTranslations)
    params.append('reviews_no_translations', 'true');
  if (options.reviewsSort) params.append('reviews_sort', options.reviewsSort);

  const baseUrl =
    options.detailsProxyUrl ||
    'https://maps.googleapis.com/maps/api/place/details/json';
  const res = await fetch(`${baseUrl}?${params.toString()}`);
  const data = await res.json();

  if (data.status !== 'OK') throw new Error(data.error_message || data.status);

  const d = data.result;
  return {
    placeId: d.place_id || placeId,
    name: d.name,
    address: d.formatted_address,
    latitude: d.geometry?.location?.lat,
    longitude: d.geometry?.location?.lng,
    phoneNumber: d.formatted_phone_number,
    internationalPhoneNumber: d.international_phone_number,
    openingHours: d.opening_hours?.weekday_text,
    photos: d.photos,
    website: d.website,
    rating: d.rating,
    userRatingsTotal: d.user_ratings_total,
    addressComponents: d.address_components,
    types: d.types,
    originalData: d,
  };
};

import {
  type PlacePrediction,
  type PlaceDetails,
  type PlacesHookOptions,
} from '../types';

export const fetchNewAutocomplete = async (
  query: string,
  apiKey: string,
  sessionToken: string,
  signal: AbortSignal,
  options: PlacesHookOptions
): Promise<PlacePrediction[]> => {
  const body: Record<string, any> = { input: query, sessionToken };

  if (options.language) body.languageCode = options.language;
  if (options.region) body.regionCode = options.region;
  if (options.offset) body.inputOffset = options.offset; // 🔥 New API uses inputOffset
  if (options.origin)
    body.origin = {
      latitude: options.origin.latitude,
      longitude: options.origin.longitude,
    };

  if (options.types) {
    body.includedPrimaryTypes = Array.isArray(options.types)
      ? options.types
      : [options.types];
  }

  // New API maps Countries to `includedRegionCodes` (Max 15)
  if (options.countries) {
    const codes = Array.isArray(options.countries)
      ? options.countries
      : [options.countries];
    body.includedRegionCodes = codes.map((c) => c.toUpperCase());
  }

  // Location Biasing (Soft Limit)
  if (options.currentLocation) {
    body.locationBias = {
      circle: {
        center: {
          latitude: options.currentLocation.latitude,
          longitude: options.currentLocation.longitude,
        },
        radius: options.locationRadius || 50000.0,
      },
    };
  }

  // Location Restriction (Hard Limit)
  if (options.locationRestriction) {
    body.locationRestriction = {
      circle: {
        center: {
          latitude: options.locationRestriction.latitude,
          longitude: options.locationRestriction.longitude,
        },
        radius: options.locationRadius || 50000.0,
      },
    };
  }

  const baseUrl =
    options.autocompleteProxyUrl ||
    'https://places.googleapis.com/v1/places:autocomplete';
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },
    body: JSON.stringify(body),
    signal,
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return (data.suggestions || []).map((p: Record<string, any>) => ({
    placeId: p.placePrediction.placeId,
    description: p.placePrediction.text.text,
    primaryText:
      p.placePrediction.structuredFormat?.mainText?.text ||
      p.placePrediction.text.text,
    secondaryText:
      p.placePrediction.structuredFormat?.secondaryText?.text || '',
    distanceMeters: p.placePrediction.distanceMeters,
    types: p.placePrediction.types,
    originalData: p,
  }));
};

export const fetchNewDetails = async (
  placeId: string,
  apiKey: string,
  sessionToken: string,
  options: PlacesHookOptions
): Promise<PlaceDetails> => {
  const defaultFieldMask =
    'id,displayName,formattedAddress,location,nationalPhoneNumber,internationalPhoneNumber,regularOpeningHours,photos,websiteUri,rating,userRatingCount,addressComponents,types';
  const fieldMask = options.detailsFields
    ? Array.isArray(options.detailsFields)
      ? options.detailsFields.join(',')
      : options.detailsFields
    : defaultFieldMask;

  const headers = { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': fieldMask };
  let baseUrl =
    options.detailsProxyUrl ||
    `https://places.googleapis.com/v1/places/${placeId}`;

  // New API passes language/region as URL query params on the GET request
  const params = new URLSearchParams({ sessionToken });
  if (options.language) params.append('languageCode', options.language);
  if (options.region) params.append('regionCode', options.region);

  const res = await fetch(`${baseUrl}?${params.toString()}`, { headers });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return {
    placeId: data.id,
    name: data.displayName?.text,
    address: data.formattedAddress,
    latitude: data.location?.latitude,
    longitude: data.location?.longitude,
    phoneNumber: data.nationalPhoneNumber,
    internationalPhoneNumber: data.internationalPhoneNumber,
    openingHours: data.regularOpeningHours?.weekdayDescriptions,
    photos: data.photos,
    website: data.websiteUri,
    rating: data.rating,
    userRatingsTotal: data.userRatingCount,
    addressComponents: data.addressComponents,
    types: data.types,
    originalData: data,
  };
};

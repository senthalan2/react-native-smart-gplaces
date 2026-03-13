import { useState, useRef, useCallback, useEffect } from 'react';
import {
  type PlacePrediction,
  type PlacesHookOptions,
  type PlaceDetails,
  type UsePlacesAutocompleteReturn,
} from '../types';
import {
  fetchLegacyAutocomplete,
  fetchLegacyDetails,
} from '../api/placesLegacyApi';
import { fetchNewAutocomplete, fetchNewDetails } from '../api/placesNewApi';
import { useDebounce } from '../utils/debounce';
import { generateSessionToken } from '../utils/sessionToken';
import { Cache } from '../utils/cache';

export const usePlacesAutocomplete = (
  options: PlacesHookOptions
): UsePlacesAutocompleteReturn => {
  const getMergedOptions = (opts: PlacesHookOptions) => ({
    isNewPlaces: true,
    ...opts,
  });
  const optionsRef = useRef(getMergedOptions(options));

  useEffect(() => {
    optionsRef.current = getMergedOptions(options);
  }, [options]);

  const [query, setRawQuery] = useState('');
  const [results, setResults] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // 🔥 NEW: Tracks the exact moment between a keystroke and the debounced API firing
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionTokenRef = useRef(generateSessionToken());
  const abortControllerRef = useRef<AbortController | null>(null);
  const skipSearchRef = useRef(false);

  // Custom setter to safely control text without firing API calls unnecessarily
  const setQuery = useCallback((text: string, skipSearch = false) => {
    skipSearchRef.current = skipSearch;
    setRawQuery(text);
    if (!skipSearch) setIsTyping(true); // User is officially typing!
  }, []);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = generateSessionToken();
  }, []);

  const updateResults = useCallback((data: PlacePrediction[]) => {
    setResults(data);
    if (optionsRef.current.onListLengthChange)
      optionsRef.current.onListLengthChange(data.length);
  }, []);

  const searchPlaces = useCallback(
    async (searchQuery: string) => {
      setIsTyping(false); // 🔥 Debounce finished. We are no longer "typing", we are "fetching".

      const currentOptions = optionsRef.current;

      if (searchQuery.length < (currentOptions.minLength || 2)) {
        updateResults([]);
        return;
      }

      const coordsStr = currentOptions.currentLocation
        ? `${currentOptions.currentLocation.latitude},${currentOptions.currentLocation.longitude}`
        : 'none';
      const cacheKey = `${currentOptions.isNewPlaces ? 'new' : 'legacy'}_${coordsStr}_${searchQuery}`;

      if (currentOptions.enableCache ?? true) {
        const cached = Cache.get(cacheKey);
        if (cached) {
          if (currentOptions.onDataLoaded) currentOptions.onDataLoaded(cached);
          updateResults(cached);
          return;
        }
      }

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      if (currentOptions.onLoaderStart) currentOptions.onLoaderStart();
      setLoading(true);
      setError(null);

      try {
        const fetcher = currentOptions.isNewPlaces
          ? fetchNewAutocomplete
          : fetchLegacyAutocomplete;
        const data = await fetcher(
          searchQuery,
          currentOptions.apiKey,
          sessionTokenRef.current,
          abortControllerRef.current.signal,
          currentOptions
        );

        if (currentOptions.enableCache ?? true) Cache.set(cacheKey, data);
        if (currentOptions.onDataLoaded) currentOptions.onDataLoaded(data);
        updateResults(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          const errMsg = err.message || 'Error fetching places';
          setError(errMsg);
          if (currentOptions.onError) currentOptions.onError(errMsg);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          if (currentOptions.onLoaderEnd) currentOptions.onLoaderEnd();
          setLoading(false);
        }
      }
    },
    [updateResults]
  );

  const debouncedSearch = useDebounce(searchPlaces, options.debounce || 400);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const fetchPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
    const currentOptions = optionsRef.current;
    try {
      setFetchingDetails(true);
      if (currentOptions.onStartFetchingDetails)
        currentOptions.onStartFetchingDetails(placeId);

      const fetcher = currentOptions.isNewPlaces
        ? fetchNewDetails
        : fetchLegacyDetails;
      const details = await fetcher(
        placeId,
        currentOptions.apiKey,
        sessionTokenRef.current,
        currentOptions
      );

      resetSession();
      return details;
    } catch (err: any) {
      const errMsg = err.message || 'Error fetching details';
      setError(errMsg);
      if (currentOptions.onErrorFetchingDetails)
        currentOptions.onErrorFetchingDetails(errMsg);
      throw err;
    } finally {
      setFetchingDetails(false);
    }
  };

  return {
    query,
    setQuery,
    results,
    loading,
    fetchingDetails,
    isTyping,
    error,
    fetchPlaceDetails,
    clearResults: () => updateResults([]),
    resetSession,
    getSessionToken: () => sessionTokenRef.current,
  };
};

import { useState, useRef, useCallback, useEffect } from 'react';
import { type PlacePrediction, type PlacesHookOptions, type PlaceDetails, type UsePlacesAutocompleteReturn } from '../types';
import { fetchLegacyAutocomplete, fetchLegacyDetails } from '../api/placesLegacyApi';
import { fetchNewAutocomplete, fetchNewDetails } from '../api/placesNewApi';
import { useDebounce } from '../utils/debounce';
import { generateSessionToken } from '../utils/sessionToken';
import { Cache } from '../utils/cache';

export const usePlacesAutocomplete = (options: PlacesHookOptions):UsePlacesAutocompleteReturn => {
  const { 
    apiKey, isNewPlaces = false, debounce = 400, minLength = 2, enableCache = true,
    onLoaderStart, onLoaderEnd, onDataLoaded, onListLengthChange, onError
  } = options;
  
  const [query, setQuery] = useState('');
  const[results, setResults] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionTokenRef = useRef(generateSessionToken());
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = generateSessionToken();
  },[]);

  const updateResults = useCallback((data: PlacePrediction[]) => {
    setResults(data);
    if (onListLengthChange) onListLengthChange(data.length);
  }, [onListLengthChange]);

  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minLength) {
      updateResults([]);
      return;
    }

    const cacheKey = `${isNewPlaces ? 'new' : 'legacy'}_${searchQuery}`;
    if (enableCache) {
      const cached = Cache.get(cacheKey);
      if (cached) {
        if (onDataLoaded) onDataLoaded(cached);
        updateResults(cached);
        return;
      }
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    if (onLoaderStart) onLoaderStart();
    setLoading(true);
    setError(null);

    try {
      const fetcher = isNewPlaces ? fetchNewAutocomplete : fetchLegacyAutocomplete;
      const data = await fetcher(searchQuery, apiKey, sessionTokenRef.current, abortControllerRef.current.signal, options);
      
      if (enableCache) Cache.set(cacheKey, data);
      
      if (onDataLoaded) onDataLoaded(data);
      updateResults(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errMsg = err.message || 'Error fetching places';
        setError(errMsg);
        if (onError) onError(errMsg);
      }
    } finally {
      if (onLoaderEnd) onLoaderEnd();
      setLoading(false);
    }
  },[apiKey, isNewPlaces, minLength, enableCache, options, updateResults, onLoaderStart, onLoaderEnd, onDataLoaded, onError]);

  const debouncedSearch = useDebounce(searchPlaces, debounce);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const fetchPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
    try {
      if (onLoaderStart) onLoaderStart();
      const fetcher = isNewPlaces ? fetchNewDetails : fetchLegacyDetails;
      const details = await fetcher(placeId, apiKey, sessionTokenRef.current, options);
      resetSession(); 
      return details;
    } catch (err: any) {
      const errMsg = err.message || 'Error fetching details';
      setError(errMsg);
      if (onError) onError(errMsg);
      throw err;
    } finally {
      if (onLoaderEnd) onLoaderEnd();
    }
  };

  return { query, setQuery, results, loading, error, fetchPlaceDetails, clearResults: () => updateResults([]), resetSession };
};
import { useRef, useEffect, useCallback } from 'react';

export const useDebounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const funcRef = useRef(func);

  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        funcRef.current(...args);
      }, delay);
    },
    [delay]
  );
};

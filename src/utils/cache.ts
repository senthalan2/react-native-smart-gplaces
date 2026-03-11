const memoryCache = new Map<string, any>();

export const Cache = {
  get: (key: string) => memoryCache.get(key),
  set: (key: string, value: any) => memoryCache.set(key, value),
  clear: () => memoryCache.clear(),
};

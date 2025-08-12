// state/persist.ts
export interface PersistOptions {
  key: string;
  storage?: Storage;
  serializer?: {
    stringify: (value: any) => string;
    parse: (value: string) => any;
  };
}

export function persist<T>(
  store: { get: () => T; set: (value: T) => void },
  options: PersistOptions
) {
  const { key, storage = localStorage, serializer = JSON } = options;

  // Load initial value
  try {
    const stored = storage.getItem(key);
    if (stored) {
      store.set(serializer.parse(stored));
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error);
  }

  // Save on changes
  const originalSet = store.set;
  store.set = (value: T) => {
    originalSet(value);
    try {
      storage.setItem(key, serializer.stringify(value));
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  };

  return store;
}

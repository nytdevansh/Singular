// state/store.ts - Fixed version with proper type compatibility

import { useState } from '../reactivity/signal.js';

export interface Store<T> {
  get: () => T;
  set: (value: T | ((prev: T) => T)) => void;
}

export interface StoreOptions<T> {
  equals?: (a: T, b: T) => boolean;
}

export function createStore<T>(initialValue: T, options?: StoreOptions<T>): Store<T> {
  const [getter, setter] = useState(initialValue);
  
  return { 
    get: getter, 
    set: (value: T | ((prev: T) => T)) => {
      if (typeof value === 'function') {
        // Handle function updates
        const updateFn = value as (prev: T) => T;
        const newValue = updateFn(getter());
        setter(newValue);
      } else {
        // Handle direct value updates
        setter(value);
      }
    }
  };
}

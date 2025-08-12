// state/writable.ts - Fixed version without Signal destructuring

import { useState } from '../reactivity/signal.js';

export interface WritableStore<T> {
  subscribe: (fn: (value: T) => void) => () => void;
  set: (value: T) => void;
  update: (fn: (value: T) => T) => void;
}

export interface ReadableStore<T> {
  subscribe: (fn: (value: T) => void) => () => void;
}

export function writable<T>(initialValue: T): WritableStore<T> {
  // Use array destructuring on the returned array, not on Signal type
  const [getter, setter] = useState(initialValue);
  const subscribers = new Set<(value: T) => void>();

  return {
    subscribe: (fn: (value: T) => void) => {
      subscribers.add(fn);
      fn(getter());
      return () => subscribers.delete(fn);
    },
    set: (value: T) => {
      setter(value);
      subscribers.forEach(fn => fn(getter()));
    },
    update: (fn: (value: T) => T) => {
      const newValue = fn(getter());
      setter(newValue);
      subscribers.forEach(fn => fn(getter()));
    }
  };
}

export function readable<T>(initialValue: T, start?: (set: (value: T) => void) => () => void): ReadableStore<T> {
  const store = writable(initialValue);
  
  if (start) {
    let stop: (() => void) | null = null;
    
    return {
      subscribe: (fn: (value: T) => void) => {
        const unsubscribe = store.subscribe(fn);
        
        if (!stop) {
          stop = start(store.set);
        }
        
        return () => {
          unsubscribe();
          if (stop) {
            stop();
            stop = null;
          }
        };
      }
    };
  }
  
  return {
    subscribe: store.subscribe
  };
}

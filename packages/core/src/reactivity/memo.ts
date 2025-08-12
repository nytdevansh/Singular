// reactivity/memo.ts - Computed values

import { runEffect, currentEffect } from './signal.js';

type ComputedFn<T> = () => T;

// Create a computed value
export function computed<T>(fn: ComputedFn<T>): () => T {
  let value: T;
  let isStale = true;
  
  const computedFn = () => {
    if (isStale) {
      const prevEffect = currentEffect;
      
      runEffect(() => {
        value = fn();
        isStale = false;
      });
    }
    
    return value;
  };
  
  return computedFn;
}

export interface MemoOptions<T> {
  equals?: (a: T, b: T) => boolean;
}

export function createMemo<T>(fn: ComputedFn<T>, options?: MemoOptions<T>): () => T {
  return computed(fn);
}

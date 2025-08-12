// state/derived.ts
import { createMemo } from '../reactivity/memo.js';

export interface DerivedStore<T> {
  (): T;
}

export function derived<T>(fn: () => T): DerivedStore<T> {
  return createMemo(fn);
}

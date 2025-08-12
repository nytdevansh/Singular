// reactivity/batch.ts - Batching system

import { effectStack, runEffect } from './signal.js';

// Batch multiple updates
export function batch(fn: () => void) {
  const prevStack = [...effectStack];
  effectStack.length = 0;
  
  try {
    fn();
  } finally {
    const effects = [...new Set(effectStack)];
    effectStack.length = 0;
    effectStack.push(...prevStack);
    
    effects.forEach(runEffect);
  }
}

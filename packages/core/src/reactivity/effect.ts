// reactivity/effect.ts - Effects system

import { runEffect } from './signal.js';

type EffectFn = () => void;

// Create an effect that runs when dependencies change
export function effect(fn: EffectFn): () => void {
  const cleanup = () => {
    // Cleanup logic if needed
  };
  
  runEffect(fn);
  
  return cleanup;
}

export function createEffect(fn: EffectFn, options?: { sync?: boolean }) {
  return effect(fn);
}

export function onCleanup(fn: () => void) {
  // Add cleanup function to current effect context
  // This would be implemented based on your cleanup strategy
}

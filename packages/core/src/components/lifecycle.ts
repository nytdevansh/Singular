// components/lifecycle.ts
import { onCleanup } from '../reactivity/effect.js';
import { scheduleRaf } from '../scheduler/raf.js';

export type LifecycleHook = () => void;

export function onMount(fn: LifecycleHook) {
  scheduleRaf(fn);
}

export function onBeforeUpdate(fn: LifecycleHook) {
  // Implementation would track before DOM updates
  fn();
}

export function onAfterUpdate(fn: LifecycleHook) {
  scheduleRaf(fn);
}


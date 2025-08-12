// scheduler/microtask.ts
let effectQueue: (() => void)[] = [];
let isFlushingEffects = false;

export function scheduleEffect(fn: () => void) {
  effectQueue.push(fn);
  if (!isFlushingEffects) {
    queueMicrotask(flushEffects);
  }
}

export function flushEffects() {
  if (isFlushingEffects) return;
  
  isFlushingEffects = true;
  const effects = effectQueue;
  effectQueue = [];
  
  effects.forEach(effect => {
    try {
      effect();
    } catch (error) {
      console.error('Effect error:', error);
    }
  });
  
  isFlushingEffects = false;
}

export function nextTick(fn: () => void) {
  queueMicrotask(fn);
}


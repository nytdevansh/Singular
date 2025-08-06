// Core Reactivity System for Singular
// Inspired by SolidJS and Svelte's reactive primitives

type EffectFn = () => void;
type ComputedFn<T> = () => T;

// Global tracking context
let currentEffect: EffectFn | null = null;
const effectStack: EffectFn[] = [];

// Dependency tracking
class ReactiveNode {
  private subscribers = new Set<EffectFn>();
  private dependencies = new Set<ReactiveNode>();
  
  subscribe(effect: EffectFn) {
    this.subscribers.add(effect);
  }
  
  unsubscribe(effect: EffectFn) {
    this.subscribers.delete(effect);
  }
  
  notify() {
    this.subscribers.forEach(effect => {
      if (!effectStack.includes(effect)) {
        runEffect(effect);
      }
    });
  }
  
  track() {
    if (currentEffect) {
      this.subscribe(currentEffect);
    }
  }
  
  cleanup() {
    this.dependencies.forEach(dep => dep.unsubscribe(currentEffect!));
    this.dependencies.clear();
  }
}

function runEffect(effect: EffectFn) {
  if (effectStack.includes(effect)) return; // Prevent infinite loops
  
  const prevEffect = currentEffect;
  currentEffect = effect;
  effectStack.push(effect);
  
  try {
    effect();
  } finally {
    effectStack.pop();
    currentEffect = prevEffect;
  }
}

// Create a reactive signal
export function useState<T>(initialValue: T): [() => T, (value: T) => T] {
  const node = new ReactiveNode();
  let value = initialValue;
  
  const getter = () => {
    node.track();
    return value;
  };
  
  const setter = (newValue: T) => {
    if (value !== newValue) {
      value = newValue;
      node.notify();
    }
    return value;
  };
  
  return [getter, setter];
}

// Create a computed value
export function computed<T>(fn: ComputedFn<T>): () => T {
  const node = new ReactiveNode();
  let value: T;
  let isStale = true;
  
  const computedFn = () => {
    if (isStale) {
      const prevEffect = currentEffect;
      currentEffect = () => {
        isStale = true;
        node.notify();
      };
      
      try {
        value = fn();
        isStale = false;
      } finally {
        currentEffect = prevEffect;
      }
    }
    
    node.track();
    return value;
  };
  
  return computedFn;
}

// Create an effect that runs when dependencies change
export function effect(fn: EffectFn): () => void {
  const cleanup = () => {
    // Cleanup logic if needed
  };
  
  runEffect(fn);
  
  return cleanup;
}

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
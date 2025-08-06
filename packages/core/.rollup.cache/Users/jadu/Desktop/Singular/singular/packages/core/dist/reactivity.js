// Core Reactivity System for Singular
// Inspired by SolidJS and Svelte's reactive primitives
// Global tracking context
let currentEffect = null;
const effectStack = [];
// Dependency tracking
class ReactiveNode {
    constructor() {
        this.subscribers = new Set();
        this.dependencies = new Set();
    }
    subscribe(effect) {
        this.subscribers.add(effect);
    }
    unsubscribe(effect) {
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
        this.dependencies.forEach(dep => dep.unsubscribe(currentEffect));
        this.dependencies.clear();
    }
}
function runEffect(effect) {
    if (effectStack.includes(effect))
        return; // Prevent infinite loops
    const prevEffect = currentEffect;
    currentEffect = effect;
    effectStack.push(effect);
    try {
        effect();
    }
    finally {
        effectStack.pop();
        currentEffect = prevEffect;
    }
}
// Create a reactive signal
export function useState(initialValue) {
    const node = new ReactiveNode();
    let value = initialValue;
    const getter = () => {
        node.track();
        return value;
    };
    const setter = (newValue) => {
        if (value !== newValue) {
            value = newValue;
            node.notify();
        }
        return value;
    };
    return [getter, setter];
}
// Create a computed value
export function computed(fn) {
    const node = new ReactiveNode();
    let value;
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
            }
            finally {
                currentEffect = prevEffect;
            }
        }
        node.track();
        return value;
    };
    return computedFn;
}
// Create an effect that runs when dependencies change
export function effect(fn) {
    const cleanup = () => {
        // Cleanup logic if needed
    };
    runEffect(fn);
    return cleanup;
}
// Batch multiple updates
export function batch(fn) {
    const prevStack = [...effectStack];
    effectStack.length = 0;
    try {
        fn();
    }
    finally {
        const effects = [...new Set(effectStack)];
        effectStack.length = 0;
        effectStack.push(...prevStack);
        effects.forEach(runEffect);
    }
}
//# sourceMappingURL=reactivity.js.map
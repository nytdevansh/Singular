type EffectFn = () => void;
type ComputedFn<T> = () => T;
export declare function useState<T>(initialValue: T): [() => T, (value: T) => T];
export declare function computed<T>(fn: ComputedFn<T>): () => T;
export declare function effect(fn: EffectFn): () => void;
export declare function batch(fn: () => void): void;
export {};
//# sourceMappingURL=reactivity.d.ts.map
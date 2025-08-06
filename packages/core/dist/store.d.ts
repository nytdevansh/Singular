export interface Store<T> {
    (): T;
    set(value: T): void;
    update(updater: (current: T) => T): void;
    subscribe(fn: (value: T) => void): () => void;
    reset(): void;
}
export declare function createStore<T>(initialValue: T): Store<T>;
export declare function derived<T, Sources extends readonly any[]>(stores: Sources, fn: (...values: Sources) => T): () => T;
export declare function writable<T>(initialValue: T): Store<T>;
export declare function readable<T>(value: T): () => T;
export declare function createActions<T, A extends Record<string, (...args: any[]) => void>>(store: Store<T>, actions: (set: Store<T>['set'], update: Store<T>['update'], get: () => T) => A): A & {
    store: Store<T>;
};
export declare function persist<T>(store: Store<T>, key: string, storage?: Storage): Store<T>;
export interface AppState {
    user: {
        id: string;
        name: string;
    } | null;
    theme: 'light' | 'dark';
    loading: boolean;
    error: string | null;
    notifications: Array<{
        id: string;
        message: string;
        type: 'info' | 'success' | 'error';
    }>;
}
export declare const appStore: Store<AppState>;
export declare const appActions: {
    setUser(user: AppState["user"]): void;
    setTheme(theme: AppState["theme"]): void;
    setLoading(loading: boolean): void;
    setError(error: string | null): void;
    addNotification(message: string, type?: AppState["notifications"][0]["type"]): void;
    removeNotification(id: string): void;
    reset(): void;
} & {
    store: Store<AppState>;
};
export type StoreMiddleware<T> = (next: (value: T) => void, action: {
    type: string;
    payload?: any;
}) => (value: T) => void;
export declare function applyMiddleware<T>(store: Store<T>, ...middlewares: StoreMiddleware<T>[]): Store<T>;
export declare const logger: <T>() => StoreMiddleware<T>;
export declare function connectDevTools<T>(store: Store<T>, name?: string): Store<T>;
//# sourceMappingURL=store.d.ts.map
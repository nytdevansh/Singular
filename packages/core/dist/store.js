import { useState, effect, computed } from './reactivity';
// Create a global store
export function createStore(initialValue) {
    const [state, setState] = useState(initialValue);
    const subscribers = new Set();
    const initialState = initialValue;
    // Subscribe to state changes and notify subscribers
    effect(() => {
        const currentValue = state();
        subscribers.forEach(fn => fn(currentValue));
    });
    const store = (() => state());
    store.set = (value) => {
        setState(value);
    };
    store.update = (updater) => {
        setState(updater(state()));
    };
    store.subscribe = (fn) => {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
    };
    store.reset = () => {
        setState(initialState);
    };
    return store;
}
// Create a computed store derived from other stores
export function derived(stores, fn) {
    return computed(() => {
        const values = stores.map(store => typeof store === 'function' ? store() : store);
        return fn(...values);
    });
}
// Writable store (Svelte-inspired)
export function writable(initialValue) {
    return createStore(initialValue);
}
// Readonly store
export function readable(value) {
    const [state] = useState(value);
    return state;
}
// Action creator for complex state updates
export function createActions(store, actions) {
    const actionHandlers = actions(store.set, store.update, store);
    return { ...actionHandlers, store };
}
// Persistence helpers
export function persist(store, key, storage = localStorage) {
    // Try to load from storage
    try {
        const saved = storage.getItem(key);
        if (saved !== null) {
            store.set(JSON.parse(saved));
        }
    }
    catch (e) {
        console.warn(`Failed to load persisted state for key "${key}":`, e);
    }
    // Subscribe to changes and save to storage
    store.subscribe((value) => {
        try {
            storage.setItem(key, JSON.stringify(value));
        }
        catch (e) {
            console.warn(`Failed to persist state for key "${key}":`, e);
        }
    });
    return store;
}
const initialAppState = {
    user: null,
    theme: 'light',
    loading: false,
    error: null,
    notifications: []
};
export const appStore = createStore(initialAppState);
// App store actions
export const appActions = createActions(appStore, (set, update) => ({
    setUser(user) {
        update(state => ({ ...state, user }));
    },
    setTheme(theme) {
        update(state => ({ ...state, theme }));
        document.documentElement.setAttribute('data-theme', theme);
    },
    setLoading(loading) {
        update(state => ({ ...state, loading }));
    },
    setError(error) {
        update(state => ({ ...state, error }));
    },
    addNotification(message, type = 'info') {
        const notification = {
            id: Math.random().toString(36).substr(2, 9),
            message,
            type
        };
        update(state => ({
            ...state,
            notifications: [...state.notifications, notification]
        }));
        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 5000);
    },
    removeNotification(id) {
        update(state => ({
            ...state,
            notifications: state.notifications.filter(n => n.id !== id)
        }));
    },
    reset() {
        set(initialAppState);
    }
}));
export function applyMiddleware(store, ...middlewares) {
    const originalSet = store.set;
    store.set = (value) => {
        const action = { type: 'SET', payload: value };
        const chain = middlewares.reduceRight((next, middleware) => middleware(next, action), originalSet);
        chain(value);
    };
    return store;
}
// Logger middleware
export const logger = () => (next, action) => (value) => {
    console.group(`Store Action: ${action.type}`);
    console.log('Payload:', action.payload);
    console.log('New Value:', value);
    console.groupEnd();
    next(value);
};
// Dev tools integration (basic)
export function connectDevTools(store, name = 'SingularStore') {
    if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
        const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name });
        store.subscribe((state) => {
            devTools.send({ type: 'STATE_CHANGE' }, state);
        });
        devTools.subscribe((message) => {
            if (message.type === 'DISPATCH' && message.state) {
                try {
                    const state = JSON.parse(message.state);
                    store.set(state);
                }
                catch (e) {
                    console.warn('Failed to parse state from devtools:', e);
                }
            }
        });
    }
    return store;
}
//# sourceMappingURL=store.js.map
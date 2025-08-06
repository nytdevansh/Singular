import { useState, effect, computed } from './reactivity';

// Store interface
export interface Store<T> {
  (): T;
  set(value: T): void;
  update(updater: (current: T) => T): void;
  subscribe(fn: (value: T) => void): () => void;
  reset(): void;
}

// Create a global store
export function createStore<T>(initialValue: T): Store<T> {
  const [state, setState] = useState<T>(initialValue);
  const subscribers = new Set<(value: T) => void>();
  const initialState = initialValue;
  
  // Subscribe to state changes and notify subscribers
  effect(() => {
    const currentValue = state();
    subscribers.forEach(fn => fn(currentValue));
  });
  
  const store = (() => state()) as Store<T>;
  
  store.set = (value: T) => {
    setState(value);
  };
  
  store.update = (updater: (current: T) => T) => {
    setState(updater(state()));
  };
  
  store.subscribe = (fn: (value: T) => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };
  
  store.reset = () => {
    setState(initialState);
  };
  
  return store;
}

// Create a computed store derived from other stores
// Create a computed store derived from other stores
export function derived<T, Sources extends readonly any[]>(
  stores: Sources,
  fn: (...values: Sources) => T
): () => T {
  return computed(() => {
    const values = stores.map(store =>
      typeof store === 'function' ? store() : store
    );
    return fn(...(values as unknown as Sources));
  });
}

// Writable store (Svelte-inspired)
export function writable<T>(initialValue: T) {
  return createStore(initialValue);
}

// Readonly store
export function readable<T>(value: T): () => T {
  const [state] = useState(value);
  return state;
}

// Action creator for complex state updates
export function createActions<T, A extends Record<string, (...args: any[]) => void>>(
  store: Store<T>,
  actions: (set: Store<T>['set'], update: Store<T>['update'], get: () => T) => A
): A & { store: Store<T> } {
  const actionHandlers = actions(store.set, store.update, store);
  return { ...actionHandlers, store };
}

// Persistence helpers
export function persist<T>(
  store: Store<T>, 
  key: string,
  storage: Storage = localStorage
): Store<T> {
  // Try to load from storage
  try {
    const saved = storage.getItem(key);
    if (saved !== null) {
      store.set(JSON.parse(saved));
    }
  } catch (e) {
    console.warn(`Failed to load persisted state for key "${key}":`, e);
  }
  
  // Subscribe to changes and save to storage
  store.subscribe((value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to persist state for key "${key}":`, e);
    }
  });
  
  return store;
}

// Global app store with common patterns
export interface AppState {
  user: { id: string; name: string } | null;
  theme: 'light' | 'dark';
  loading: boolean;
  error: string | null;
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>;
}

const initialAppState: AppState = {
  user: null,
  theme: 'light',
  loading: false,
  error: null,
  notifications: []
};

export const appStore = createStore<AppState>(initialAppState);

// App store actions
export const appActions = createActions(appStore, (set, update) => ({
  setUser(user: AppState['user']) {
    update(state => ({ ...state, user }));
  },
  
  setTheme(theme: AppState['theme']) {
    update(state => ({ ...state, theme }));
    document.documentElement.setAttribute('data-theme', theme);
  },
  
  setLoading(loading: boolean) {
    update(state => ({ ...state, loading }));
  },
  
  setError(error: string | null) {
    update(state => ({ ...state, error }));
  },
  
  addNotification(message: string, type: AppState['notifications'][0]['type'] = 'info') {
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
  
  removeNotification(id: string) {
    update(state => ({
      ...state,
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  reset() {
    set(initialAppState);
  }
}));

// Middleware system for stores
export type StoreMiddleware<T> = (
  next: (value: T) => void,
  action: { type: string; payload?: any }
) => (value: T) => void;

export function applyMiddleware<T>(
  store: Store<T>,
  ...middlewares: StoreMiddleware<T>[]
): Store<T> {
  const originalSet = store.set;
  
  store.set = (value: T) => {
    const action = { type: 'SET', payload: value };
    const chain = middlewares.reduceRight(
      (next, middleware) => middleware(next, action),
      originalSet
    );
    chain(value);
  };
  
  return store;
}

// Logger middleware
export const logger = <T>(): StoreMiddleware<T> => (next, action) => (value) => {
  console.group(`Store Action: ${action.type}`);
  console.log('Payload:', action.payload);
  console.log('New Value:', value);
  console.groupEnd();
  next(value);
};

// Dev tools integration (basic)
export function connectDevTools<T>(store: Store<T>, name = 'SingularStore') {
  if (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({ name });
    
    store.subscribe((state) => {
      devTools.send({ type: 'STATE_CHANGE' }, state);
    });
    
    devTools.subscribe((message: any) => {
      if (message.type === 'DISPATCH' && message.state) {
        try {
          const state = JSON.parse(message.state);
          store.set(state);
        } catch (e) {
          console.warn('Failed to parse state from devtools:', e);
        }
      }
    });
  }
  
  return store;
}
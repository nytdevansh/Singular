// state/actions.ts
import { createStore } from './store.js';

export function createActions<T, A extends Record<string, (state: T, ...args: any[]) => T>>(
  store: { get: () => T; set: (value: T) => void },
  actions: A
) {
  const boundActions = {} as { [K in keyof A]: (...args: Parameters<A[K]> extends [any, ...infer Rest] ? Rest : []) => void };

  Object.entries(actions).forEach(([name, action]) => {
    (boundActions as any)[name] = (...args: any[]) => {
      const currentState = store.get();
      const newState = action(currentState, ...args);
      store.set(newState);
    };
  });

  return boundActions;
}

// Global app store (example)
export const appStore = createStore({
  user: null,
  theme: 'light',
  loading: false
});

export const appActions = createActions(appStore, {
  setUser: (state, user) => ({ ...state, user }),
  setTheme: (state, theme) => ({ ...state, theme }),
  setLoading: (state, loading) => ({ ...state, loading })
});

export function applyMiddleware(middleware: any) {
  // Middleware implementation
  console.log('Middleware applied:', middleware);
}

export const logger = {
  install: () => console.log('Logger middleware installed')
};

export function connectDevTools() {
  console.log('DevTools connected');
}

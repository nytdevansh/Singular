// Core Singular Framework Export
export function greet(name: string) {
  return `Hello, ${name} from Singular Core!`;
}

// Core rendering
export { createElement, Fragment } from './createElement';
export { render } from './render';

// Export all for easy importing
// core animate
export {
  animate,
  animateOnScroll,
  animateOnHover,
  animateOnClick,
  animateLoop,
  animateSequence,
  animateParallel,
  animateStagger,
  createTimeline,
  animateMove,
  animateResize,
  stickToViewport,
  fadeIn,
  fadeOut,
  slideIn,
  bounce,
  slideFromEdge,
  morphSize
} from './animate';
// Reactivity system
export { 
  useState, 
  effect, 
  computed, 
  batch 
} from './reactivity';

// Component system
export {
  component,
  memo,
  createContext,
  createPortal,
  Show,
  For,
  type ComponentFn
} from './component';

// Router
export {
  Router,
  Link,
  router,
  navigation,
  type Route,
  type RouteGuard,
  type RouteMatch
} from './router';

// State management
export {
  createStore,
  derived,
  writable,
  readable,
  createActions,
  persist,
  appStore,
  appActions,
  applyMiddleware,
  logger,
  connectDevTools,
  type Store
} from './store';

// Version info
export const VERSION = '1.0.0-alpha';

// Development utilities
export const dev = {
  // Enable reactive debugging
  enableReactiveDebugging() {
    if (typeof window !== 'undefined') {
      (window as any).__SINGULAR_DEBUG__ = true;
    }
  },
  
  // Performance monitoring
  startPerformanceMonitoring() {
    console.log('🚀 Singular Performance Monitoring Enabled');
  },
  
  // Component tree inspector (basic)
  inspectComponents() {
    console.log('📊 Singular Component Inspector - Feature coming soon!');
  }
};

// Framework metadata
export const Singular = {
  version: VERSION,
  
  // Plugin system (placeholder for future)
  plugins: [] as any[],
  
  use(plugin: any) {
    this.plugins.push(plugin);
    if (typeof plugin.install === 'function') {
      plugin.install();
    }
  },
  
  // Configuration
  config: {
    devMode: typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production',
    strict: true,
    warnOnUnhandledEffects: true
  }
};
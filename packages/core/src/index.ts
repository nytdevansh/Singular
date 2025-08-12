// packages/core/src/index.ts - Updated with your actual implementations

// Core Singular Framework Export
export function greet(name: string) {
  return `Hello, ${name} from Singular Core!`;
}

// Core rendering
export { createElement, Fragment } from './dom/createElement.js';
export { render } from './dom/render.js';

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
  morphSize,
  type AnimateOptions,
  type EasingFunction
} from './animate/core.js';

// Reactivity system
export { 
  useState, 
  createSignal,
  type Signal
} from './reactivity/signal.js';

export {
  effect,
  createEffect,
  onCleanup
} from './reactivity/effect.js';

export { 
  computed,
  createMemo,
  type MemoOptions
} from './reactivity/memo.js';

export { 
  batch 
} from './reactivity/batch.js';

// Component system
export {
  component,
  memo,
  createContext,
  createPortal,
  type ComponentFn
} from './components/component.js';

export {
  Show,
  For,
  type ShowProps,
  type ForProps
} from './components/control-flow.js';

// Router
export {
  Router,
  router,
  type Route,
  type RouteGuard,
  type RouteMatch
} from './router/core.js';

// StickyLogoManager
export {
  StickyLogoManager,
  stickyLogoManager
} from './components/sticky-logo.js';

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

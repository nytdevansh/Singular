// router/core.ts - Your router implementation

import { useState, effect } from '../reactivity/signal.js';
import { ComponentFn } from '../components/component.js';

// Route definition
export interface Route {
  path: string;
  component: ComponentFn<any>;
  children?: Route[];
  guards?: RouteGuard[];
}

export type RouteGuard = (to: RouteMatch, from: RouteMatch | null) => boolean | Promise<boolean>;

export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
}

class SingularRouter {
  private routes: Route[] = [];
  private currentRoute: () => RouteMatch | null;
  private setCurrentRoute: (value: RouteMatch | null) => RouteMatch | null;
  private guards: RouteGuard[] = [];
  
  constructor() {
    // Initialize reactive state
    const [currentRoute, setCurrentRoute] = useState<RouteMatch | null>(null);
    this.currentRoute = currentRoute;
    this.setCurrentRoute = setCurrentRoute;
    
    // Listen to browser navigation
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname + window.location.search + window.location.hash);
    });
    
    // Initialize with current URL
    this.navigate(window.location.pathname + window.location.search + window.location.hash);
  }
  
  // Add routes
  addRoutes(routes: Route[]) {
    this.routes.push(...routes);
  }
  
  // Add global guard
  addGuard(guard: RouteGuard) {
    this.guards.push(guard);
  }
  
  // Navigate to a route
  async navigate(path: string, replace = false) {
    const match = this.matchRoute(path);
    if (!match) {
      console.warn(`No route found for path: ${path}`);
      return false;
    }
    
    // Run guards
    const canNavigate = await this.runGuards(match, this.currentRoute());
    if (!canNavigate) {
      return false;
    }
    
    // Update browser history
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    
    // Update current route
    this.setCurrentRoute(match);
    return true;
  }
  
  // Get current route
  getCurrentRoute(): () => RouteMatch | null {
    return this.currentRoute;
  }
  
  // Match path to route
  private matchRoute(path: string): RouteMatch | null {
    const url = new URL(path, window.location.origin);
    const pathname = url.pathname;
    const query = Object.fromEntries(url.searchParams);
    const hash = url.hash;
    
    for (const route of this.routes) {
      const match = this.matchPath(pathname, route.path);
      if (match) {
        return {
          path: pathname,
          params: match,
          query,
          hash
        };
      }
    }
    
    return null;
  }
  
  // Match path pattern with params
  private matchPath(path: string, pattern: string): Record<string, string> | null {
    const pathSegments = path.split('/').filter(Boolean);
    const patternSegments = pattern.split('/').filter(Boolean);
    
    if (pathSegments.length !== patternSegments.length) {
      return null;
    }
    
    const params: Record<string, string> = {};
    
    for (let i = 0; i < patternSegments.length; i++) {
      const patternSegment = patternSegments[i];
      const pathSegment = pathSegments[i];
      
      if (patternSegment.startsWith(':')) {
        // Dynamic parameter
        const paramName = patternSegment.slice(1);
        params[paramName] = pathSegment;
      } else if (patternSegment !== pathSegment) {
        // Static segment doesn't match
        return null;
      }
    }
    
    return params;
  }
  
  // Run route guards
  private async runGuards(to: RouteMatch, from: RouteMatch | null): Promise<boolean> {
    for (const guard of this.guards) {
      const result = await guard(to, from);
      if (!result) {
        return false;
      }
    }
    return true;
  }
}

// Create router instance
const router = new SingularRouter();

export function Router({ routes }: { routes: Route[] }) {
  router.addRoutes(routes);
  
  // Return router component that renders current route
  const currentRoute = router.getCurrentRoute();
  
  effect(() => {
    const route = currentRoute();
    if (route) {
      // Find matching route component and render
      const matchingRoute = routes.find(r => r.path === route.path);
      if (matchingRoute) {
        return matchingRoute.component(route);
      }
    }
  });
  
  return document.createElement('div');
}

export { router };

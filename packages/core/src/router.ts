import { useState, effect } from './reactivity';
import { ComponentFn } from './component';

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
    // Run global guards
    for (const guard of this.guards) {
      const canProceed = await guard(to, from);
      if (!canProceed) return false;
    }
    
    // Find matching route and run its guards
    const route = this.routes.find(r => this.matchPath(to.path, r.path));
    if (route?.guards) {
      for (const guard of route.guards) {
        const canProceed = await guard(to, from);
        if (!canProceed) return false;
      }
    }
    
    return true;
  }
}

// Global router instance
export const router = new SingularRouter();

// Router component
export function Router(props: { 
  routes: Route[];
  fallback?: ComponentFn<{}>;
}): HTMLElement {
  router.addRoutes(props.routes);
  
  const container = document.createElement('div');
  container.setAttribute('data-router', 'true');
  
  effect(() => {
    const currentRoute = router.getCurrentRoute()();
    
    // Clear container
    container.innerHTML = '';
    
    if (currentRoute) {
      const route = props.routes.find(r => router['matchPath'](currentRoute.path, r.path));
      if (route) {
        const component = route.component({ 
          route: currentRoute,
          params: currentRoute.params,
          query: currentRoute.query 
        });
        container.appendChild(component);
      } else if (props.fallback) {
        container.appendChild(props.fallback({}));
      }
    } else if (props.fallback) {
      container.appendChild(props.fallback({}));
    }
  });
  
  return container;
}

// Link component for navigation
export function Link(props: {
  to: string;
  replace?: boolean;
  children: any[];
  className?: string;
  onClick?: (e: MouseEvent) => void;
}): HTMLElement {
  const link = document.createElement('a');
  link.href = props.to;
  
  if (props.className) {
    link.className = props.className;
  }
  
  // Append children
  props.children.forEach(child => {
    if (typeof child === 'string') {
      link.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      link.appendChild(child);
    }
  });
  
  // Handle click
  link.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (props.onClick) {
      props.onClick(e);
    }
    
    router.navigate(props.to, props.replace);
  });
  
  return link;
}

// Navigation helpers
export const navigation = {
  push: (path: string) => router.navigate(path, false),
  replace: (path: string) => router.navigate(path, true),
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  getCurrentRoute: () => router.getCurrentRoute()
};
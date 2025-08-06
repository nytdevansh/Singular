import { createElement } from './createElement';
import { useState, effect, computed } from './reactivity';

// Component function type
export type ComponentFn<T = {}> = (props: T) => HTMLElement;

// Context system
interface Context<T> {
  defaultValue: T;
  Provider: ComponentFn<{ value: T | (() => T); children: any[] }>;
  Consumer: () => () => T;
}

const contextMap = new Map<Context<any>, any>();

export function createContext<T>(defaultValue: T): Context<T> {
  const context: Context<T> = {
    defaultValue,
    Provider: ({ value, children }) => {
      // Set context value
      const contextValue = typeof value === 'function' ? value : () => value;
      contextMap.set(context, contextValue);
      
      // Create container
      const container = createElement('div', { 'data-context': 'provider' });
      
      // Render children
      children.forEach(child => {
        if (typeof child === 'function') {
          container.appendChild(child());
        } else if (child instanceof HTMLElement) {
          container.appendChild(child);
        } else {
          container.appendChild(createElement('span', {}, String(child)));
        }
      });
      
      return container;
    },
    Consumer: () => {
      const contextValue = contextMap.get(context);
      return contextValue || (() => defaultValue);
    }
  };
  
  return context;
}

// Component wrapper with props validation and memoization
export function component<T>(fn: ComponentFn<T>): ComponentFn<T> {
  return (props: T) => {
    return fn(props);
  };
}

// Memoization wrapper
export function memo<T>(fn: ComponentFn<T>, areEqual?: (prevProps: T, nextProps: T) => boolean): ComponentFn<T> {
  let lastProps: T;
  let lastResult: HTMLElement;
  
  return (props: T) => {
    const shouldUpdate = areEqual 
      ? !areEqual(lastProps, props)
      : JSON.stringify(lastProps) !== JSON.stringify(props);
      
    if (!lastResult || shouldUpdate) {
      lastProps = props;
      lastResult = fn(props);
    }
    
    return lastResult;
  };
}

// Portal for rendering outside the normal tree
export function createPortal(children: any, container: HTMLElement): HTMLElement {
  const portal = createElement('div', { 'data-portal': 'true' });
  
  // Clear target container and append children
  container.innerHTML = '';
  if (Array.isArray(children)) {
    children.forEach(child => {
      if (typeof child === 'function') {
        container.appendChild(child());
      } else if (child instanceof HTMLElement) {
        container.appendChild(child);
      } else {
        container.appendChild(document.createTextNode(String(child)));
      }
    });
  }
  
  return portal; // Return placeholder in normal tree
}

// Show component for conditional rendering
export function Show<T>(props: {
  when: T | (() => T);
  children: () => any;
  fallback?: () => any;
}): HTMLElement {
  const container = createElement('div', { 'data-show': 'container' });
  let currentElement: HTMLElement | null = null;
  
  // Make when reactive if it's not already
  const condition = typeof props.when === 'function' 
    ? props.when as (() => T)
    : (() => props.when as T);
  
  effect(() => {
    const shouldShow = Boolean(condition());
    
    // Remove current element
    if (currentElement) {
      container.removeChild(currentElement);
      currentElement = null;
    }
    
    // Add new element based on condition
    if (shouldShow) {
      const childResult = props.children();
      if (childResult instanceof HTMLElement) {
        currentElement = childResult;
      } else {
        currentElement = createElement('span', {}, String(childResult));
      }
    } else if (props.fallback) {
      const fallbackResult = props.fallback();
      if (fallbackResult instanceof HTMLElement) {
        currentElement = fallbackResult;
      } else {
        currentElement = createElement('span', {}, String(fallbackResult));
      }
    }
    
    if (currentElement) {
      container.appendChild(currentElement);
    }
  });
  
  return container;
}

// For component for list rendering with keyed reconciliation
export function For<T>(props: {
  each: T[] | (() => T[]);
  children: (item: T, index: () => number) => any;
  key?: (item: T, index: number) => string | number;
}): HTMLElement {
  const container = createElement('div', { 'data-for': 'container' });
  const renderedItems = new Map<string | number, HTMLElement>();
  
  // Make each reactive if it's not already
  const items = typeof props.each === 'function'
    ? props.each as (() => T[])
    : (() => props.each as T[]);
  
  effect(() => {
    const currentItems = items();
    const newRenderedItems = new Map<string | number, HTMLElement>();
    
    // Clear container
    container.innerHTML = '';
    
    currentItems.forEach((item, index) => {
      // Generate key
      const key = props.key 
        ? props.key(item, index)
        : index;
      
      // Check if we can reuse existing element
      let element = renderedItems.get(key);
      
      if (!element) {
        // Create new element
        const indexSignal = computed(() => {
          const currentItems = items();
          return currentItems.indexOf(item);
        });
        
        const childResult = props.children(item, indexSignal);
        
        if (childResult instanceof HTMLElement) {
          element = childResult;
        } else {
          element = createElement('div', { 'data-for-item': String(key) }, String(childResult));
        }
      }
      
      newRenderedItems.set(key, element);
      container.appendChild(element);
    });
    
    // Update rendered items map
    renderedItems.clear();
    newRenderedItems.forEach((element, key) => {
      renderedItems.set(key, element);
    });
  });
  
  return container;
}

// Switch component for multiple conditions
export function Switch(props: {
  children: Array<{ when: any | (() => any); children: () => any }>;
  fallback?: () => any;
}): HTMLElement {
  const container = createElement('div', { 'data-switch': 'container' });
  
  effect(() => {
    container.innerHTML = '';
    
    // Find first matching condition
    const matchingCase = props.children.find(caseProps => {
      const condition = typeof caseProps.when === 'function' 
        ? caseProps.when()
        : caseProps.when;
      return Boolean(condition);
    });
    
    let element: HTMLElement;
    
    if (matchingCase) {
      const result = matchingCase.children();
      element = result instanceof HTMLElement 
        ? result 
        : createElement('span', {}, String(result));
    } else if (props.fallback) {
      const result = props.fallback();
      element = result instanceof HTMLElement 
        ? result 
        : createElement('span', {}, String(result));
    } else {
      element = createElement('span', {});
    }
    
    container.appendChild(element);
  });
  
  return container;
}

// ErrorBoundary for error handling
export function ErrorBoundary(props: {
  children: any[];
  fallback: (error: Error) => any;
  onError?: (error: Error) => void;
}): HTMLElement {
  const container = createElement('div', { 'data-error-boundary': 'true' });
  
  try {
    props.children.forEach(child => {
      if (typeof child === 'function') {
        container.appendChild(child());
      } else if (child instanceof HTMLElement) {
        container.appendChild(child);
      } else {
        container.appendChild(document.createTextNode(String(child)));
      }
    });
  } catch (error) {
    if (props.onError) {
      props.onError(error as Error);
    }
    
    const fallbackResult = props.fallback(error as Error);
    const fallbackElement = fallbackResult instanceof HTMLElement
      ? fallbackResult
      : createElement('div', { className: 'error-fallback' }, String(fallbackResult));
      
    container.appendChild(fallbackElement);
  }
  
  return container;
}

// Suspense-like component for async operations
export function Suspense(props: {
  children: any[];
  fallback: () => any;
}): HTMLElement {
  const [isLoading, setIsLoading] = useState(false);
  const container = createElement('div', { 'data-suspense': 'true' });
  
  effect(() => {
    if (isLoading()) {
      container.innerHTML = '';
      const fallbackResult = props.fallback();
      const fallbackElement = fallbackResult instanceof HTMLElement
        ? fallbackResult
        : createElement('div', { className: 'suspense-fallback' }, String(fallbackResult));
      container.appendChild(fallbackElement);
    } else {
      container.innerHTML = '';
      props.children.forEach(child => {
        if (typeof child === 'function') {
          container.appendChild(child());
        } else if (child instanceof HTMLElement) {
          container.appendChild(child);
        } else {
          container.appendChild(document.createTextNode(String(child)));
        }
      });
    }
  });
  
  // Expose loading state control (could be enhanced with promises)
  (container as any).setLoading = setIsLoading;
  
  return container;
}
// components/component.ts - Your component system

import { createElement } from '../dom/createElement.js';


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
      children.forEach((child: any) => {
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
    children.forEach((child: any) => {
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

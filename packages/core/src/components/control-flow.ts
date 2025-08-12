// components/control-flow.ts - Control flow components

import { createElement } from '../dom/createElement.js';
import { effect, computed } from '../reactivity/signal.js';

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

export interface ShowProps {
  when: any;
  fallback?: any;
  children: any;
}

export interface ForProps<T> {
  each: T[];
  children: (item: T, index: number) => any;
}

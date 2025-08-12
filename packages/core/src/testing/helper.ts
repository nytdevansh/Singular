// testing/helpers.ts - Fixed version
import{render} from '../dom/render'
export interface TestRenderer {
  container: HTMLElement;
  unmount: () => void;
}

export function renderComponent(component: any): TestRenderer {
  const container = document.createElement('div');
  
  // Add container to document for proper testing
  document.body.appendChild(container);
  
  // Your render function returns void, so we don't try to destructure it
  render(component, container);
  
  return {
    container,
    unmount: () => {
      // Clean up: remove from DOM and clear content
      container.innerHTML = '';
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  };
}

export function flushAllQueues() {
  // Flush microtasks for your reactive system
  return new Promise(resolve => setTimeout(resolve, 0));
}

export async function act(fn: () => void | Promise<void>) {
  await fn();
  await flushAllQueues();
  // Wait for any pending async operations
  await new Promise(resolve => setTimeout(resolve, 0));
}

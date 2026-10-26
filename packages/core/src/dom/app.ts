// dom/app.ts - Application creation and mounting
import { render } from './render.js';
import { ComponentFn } from '../components/component.js';

export interface AppContext {
  mount: (selector: string) => void;
  unmount: () => void;
}

export function createApp(rootComponent: ComponentFn): AppContext {
  let container: HTMLElement | null = null;

  return {
    mount(selector: string) {
      container = document.querySelector(selector);
      if (!container) {
        throw new Error(`Target container ${selector} not found`);
      }
      const element = rootComponent({});
      if (element instanceof HTMLElement) {
        render(element, container);
      } else {
        throw new Error('Component must return an HTMLElement');
      }
    },
    unmount() {
      if (container) {
        container.innerHTML = '';
        container = null;
      }
    }
  };
}
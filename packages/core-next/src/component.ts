import { Injectable, Injector } from '@singular/di';
import { ComponentOptions, ComponentRef } from './interfaces';

const COMPONENT_META_KEY = Symbol('SINGULAR_COMPONENT_META');

/**
 * Component decorator implementation
 */
export function Component(options: ComponentOptions) {
  return function componentDecorator(target: any) {
    // Store component metadata
    Reflect.defineMetadata(COMPONENT_META_KEY, {
      ...options,
      target
    }, target);

    // Make component injectable
    Injectable({ scope: 'transient' })(target);

    // Setup custom element definition
    if (!customElements.get(options.selector)) {
      // Create custom element class
      class SingularElement extends HTMLElement {
        private componentRef!: ComponentRef<any>;
        private componentInjector!: Injector;

        constructor() {
          super();
          
          // Create component injector
          this.componentInjector = new Injector(
            Injector.getRootInjector(),
            options.providers || []
          );

          // Create shadow DOM if needed
          if (options.encapsulation === 'shadow') {
            this.attachShadow({ mode: 'open' });
          }
        }

        connectedCallback() {
          // Create component instance
          const instance = this.componentInjector.get(target);
          
          // Create component ref
          this.componentRef = {
            instance,
            hostElement: this,
            destroy: () => this.destroyComponent(),
            markForCheck: () => this.markForCheck(),
            isDestroyed: false
          };

          // Initialize component
          this.initializeComponent();
        }

        disconnectedCallback() {
          this.destroyComponent();
        }

        private initializeComponent() {
          const instance = this.componentRef.instance;

          // Call lifecycle hooks
          if (instance.onInit) {
            instance.onInit();
          }

          // Render template
          this.renderTemplate();

          // Call after view init
          if (instance.afterViewInit) {
            instance.afterViewInit();
          }
        }

        private renderTemplate() {
          const template = options.template;
          if (typeof template === 'string') {
            const renderTarget = options.encapsulation === 'shadow' 
              ? this.shadowRoot 
              : this;
            renderTarget!.innerHTML = template;
          } else if (typeof template === 'function') {
            // TODO: Implement JSX rendering
            // This will be handled by the compiler/runtime
          }
        }

        private destroyComponent() {
          const instance = this.componentRef.instance;
          
          // Call destroy lifecycle hook
          if (instance.onDestroy) {
            instance.onDestroy();
          }

          // Clean up
          this.componentRef.isDestroyed = true;
          this.innerHTML = '';
          if (this.shadowRoot) {
            this.shadowRoot.innerHTML = '';
          }
        }

        private markForCheck() {
          // TODO: Implement change detection
          this.renderTemplate();
        }
      }

      // Register custom element
      customElements.define(options.selector, SingularElement);
    }

    return target;
  };
}
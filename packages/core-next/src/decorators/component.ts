import { createChangeDetectorRef } from '../change-detection';
import { registerCustomElement } from '../dom/custom-elements';
import { BaseComponent, ComponentRef } from '../interfaces';

export interface ComponentOptions {
  selector: string;
  template?: string;
  styles?: string[];
}

export function Component<T extends BaseComponent>(options: ComponentOptions): (target: new () => T) => void {
  return function componentDecorator(target: new () => T): void {
    const customElementClass = class extends HTMLElement {
      private instance: T;
      private changeDetectorRef: any;

      constructor() {
        super();
        // Create shadow DOM
        const shadow = this.attachShadow({ mode: 'open' });

        // Create styles
        if (options.styles) {
          const styleSheet = new CSSStyleSheet();
          for (const style of options.styles) {
            styleSheet.replaceSync(style);
          }
          shadow.adoptedStyleSheets = [styleSheet];
        }

        // Create instance
        this.instance = new target();
        this.changeDetectorRef = createChangeDetectorRef(this);

        // Setup template
        if (options.template) {
          shadow.innerHTML = options.template;
        }

        // Store component reference
        const componentRef: ComponentRef<T> = {
          instance: this.instance,
          elementRef: { nativeElement: this },
          changeDetectorRef: this.changeDetectorRef
        };

        // Add component reference to instance
        Object.defineProperty(this.instance, '__componentRef', {
          value: componentRef,
          enumerable: false,
          configurable: false,
          writable: false
        });

        // Initialize component lifecycle
        if (this.instance.ngOnInit) {
          this.instance.ngOnInit();
        }
      }

      connectedCallback() {
        if (this.instance.ngAfterViewInit) {
          this.instance.ngAfterViewInit();
        }
      }

      disconnectedCallback() {
        if (this.instance.ngOnDestroy) {
          this.instance.ngOnDestroy();
        }
      }

      adoptedCallback() {
        // Handle component moved to new document
      }

      attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        // Handle attribute changes
        if (this.instance.ngOnChanges) {
          this.instance.ngOnChanges({
            [name]: {
              currentValue: newValue,
              previousValue: oldValue,
              firstChange: oldValue === null
            }
          });
        }
      }
    };

    // Register custom element
    registerCustomElement(options.selector, customElementClass);
  };
}
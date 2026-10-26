import { PropOptions } from './interfaces';

const INPUT_META_KEY = Symbol('SINGULAR_INPUT_META');
const OUTPUT_META_KEY = Symbol('SINGULAR_OUTPUT_META');

/**
 * Input property decorator
 */
export function Input(options: PropOptions = {}) {
  return function(target: any, propertyKey: string) {
    const inputs = Reflect.getMetadata(INPUT_META_KEY, target.constructor) || {};
    
    inputs[propertyKey] = {
      name: options.name || propertyKey,
      required: options.required || false,
      transform: options.transform,
      default: options.default
    };

    Reflect.defineMetadata(INPUT_META_KEY, inputs, target.constructor);

    // Define property accessor
    const privateKey = Symbol();
    
    Object.defineProperty(target, propertyKey, {
      get() {
        return this[privateKey] !== undefined ? this[privateKey] : options.default;
      },
      set(value: any) {
        const oldValue = this[privateKey];
        const newValue = options.transform ? options.transform(value) : value;
        
        if (oldValue !== newValue) {
          this[privateKey] = newValue;
          
          // Notify changes if component implements OnChanges
          if (this.onChanges) {
            this.onChanges({
              [propertyKey]: {
                currentValue: newValue,
                previousValue: oldValue,
                firstChange: oldValue === undefined
              }
            });
          }
        }
      }
    });
  };
}

/**
 * Output property decorator for events
 */
export function Output(eventName?: string) {
  return function(target: any, propertyKey: string) {
    const outputs = Reflect.getMetadata(OUTPUT_META_KEY, target.constructor) || {};
    
    outputs[propertyKey] = {
      name: eventName || propertyKey
    };

    Reflect.defineMetadata(OUTPUT_META_KEY, outputs, target.constructor);

    // Create EventEmitter if it doesn't exist
    if (!target[propertyKey]) {
      target[propertyKey] = new EventEmitter();
    }
  };
}

/**
 * Simple EventEmitter implementation
 */
export class EventEmitter<T = any> {
  private listeners: ((value: T) => void)[] = [];

  emit(value: T) {
    this.listeners.forEach(listener => listener(value));
  }

  subscribe(listener: (value: T) => void) {
    this.listeners.push(listener);
    return {
      unsubscribe: () => {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
    };
  }
}
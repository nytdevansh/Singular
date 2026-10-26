import { InjectableOptions, Token } from './interfaces';

type MetadataStore = WeakMap<object, Map<string, Map<string | symbol, any>>>;

const metadataStore: MetadataStore = new WeakMap();

function ensureReflectMetadata() {
  const reflectApi = Reflect as any;

  if (!reflectApi.defineMetadata) {
    reflectApi.defineMetadata = (metadataKey: string | symbol, metadataValue: any, target: object, propertyKey?: string | symbol) => {
      const targetMap = metadataStore.get(target) ?? new Map<string, Map<string | symbol, any>>();
      const metadataKeyName = String(metadataKey);
      const propertyKeyName = propertyKey ?? '__class__';
      const metadataMap = targetMap.get(metadataKeyName) ?? new Map<string | symbol, any>();

      metadataMap.set(propertyKeyName, metadataValue);
      targetMap.set(metadataKeyName, metadataMap);
      metadataStore.set(target, targetMap);
    };
  }

  if (!reflectApi.getMetadata) {
    reflectApi.getMetadata = (metadataKey: string | symbol, target: object, propertyKey?: string | symbol) => {
      const targetMap = metadataStore.get(target);
      if (!targetMap) {
        return undefined;
      }

      const propertyKeyName = propertyKey ?? '__class__';
      return targetMap.get(String(metadataKey))?.get(propertyKeyName);
    };
  }
}

ensureReflectMetadata();

/**
 * Decorator to mark a class as injectable
 */
export function Injectable(options: InjectableOptions = {}) {
  return function(target: any) {
    // Store metadata about the injectable
    Reflect.defineMetadata('singular:injectable', {
      scope: options.scope || 'singleton',
      providedIn: options.providedIn || null
    }, target);
    
    return target;
  };
}

/**
 * Decorator to inject a dependency
 */
export function Inject(token: Token) {
  return function(target: any, key: string | symbol, parameterIndex?: number) {
    if (typeof parameterIndex === 'number') {
      // Parameter decorator
      const params = Reflect.getMetadata('singular:inject:params', target) || [];
      params[parameterIndex] = token;
      Reflect.defineMetadata('singular:inject:params', params, target);
    } else {
      // Property decorator
      Reflect.defineMetadata('singular:inject:prop', token, target, key);
    }
  };
}

/**
 * Decorator for optional dependencies
 */
export function Optional() {
  return function(target: any, key: string | symbol, parameterIndex?: number) {
    if (typeof parameterIndex === 'number') {
      // Parameter decorator
      const optionals = Reflect.getMetadata('singular:inject:optional', target) || [];
      optionals[parameterIndex] = true;
      Reflect.defineMetadata('singular:inject:optional', optionals, target);
    } else {
      // Property decorator
      Reflect.defineMetadata('singular:inject:optional', true, target, key);
    }
  };
}
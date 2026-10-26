/**
 * Token type for dependency injection
 */
export type Token<T = any> = {
  new (...args: any[]): T;
} | string | symbol;

/**
 * Interface for dependency injection provider options
 */
export interface ProviderOptions<T = any> {
  provide: Token<T>;
  useClass?: new (...args: any[]) => T;
  useValue?: T;
  useFactory?: (...args: any[]) => T;
  deps?: Token[];
  scope?: 'singleton' | 'transient' | 'request';
}

/**
 * Provider type that can be registered with the injector
 */
export type Provider<T = any> = ProviderOptions<T> | Token<T>;

/**
 * Options for configuring an injectable
 */
export interface InjectableOptions {
  scope?: 'singleton' | 'transient' | 'request';
  providedIn?: 'root' | 'platform' | 'any' | null;
}

/**
 * Injection flags
 */
export const InjectionFlags = {
  Optional: Symbol('OPTIONAL_TOKEN'),
  SkipSelf: Symbol('SKIP_SELF_TOKEN'),
  Self: Symbol('SELF_TOKEN')
};
import { Token, Provider, ProviderOptions, InjectionFlags } from './interfaces';

/**
 * Core injector implementation
 */
export class Injector {
  private static rootInjector: Injector;
  private instances = new Map<Token, any>();
  private providers = new Map<Token, ProviderOptions>();

  constructor(
    providerOrParent?: Injector | Provider[],
    providers: Provider[] = []
  ) {
    if (providerOrParent instanceof Injector) {
      this.parentInjector = providerOrParent;
      providers.forEach(provider => this.registerProvider(provider));
      return;
    }

    (providerOrParent ?? []).forEach(provider => this.registerProvider(provider));
  }

  private parentInjector?: Injector;

  /**
   * Get or create the root injector
   */
  static getRootInjector(): Injector {
    if (!Injector.rootInjector) {
      Injector.rootInjector = new Injector();
    }
    return Injector.rootInjector;
  }

  /**
   * Get an instance of a dependency
   */
  get<T>(token: Token<T>, options: { optional?: boolean; skipSelf?: boolean; self?: boolean } = {}): T {
    const { optional = false, skipSelf = false, self = false } = options;

    // Check if we should skip this injector
    if (skipSelf) {
      return this.parentInjector?.get(token, { optional, self }) as T;
    }

    // Try to get existing instance
    const instance = this.instances.get(token);
    if (instance) {
      return instance;
    }

    // Get provider
    const provider = this.providers.get(token);
    
    if (!provider) {
      // If self only, don't check parent
      if (self) {
        if (optional) return undefined as T;
        throw new Error(`No provider for ${String(token)}`);
      }

      // Check parent injector
      if (this.parentInjector) {
        return this.parentInjector.get(token, { optional });
      }

      if (optional) {
        return undefined as T;
      }

      throw new Error(`No provider for ${String(token)}`);
    }

    // Create instance
    const value = this.createInstance(provider);
    
    // Cache instance if singleton
    if (provider.scope !== 'transient') {
      this.instances.set(token, value);
    }

    return value;
  }

  /**
   * Register a provider with this injector
   */
  private registerProvider(provider: Provider) {
    const normalizedProvider = this.normalizeProvider(provider);
    this.providers.set(normalizedProvider.provide, normalizedProvider);
  }

  /**
   * Create an instance from a provider
   */
  private createInstance<T>(provider: ProviderOptions<T>): T {
    if ('useValue' in provider) {
      return provider.useValue as T;
    }

    if ('useFactory' in provider && provider.useFactory) {
      const deps = provider.deps?.map(dep => this.get(dep)) || [];
      return provider.useFactory(...deps);
    }

    const target = (provider.useClass ?? provider.provide) as (new (...args: any[]) => T) | undefined;
    if (typeof target === 'string' || typeof target === 'symbol' || typeof target !== 'function') {
      throw new Error(`Cannot instantiate token ${String(target)}`);
    }

    // Get dependencies
    const params = this.getInjectedParams(target);
    const args = params.map((param: { token: Token; optional: boolean }) => this.get(param.token, { optional: param.optional }));

    return new target(...args);
  }

  /**
   * Get injected parameters for a class
   */
  private getInjectedParams(target: any): { token: Token; optional: boolean }[] {
    const metadata = Reflect.getMetadata('singular:inject:params', target) || [];
    const optionalMetadata = Reflect.getMetadata('singular:inject:optional', target) || [];

    return metadata
      .map((token: Token | undefined, index: number) => ({
        token,
        optional: !!optionalMetadata[index]
      }))
      .filter((param: { token?: Token; optional: boolean }): param is { token: Token; optional: boolean } => !!param.token);
  }

  /**
   * Normalize provider to ProviderOptions
   */
  private normalizeProvider(provider: Provider): ProviderOptions {
    if (this.isProviderOptions(provider)) {
      return provider;
    }

    if (typeof provider === 'function') {
      return {
        provide: provider,
        useClass: provider as new (...args: any[]) => any
      };
    }

    return {
      provide: provider,
      useClass: undefined
    };
  }

  /**
   * Type guard for ProviderOptions
   */
  private isProviderOptions(provider: Provider): provider is ProviderOptions {
    return typeof provider === 'object' && 'provide' in provider;
  }
}
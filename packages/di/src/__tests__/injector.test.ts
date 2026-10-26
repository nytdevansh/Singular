import { describe, it, expect } from 'vitest';
import { Injectable, Injector } from '..';

describe('Dependency Injection', () => {
  // Sample services
  @Injectable()
  class UserService {
    getUser() {
      return { id: 1, name: 'Test User' };
    }
  }

  @Injectable()
  class AuthService {
    constructor(private userService: UserService) {}

    getCurrentUser() {
      return this.userService.getUser();
    }
  }

  it('should inject dependencies correctly', () => {
    const injector = new Injector([UserService, AuthService]);
    const authService = injector.get(AuthService);
    
    expect(authService).toBeInstanceOf(AuthService);
    expect(authService.getCurrentUser()).toEqual({ id: 1, name: 'Test User' });
  });

  it('should handle value providers', () => {
    const config = { apiUrl: 'http://test.com' };
    const injector = new Injector([
      { provide: 'CONFIG', useValue: config },
      UserService,
      AuthService
    ]);

    expect(injector.get('CONFIG')).toBe(config);
  });

  it('should create singletons by default', () => {
    const injector = new Injector([UserService]);
    const instance1 = injector.get(UserService);
    const instance2 = injector.get(UserService);
    
    expect(instance1).toBe(instance2);
  });

  it('should throw when dependency is not found', () => {
    const injector = new Injector([]);
    expect(() => injector.get(UserService)).toThrow();
  });
});
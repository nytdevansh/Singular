# @singular/di

Dependency Injection system for the Singular framework. This package provides a lightweight yet powerful DI container with support for hierarchical injection, decorators, and various injection scopes.

## Features

- Hierarchical dependency injection
- Decorator-based injection (@Injectable, @Inject)
- Support for different injection scopes (singleton, transient, request)
- Factory providers and value providers
- Optional dependencies
- TypeScript-first design

## Installation

```bash
npm install @singular/di
```

## Basic Usage

```typescript
import { Injectable, Injector } from '@singular/di';

// Define an injectable service
@Injectable()
class UserService {
  getUser(id: string) {
    return { id, name: 'John Doe' };
  }
}

// Use the service in another injectable
@Injectable()
class UserController {
  constructor(private userService: UserService) {}

  getCurrentUser() {
    return this.userService.getUser('current');
  }
}

// Create an injector and get instances
const injector = new Injector([UserService, UserController]);
const controller = injector.get(UserController);
console.log(controller.getCurrentUser());
```

## Advanced Usage

### Custom Providers

```typescript
import { Injector } from '@singular/di';

// Value provider
const injector = new Injector([
  {
    provide: 'CONFIG',
    useValue: {
      apiUrl: 'https://api.example.com'
    }
  }
]);

// Factory provider
const injector = new Injector([
  {
    provide: DatabaseService,
    useFactory: (config) => new DatabaseService(config.url),
    deps: ['CONFIG']
  }
]);
```

### Injection Scopes

```typescript
@Injectable({ scope: 'singleton' }) // Default
class GlobalService {}

@Injectable({ scope: 'transient' })
class NewInstanceService {}

@Injectable({ scope: 'request' })
class RequestScopedService {}
```

### Optional Dependencies

```typescript
@Injectable()
class OptionalDependencyService {
  constructor(
    @Inject('OPTIONAL_SERVICE') @Optional() private optService?: SomeService
  ) {}
}
```

## API Reference

### Decorators

- `@Injectable(options?: InjectableOptions)`
- `@Inject(token: Token)`
- `@Optional()`

### Classes

- `Injector`
  - `get<T>(token: Token<T>, options?): T`
  - `static getRootInjector(): Injector`

### Interfaces

- `Token<T>`
- `Provider<T>`
- `ProviderOptions<T>`
- `InjectableOptions`

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License
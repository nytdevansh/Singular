# 🔷 Singular

**Singular** is a lightweight, reactive JavaScript UI framework designed to be an approachable and high-performance alternative to React — without the overhead.

> ⚡ Simple syntax • 🔁 Fine-grained reactivity • 🧠 Beginner-friendly • 🛠️ Modern tooling

[![npm version](https://badge.fury.io/js/singular-framework.svg)](https://www.npmjs.com/package/singular-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/singular-framework)](https://bundlephobia.com/result?p=singular-framework)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

---

## 🌟 Features

- ✅ **Reactive by Design** - Fine-grained reactivity with `useState()`, `effect()`, and `computed()`
- ✅ **Zero Dependencies** - Minimal bundle size (~8KB gzipped)
- ✅ **Component System** - Functional components with props, context, and lifecycle
- ✅ **Built-in Router** - Client-side routing with nested routes and guards
- ✅ **State Management** - Global stores with persistence and middleware
- ✅ **Modern Syntax** - Clean API, no JSX required (but supported via plugins)
- ✅ **TypeScript First** - Full TypeScript support with comprehensive type definitions
- ✅ **Developer Experience** - HMR, devtools integration, and extensive debugging

---

## 📦 Installation

```bash
npm install singular-framework
# or
yarn add singular-framework
# or  
pnpm add singular-framework
```

---

## 🚀 Quick Start

### Basic Counter Example

```typescript
import { createApp, createElement, useState } from 'singular-framework';

function Counter() {
  const [count, setCount] = useState(0);
  
  return createElement('div', { className: 'counter' },
    createElement('h1', {}, () => `Count: ${count()}`),
    createElement('button', {
      onclick: () => setCount(count() + 1)
    }, 'Increment'),
    createElement('button', {
      onclick: () => setCount(count() - 1)  
    }, 'Decrement'),
    createElement('button', {
      onclick: () => setCount(0)
    }, 'Reset')
  );
}

createApp(Counter).mount('#app');
```

### Reactive Todo App

```typescript
import { createElement, useState, For } from 'singular-framework';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    if (input().trim()) {
      setTodos([...todos(), { 
        id: Date.now(), 
        text: input().trim(), 
        completed: false 
      }]);
      setInput('');
    }
  };
  
  const toggleTodo = (id) => {
    setTodos(todos().map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  return createElement('div', { className: 'todo-app' },
    createElement('h1', {}, 'Todo List'),
    createElement('input', {
      type: 'text',
      value: input,
      oninput: (e) => setInput(e.target.value),
      placeholder: 'Add a todo...'
    }),
    createElement('button', { onclick: addTodo }, 'Add'),
    For({
      each: todos,
      children: (todo) => createElement('div', {
        className: () => `todo ${todo.completed ? 'completed' : ''}`
      },
        createElement('span', {}, todo.text),
        createElement('button', {
          onclick: () => toggleTodo(todo.id)
        }, todo.completed ? 'Undo' : 'Complete')
      )
    })
  );
}
```

---

## 🔄 Reactivity System

Singular's reactivity is inspired by SolidJS and Svelte, providing fine-grained updates:

```typescript
import { useState, effect, computed, batch } from 'singular-framework';

// Reactive signals
const [count, setCount] = useState(0);
const [multiplier, setMultiplier] = useState(2);

// Computed values
const doubled = computed(() => count() * 2);
const result = computed(() => count() * multiplier());

// Effects for side effects
effect(() => {
  console.log(`Count: ${count()}, Doubled: ${doubled()}`);
});

// Batch updates for performance
batch(() => {
  setCount(10);
  setMultiplier(3);
  // Both updates happen together, effect runs once
});
```

---

## 🧩 Component System

### Functional Components

```typescript
import { createElement, useState, createContext } from 'singular-framework';

// Context for dependency injection
const ThemeContext = createContext('light');

function Button({ children, variant = 'primary', onclick }) {
  const theme = ThemeContext.Consumer();
  
  return createElement('button', {
    className: `btn btn-${variant} theme-${theme()}`,
    onclick
  }, children);
}

function App() {
  const [theme, setTheme] = useState('light');
  
  return ThemeContext.Provider({ 
    value: theme,
    children: [
      createElement('div', { className: 'app' },
        Button({ 
          children: 'Toggle Theme',
          onclick: () => setTheme(theme() === 'light' ? 'dark' : 'light')
        }),
        Button({ 
          children: 'Click me!',
          variant: 'secondary',
          onclick: () => alert('Hello!')
        })
      )
    ]
  });
}
```

### Conditional Rendering & Lists

```typescript
import { Show, For } from 'singular-framework';

function UserList({ users, loading }) {
  return createElement('div', {},
    Show({
      when: loading,
      children: () => createElement('div', {}, 'Loading...'),
      fallback: () => For({
        each: users,
        children: (user) => createElement('div', { key: user.id },
          createElement('h3', {}, user.name),
          createElement('p', {}, user.email)
        )
      })
    })
  );
}
```

---

## 🛣️ Routing

```typescript
import { Router, Link, navigation } from 'singular-framework';

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/users/:id', component: UserPage },
  { 
    path: '/admin', 
    component: AdminPage,
    guards: [(to, from) => checkAuth()] 
  }
];

function App() {
  return createElement('div', {},
    createElement('nav', {},
      Link({ to: '/', children: ['Home'] }),
      Link({ to: '/about', children: ['About'] }),
      Link({ to: '/users/123', children: ['User Profile'] })
    ),
    Router({ 
      routes,
      fallback: () => createElement('div', {}, '404 - Page Not Found')
    })
  );
}

// Programmatic navigation
navigation.push('/users/456');
navigation.replace('/dashboard');
```

---

## 🗄️ State Management

### Global Stores

```typescript
import { createStore, derived, persist } from 'singular-framework';

// Create stores
const userStore = createStore(null);
const settingsStore = persist(
  createStore({ theme: 'light', language: 'en' }),
  'app-settings'
);

// Derived stores
const isLoggedIn = derived([userStore], (user) => user !== null);
const greeting = derived(
  [userStore, settingsStore], 
  (user, settings) => 
    user ? `Hello ${user.name}! Theme: ${settings.theme}` : 'Please log in'
);

// Actions
export const authActions = {
  login: (user) => userStore.set(user),
  logout: () => userStore.set(null),
  updateSettings: (updates) => settingsStore.update(s => ({ ...s, ...updates }))
};

// Use in components
function Header() {
  return createElement('header', {},
    createElement('h1', {}, greeting),
    Show({
      when: isLoggedIn,
      children: () => createElement('button', {
        onclick: authActions.logout
      }, 'Logout')
    })
  );
}
```

---

## 📦 Project Structure

```
singular/
├── src/
│   ├── index.ts           # Main exports
│   ├── reactivity.ts      # Reactive system (useState, effect, computed)
│   ├── createElement.ts   # DOM creation & reactive bindings
│   ├── render.ts          # App mounting & rendering
│   ├── components.ts      # Component utilities (Show, For, Context)
│   ├── router.ts          # Client-side routing
│   └── store.ts           # State management
│
├── examples/
│   ├── counter/           # Basic counter example
│   ├── todo-app/          # Todo list with routing
│   └── dashboard/         # Complex app with store
│
├── tests/                 # Test suites
├── docs/                  # Documentation
└── dist/                  # Built packages
```

---

## 🛠️ Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/singular-framework/core.git
cd singular
pnpm install
```

### 2. Build Core Package

```bash
pnpm build
```

### 3. Development Mode

```bash
pnpm dev
```

### 4. Run Examples

```bash
pnpm --filter counter-app dev
pnpm --filter todo-app dev
```

### 5. Testing

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:ui           # UI test runner
```

---

## 📈 Roadmap

### ✅ Completed (v1.0.0-alpha)
- [x] **Core Reactivity** - `useState()`, `effect()`, `computed()`
- [x] **Component System** - Functional components with props
- [x] **Enhanced createElement** - Reactive attributes and event handling  
- [x] **Router** - Client-side routing with guards and parameters
- [x] **State Management** - Global stores with persistence
- [x] **Control Flow** - `Show`, `For` components
- [x] **Context API** - Dependency injection system

### 🚧 In Progress (v1.1.0)
- [ ] **JSX Support** - Babel plugin for JSX compilation
- [ ] **SSR** - Server-side rendering capabilities
- [ ] **Devtools** - Browser extension for debugging
- [ ] **Animation System** - Built-in transitions and animations
- [ ] **Forms** - Form handling utilities and validation

### 🔮 Future (v2.0.0)
- [ ] **CLI Tool** - `create-singular-app` scaffolding
- [ ] **Plugin System** - Extensible architecture
- [ ] **Static Site Generator** - Like Astro/Next.js
- [ ] **Mobile Renderer** - React Native-style mobile support
- [ ] **Performance Profiler** - Built-in performance monitoring

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

```bash
# Fork the repo and clone
git clone https://github.com/your-username/singular.git
cd singular

# Install dependencies  
pnpm install

# Create feature branch
git checkout -b feature/awesome-feature

# Make changes and test
pnpm test

# Build and verify
pnpm build

# Submit PR
```

---

## 📝 License

MIT © [Singular Core Team](https://github.com/singular-framework)

---

## 🔗 Links

- **Documentation**: [https://singular-framework.dev](https://singular-framework.dev)
- **GitHub**: [https://github.com/singular-framework/core](https://github.com/singular-framework/core](https://github.com/nytdevansh/Singular)  
- **NPM**: [https://www.npmjs.com/package/singular-framework](https://www.npmjs.com/package/singular-framework)
- **Discord**: [https://discord.gg/singular](https://discord.gg/yXv43D9B)
- **Twitter**: [@SingularFramework](https://twitter.com/SingularFramework)

---

**Made with ❤️ by the Singular community**

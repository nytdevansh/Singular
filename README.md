# 🔷 Singular

**A lightweight, reactive TypeScript UI framework with advanced animation capabilities built-in**

[![npm version](https://badge.fury.io/js/singular-framework.svg)](https://www.npmjs.com/package/singular-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/singular-framework)](https://bundlephobia.com/result?p=singular-framework)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

⚡ Simple • 🔁 Reactive • 🎨 Animated • 🧠 Powerful • 📘 Type-Safe

[Live Demo](https://singular-counter-app.vercel.app/) • [Documentation](https://singular-framework.dev) • [Discord](https://discord.gg/yXv43D9B)

</div>

---

## 🎯 Why Singular?

Singular is designed for developers who want **React's developer experience** with **better performance** and **built-in animations** — without the complexity of a virtual DOM. Built with **TypeScript from the ground up**, Singular provides excellent type safety and IntelliSense support.

```typescript
// This is all you need for a reactive, animated counter
import { createApp, createElement, useState } from 'singular-framework';
import { animateOnClick } from 'singular-framework/animate';

function Counter() {
  const [count, setCount] = useState(0);
  
  return createElement('div', {},
    createElement('h1', {}, () => `Count: ${count()}`),
    createElement('button', {
      onclick: () => setCount(count() + 1),
      ref: el => animateOnClick(el, {
        transform: ['scale(1)', 'scale(0.95)'],
        duration: 100
      })
    }, 'Click me!')
  );
}

createApp(Counter).mount('#app');
```

---

## ✨ Key Features

### 🔄 **Fine-Grained Reactivity**
No virtual DOM, no unnecessary re-renders. Updates are surgical and precise, inspired by SolidJS.

### 🎨 **Animation System Built-In**
Scroll animations, hover effects, click feedback, loops, sequences — all included out of the box.

### ⚡ **Tiny Bundle Size**
~12KB gzipped with the full animation system. Compare that to React's 42KB (without animations).

### 📘 **TypeScript-First**
Built entirely in TypeScript with comprehensive type definitions. Get full IntelliSense and type safety throughout your application.

### 🧩 **Modern Component Architecture**
Functional components, context API, lifecycle hooks, and control flow primitives.

### 🛣️ **Client-Side Router**
Built-in routing with nested routes, guards, and animated page transitions.

### 🎯 **Developer Experience**
TypeScript-first with full type definitions, HMR support, comprehensive devtools, and extensive documentation.

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

### 1. Basic Application

```typescript
import { createApp, createElement, useState } from 'singular-framework';

function App() {
  const [message, setMessage] = useState('Hello Singular!');
  
  return createElement('div', { className: 'app' },
    createElement('h1', {}, () => message()),
    createElement('button', {
      onclick: () => setMessage('Welcome to reactive programming!')
    }, 'Change Message')
  );
}

createApp(App).mount('#app');
```

### 2. With Type Safety

```typescript
import { createApp, createElement, useState } from 'singular-framework';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState<string>('');
  
  const addTodo = () => {
    const newTodo: Todo = {
      id: Date.now(),
      text: input(),
      completed: false
    };
    setTodos([...todos(), newTodo]);
    setInput('');
  };
  
  return createElement('div', { className: 'todo-app' },
    createElement('input', {
      type: 'text',
      value: () => input(),
      oninput: (e: Event) => setInput((e.target as HTMLInputElement).value)
    }),
    createElement('button', { onclick: addTodo }, 'Add Todo'),
    ...todos().map(todo => 
      createElement('div', { key: todo.id }, todo.text)
    )
  );
}

createApp(TodoApp).mount('#app');
```

### 3. With Animations

```typescript
import { createApp, createElement } from 'singular-framework';
import { animateOnScroll, animateOnHover } from 'singular-framework/animate';

interface CardProps {
  title: string;
  content: string;
}

function AnimatedCard({ title, content }: CardProps) {
  return createElement('div', {
    className: 'card',
    ref: (el: HTMLElement) => {
      // Animate in on scroll
      animateOnScroll(el, {
        opacity: ['0', '1'],
        transform: ['translateY(30px)', 'translateY(0)'],
        duration: 600,
        once: true
      });
      
      // Add hover effect
      animateOnHover(el, {
        transform: ['scale(1)', 'scale(1.02)'],
        duration: 200,
        reverseOnLeave: true
      });
    }
  },
    createElement('h2', {}, title),
    createElement('p', {}, content)
  );
}
```

---

## 🎨 Animation System

Singular's animation system is one of its killer features. No external libraries needed.

### Animation Types

| Function | Description | Use Case |
|----------|-------------|----------|
| `animate()` | Basic animation | Manual control |
| `animateOnScroll()` | Trigger on viewport entry | Fade-in effects |
| `animateOnHover()` | Mouse enter/leave | Interactive feedback |
| `animateOnClick()` | Click feedback | Button presses |
| `animateLoop()` | Continuous loop | Loading spinners |
| `animateSequence()` | Chained animations | Complex transitions |
| `animateStagger()` | Multiple elements with delay | List animations |

### Animation Examples

```typescript
import { 
  animate, 
  animateSequence, 
  animateStagger,
  fadeIn,
  bounce
} from 'singular-framework/animate';

// Fade in element
fadeIn(element, 400);

// Bounce effect
bounce(element, 15, 600); // 15px intensity, 600ms duration

// Chain animations
animateSequence(element, [
  { transform: ['translateX(0)', 'translateX(100px)'], duration: 500 },
  { transform: ['scale(1)', 'scale(1.2)'], duration: 300 },
  { opacity: ['1', '0'], duration: 200 }
]);

// Stagger animation for lists
const cards = document.querySelectorAll('.card');
animateStagger(cards, {
  opacity: ['0', '1'],
  transform: ['translateY(20px)', 'translateY(0)'],
  duration: 400
}, 100); // 100ms delay between each
```

### Built-in Easing Functions

```typescript
const easings = {
  linear,
  easeOutCubic,
  easeInOutQuad,
  easeOutQuart,
  easeInCubic,
  easeInOutCubic,
  easeOutBack
};
```

---

## 🔄 Reactivity System

### Signals

```typescript
import { useState, effect, computed } from 'singular-framework';

const [count, setCount] = useState<number>(0);
const [multiplier, setMultiplier] = useState<number>(2);

// Computed values
const result = computed(() => count() * multiplier());

// Side effects
effect(() => {
  console.log(`Result: ${result()}`);
});

// Batch updates
import { batch } from 'singular-framework';
batch(() => {
  setCount(10);
  setMultiplier(5);
  // Effect runs once with both updates
});
```

### Component State

```typescript
interface Todo {
  id: number;
  text: string;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState<string>('');
  
  const addTodo = () => {
    setTodos([...todos(), { id: Date.now(), text: input() }]);
    setInput('');
  };
  
  return createElement('div', {},
    createElement('input', {
      value: () => input(),
      oninput: (e: Event) => setInput((e.target as HTMLInputElement).value)
    }),
    createElement('button', { onclick: addTodo }, 'Add'),
    ...todos().map(todo => 
      createElement('div', { key: todo.id }, todo.text)
    )
  );
}
```

---

## 🧩 Components

### Functional Components with Props

```typescript
interface ButtonProps {
  children: string;
  variant?: 'primary' | 'secondary';
  onclick?: () => void;
}

function Button({ children, variant = 'primary', onclick }: ButtonProps) {
  return createElement('button', {
    className: `btn btn-${variant}`,
    onclick
  }, children);
}

function App() {
  return createElement('div', {},
    Button({ 
      children: 'Primary Button',
      onclick: () => alert('Clicked!')
    }),
    Button({ 
      children: 'Secondary',
      variant: 'secondary',
      onclick: () => console.log('Secondary clicked')
    })
  );
}
```

### Context API

```typescript
import { createContext } from 'singular-framework';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<Theme>('light');

function ThemedButton() {
  const theme = ThemeContext.Consumer();
  
  return createElement('button', {
    className: () => `btn theme-${theme()}`
  }, 'Themed Button');
}

function App() {
  const [theme, setTheme] = useState<Theme>('light');
  
  return ThemeContext.Provider({
    value: theme,
    children: [
      ThemedButton(),
      createElement('button', {
        onclick: () => setTheme(theme() === 'light' ? 'dark' : 'light')
      }, 'Toggle Theme')
    ]
  });
}
```

### Control Flow

```typescript
import { Show, For } from 'singular-framework';

interface Item {
  id: number;
  name: string;
}

// Conditional rendering
Show({
  when: () => isLoggedIn(),
  children: [createElement('div', {}, 'Welcome back!')]
});

// List rendering
For({
  each: () => items(),
  children: (item: Item) => createElement('div', {}, item.name)
});
```

---

## 🛣️ Router

```javascript
import { Router, Link } from 'singular-framework';

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { 
    path: '/user/:id', 
    component: UserPage,
    beforeEnter: (to, from) => {
      // Route guard
      return isAuthenticated();
    }
  }
];

function App() {
  return createElement('div', {},
    createElement('nav', {},
      Link({ to: '/', children: ['Home'] }),
      Link({ to: '/about', children: ['About'] })
    ),
    Router({ routes })
  );
}
```

---

## 📊 Performance

### Bundle Size Comparison

| Framework | Core Size | With Animations |
|-----------|-----------|-----------------|
| **Singular** | **~8KB** | **~12KB** |
| React | ~42KB | +external lib needed |
| Vue | ~35KB | +external lib needed |
| Svelte | ~10KB | +external lib needed |

### Optimizations

- ✅ **No Virtual DOM** - Direct DOM updates
- ✅ **Fine-grained reactivity** - Only affected nodes update
- ✅ **Throttled scroll events** - 60fps guaranteed
- ✅ **Intersection Observer** - Efficient scroll animations
- ✅ **RequestAnimationFrame** - Smooth animations
- ✅ **Automatic cleanup** - No memory leaks

---

## 📁 Project Structure

```
singular/
├── src/
│   ├── index.ts           # Main exports
│   ├── reactivity.ts      # useState, effect, computed
│   ├── createElement.ts   # DOM creation & bindings
│   ├── render.ts          # App mounting
│   ├── components.ts      # Show, For, Context
│   ├── router.ts          # Client-side routing
│   ├── store.ts           # State management
│   └── animate.ts         # Animation system
│
├── examples/
│   ├── counter-app/       # Full demo with animations
│   ├── todo-app/          # Todo list with routing
│   └── dashboard/         # Complex app example
│
├── tests/                 # Test suites
└── docs/                  # Documentation
```

---

## 🛠️ Development

### Setup

```bash
git clone https://github.com/singular-framework/core.git
cd singular
pnpm install
pnpm build
```

### Run Examples

```bash
pnpm --filter counter-app dev    # Animation demo
pnpm --filter todo-app dev       # Todo app
```

### Testing

```bash
pnpm test              # Run tests
pnpm test:watch        # Watch mode
pnpm test:ui           # UI runner
```

---

## 🗺️ Roadmap

### ✅ v1.0.0 (Current)
- [x] Core reactivity system
- [x] Component architecture
- [x] Advanced animation system
- [x] Router with guards
- [x] Context API
- [x] Theme system
- [x] Performance optimizations

### 🚧 v1.1.0 (In Progress)
- [ ] JSX support via Babel plugin
- [ ] Server-side rendering (SSR)
- [ ] Browser devtools extension
- [ ] Form handling utilities
- [ ] Gesture animations (touch/swipe)

### 🔮 v2.0.0 (Future)
- [ ] `create-singular-app` CLI
- [ ] Plugin system
- [ ] Static site generation
- [ ] Mobile renderer (React Native style)
- [ ] WebGL 3D animations

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Singular.git
cd singular

# Install dependencies
pnpm install

# Create feature branch
git checkout -b feature/awesome-feature

# Make changes, test, and build
pnpm test
pnpm build

# Test in example apps
pnpm --filter counter-app dev

# Submit PR
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📝 License

MIT © [Singular Core Team](https://github.com/singular-framework)

---

## 🔗 Resources

- 📚 [Documentation](https://singular-framework.dev)
- 🎮 [Live Demo](https://singular-counter-app.vercel.app/)
- 📦 [NPM Package](https://www.npmjs.com/package/singular-framework)
- 💬 [Discord Community](https://discord.gg/yXv43D9B)
- 🐦 [Twitter](https://twitter.com/SingularFramework)
- 🐛 [Issue Tracker](https://github.com/singular-framework/core/issues)

---

## 🌟 Show Your Support

If Singular helps you build better apps, give us a ⭐️ on GitHub!

---

**Built with ❤️ and ✨ by the Singular community**

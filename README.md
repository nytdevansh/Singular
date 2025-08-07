# 🔷 Singular

**Singular** is a lightweight, reactive JavaScript UI framework designed to be an approachable and high-performance alternative to React — with advanced animation capabilities built-in.

> ⚡ Simple syntax • 🔁 Fine-grained reactivity • 🎨 Advanced animations • 🧠 Beginner-friendly • 🛠️ Modern tooling

[![npm version](https://badge.fury.io/js/singular-framework.svg)](https://www.npmjs.com/package/singular-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/singular-framework)](https://bundlephobia.com/result?p=singular-framework)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

---

## 🌟 Features

- ✅ **Reactive by Design** - Fine-grained reactivity with `useState()`, `effect()`, and `computed()`
- ✅ **Advanced Animation System** - Built-in scroll, hover, click, loop, and sequence animations
- ✅ **Zero Dependencies** - Minimal bundle size (~12KB gzipped with animations)
- ✅ **Component System** - Functional components with props, context, and lifecycle
- ✅ **Built-in Router** - Client-side routing with nested routes and guards
- ✅ **State Management** - Global stores with persistence and middleware
- ✅ **Modern Syntax** - Clean API, no JSX required (but supported via plugins)
- ✅ **TypeScript First** - Full TypeScript support with comprehensive type definitions
- ✅ **Developer Experience** - HMR, devtools integration, and extensive debugging
- ✅ **Performance Optimized** - Throttled scroll handling and smooth 60fps animations

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

### Basic Counter with Animations

```javascript
import { createApp, createElement, useState } from 'singular-framework';
import { animate, animateOnHover, animateOnClick } from 'singular-framework/animate';

function AnimatedCounter() {
  const [count, setCount] = useState(0);
  
  const handleIncrement = () => {
    setCount(count() + 1);
    
    // Animate counter change
    const counterEl = document.getElementById('counter');
    animate(counterEl, {
      transform: ['scale(1)', 'scale(1.2)'],
      duration: 200,
      easing: 'easeOutCubic',
      onComplete: () => {
        animate(counterEl, {
          transform: ['scale(1.2)', 'scale(1)'],
          duration: 200,
          easing: 'easeOutCubic'
        });
      }
    });
  };
  
  return createElement('div', { className: 'counter' },
    createElement('h1', { 
      id: 'counter',
      ref: (el) => {
        // Add hover animation
        animateOnHover(el, {
          transform: ['scale(1)', 'scale(1.05)'],
          duration: 250,
          reverseOnLeave: true
        });
      }
    }, () => `Count: ${count()}`),
    
    createElement('button', {
      onclick: handleIncrement,
      ref: (el) => {
        // Add click animation
        animateOnClick(el, {
          transform: ['scale(1)', 'scale(0.95)'],
          duration: 100,
          easing: 'easeOutCubic'
        });
      }
    }, 'Increment'),
    
    createElement('button', {
      onclick: () => setCount(count() - 1)  
    }, 'Decrement'),
    
    createElement('button', {
      onclick: () => setCount(0)
    }, 'Reset')
  );
}

createApp(AnimatedCounter).mount('#app');
```

---

## 🎨 Animation System

Singular includes a powerful animation system with multiple animation types:

### Core Animation Functions

```javascript
import { 
  animate, 
  animateOnScroll, 
  animateOnHover, 
  animateOnClick,
  animateLoop,
  animateSequence,
  animateStagger,
  fadeIn,
  fadeOut,
  bounce
} from 'singular-framework/animate';

// Basic animation
animate(element, {
  opacity: ['0', '1'],
  transform: ['translateY(50px)', 'translateY(0px)'],
  duration: 600,
  easing: 'easeOutCubic',
  delay: 200,
  onComplete: () => console.log('Animation complete!')
});

// Scroll-triggered animations
animateOnScroll(element, {
  opacity: ['0', '1'],
  transform: ['translateY(30px)', 'translateY(0px)'],
  duration: 500,
  once: true,
  threshold: 0.1
});

// Hover animations with reverse
animateOnHover(element, {
  transform: ['scale(1)', 'scale(1.1)'],
  duration: 300,
  reverseOnLeave: true
});

// Loop animations
animateLoop(element, {
  transform: ['rotate(0deg)', 'rotate(360deg)'],
  duration: 2000,
  easing: 'linear'
});

// Sequence animations (chained)
animateSequence(element, [
  {
    transform: ['translateX(0px)', 'translateX(100px)'],
    duration: 500,
    easing: 'easeOutCubic'
  },
  {
    transform: ['translateX(100px)', 'translateX(0px)'],
    duration: 500,
    easing: 'easeOutCubic'
  }
]);

// Stagger animations (multiple elements)
const elements = document.querySelectorAll('.card');
animateStagger(elements, {
  opacity: ['0', '1'],
  transform: ['translateY(20px)', 'translateY(0px)'],
  duration: 400,
  easing: 'easeOutCubic'
}, 100); // 100ms delay between each element
```

### Advanced Animation Features

```javascript
// Built-in easing functions
const easings = {
  linear: t => t,
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeOutQuart: t => 1 - Math.pow(1 - t, 4),
  easeInCubic: t => t * t * t,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)
};

// Utility animations
fadeIn(element, 400);
fadeOut(element, 400);
bounce(element, 15, 600); // bounce with 15px intensity over 600ms

// Timeline animations for complex orchestration
import { createTimeline } from 'singular-framework/animate';

const timeline = createTimeline()
  .add(element1, { opacity: ['0', '1'], duration: 500 }, 0)
  .add(element2, { transform: ['scale(0)', 'scale(1)'], duration: 400 }, 200)
  .add(element3, { opacity: ['0', '1'], duration: 300 }, 400)
  .play();
```

### Sliding Logo Navigation

```javascript
// Automatic sliding logo that appears on scroll
function setupSlidingLogo(logoElement, containerElement) {
  const floatingLogo = logoElement.cloneNode(true);
  floatingLogo.id = 'floating-logo';
  
  // Position in top-left corner
  Object.assign(floatingLogo.style, {
    position: 'fixed',
    top: '15px',
    left: '20px',
    width: '50px',
    height: 'auto',
    zIndex: '1000',
    opacity: '0',
    transform: 'scale(0.8) translateX(-100px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  });
  
  document.body.appendChild(floatingLogo);
  
  // Show/hide on scroll
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const logoRect = containerElement.getBoundingClientRect();
    const isLogoOutOfView = logoRect.bottom < 0;

    if (isLogoOutOfView && scrollY > 100) {
      floatingLogo.style.opacity = '1';
      floatingLogo.style.transform = 'scale(1) translateX(0)';
    } else {
      floatingLogo.style.opacity = '0';
      floatingLogo.style.transform = 'scale(0.8) translateX(-100px)';
    }
  });
  
  // Click to scroll to top
  floatingLogo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
```

---

## 🔄 Reactivity System

Singular's reactivity is inspired by SolidJS and Svelte, providing fine-grained updates:

```javascript
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

## 🧩 Component System with Animations

### Animated Functional Components

```javascript
import { createElement, useState, createContext } from 'singular-framework';
import { animateOnScroll, animateOnHover } from 'singular-framework/animate';

// Context for dependency injection
const ThemeContext = createContext('light');

function AnimatedButton({ children, variant = 'primary', onclick }) {
  const theme = ThemeContext.Consumer();
  
  return createElement('button', {
    className: `btn btn-${variant} theme-${theme()}`,
    onclick,
    ref: (el) => {
      // Add hover animation
      animateOnHover(el, {
        transform: ['scale(1)', 'scale(1.05) translateY(-2px)'],
        duration: 200,
        reverseOnLeave: true
      });
    }
  }, children);
}

function AnimatedCard({ children, delay = 0 }) {
  return createElement('div', {
    className: 'card',
    ref: (el) => {
      // Animate in on scroll
      animateOnScroll(el, {
        opacity: ['0', '1'],
        transform: ['translateY(30px) scale(0.95)', 'translateY(0px) scale(1)'],
        duration: 600,
        delay,
        once: true,
        threshold: 0.1
      });
    }
  }, children);
}

function App() {
  const [theme, setTheme] = useState('light');
  
  return ThemeContext.Provider({ 
    value: theme,
    children: [
      createElement('div', { className: 'app' },
        AnimatedCard({ 
          delay: 0,
          children: [
            createElement('h2', {}, 'Welcome to Singular'),
            createElement('p', {}, 'A framework with built-in animations')
          ]
        }),
        AnimatedCard({ 
          delay: 200,
          children: [
            AnimatedButton({ 
              children: 'Toggle Theme',
              onclick: () => setTheme(theme() === 'light' ? 'dark' : 'light')
            }),
            AnimatedButton({ 
              children: 'Get Started!',
              variant: 'secondary',
              onclick: () => alert('Welcome to Singular!')
            })
          ]
        })
      )
    ]
  });
}
```

---

## 🛣️ Routing with Animations

```javascript
import { Router, Link, navigation } from 'singular-framework';
import { animateOnScroll, fadeIn } from 'singular-framework/animate';

function AnimatedPage({ children }) {
  return createElement('div', {
    className: 'page',
    ref: (el) => {
      fadeIn(el, 400);
    }
  }, children);
}

const routes = [
  { 
    path: '/', 
    component: () => AnimatedPage({
      children: [createElement('h1', {}, 'Home Page')]
    })
  },
  { 
    path: '/about', 
    component: () => AnimatedPage({
      children: [createElement('h1', {}, 'About Page')]
    })
  }
];

function App() {
  return createElement('div', {},
    createElement('nav', {
      ref: (el) => {
        animateOnScroll(el, {
          opacity: ['0', '1'],
          transform: ['translateY(-20px)', 'translateY(0px)'],
          duration: 500,
          once: true
        });
      }
    },
      Link({ to: '/', children: ['Home'] }),
      Link({ to: '/about', children: ['About'] })
    ),
    Router({ 
      routes,
      fallback: () => createElement('div', {}, '404 - Page Not Found')
    })
  );
}
```

---

## 🎯 Live Demo Features

Our counter-app demo showcases all the advanced features:

### ✨ Animation Demonstrations
- **Scroll Animations**: Elements animate in as you scroll
- **Hover Effects**: Interactive hover animations on buttons and cards
- **Click Animations**: Visual feedback on button clicks
- **Loop Animations**: Continuous rotating elements
- **Sequence Animations**: Chained animation effects
- **Stagger Animations**: Multiple elements animating with delays
- **Theme Transitions**: Smooth theme switching animations

### 🏷️ Sliding Logo Navigation
- Appears in top-left corner when scrolling
- Click to scroll back to top
- Smooth slide-in/out animations
- Responsive sizing for mobile devices

### 🎨 Theme System
- Light/Dark theme toggle
- Automatic theme persistence
- System preference detection
- Smooth theme transition animations

### 📊 Interactive Elements
- Real-time counter with animated feedback
- Todo list with add/remove animations
- Status bar showing current state
- Notification system with slide-in effects

---

## 📈 Performance

### Optimizations Built-in
- **Throttled Scroll Handling**: Optimized scroll event processing
- **Intersection Observer**: Efficient scroll animation triggers
- **RequestAnimationFrame**: Smooth 60fps animations
- **Batch Updates**: Minimal DOM manipulation
- **Memory Management**: Automatic cleanup of event listeners and observers

### Bundle Size Comparison
| Framework | Bundle Size | Features |
|-----------|-------------|----------|
| Singular | ~12KB | Full framework + animations |
| React | ~42KB | Core only |
| Vue | ~35KB | Core only |
| Svelte | ~10KB | Core only (no animations) |

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
│   ├── store.ts           # State management
│   └── animate.ts         # Advanced animation system
│
├── examples/
│   ├── counter-app/       # Advanced counter with animations
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
pnpm --filter counter-app dev    # Advanced animation demo
pnpm --filter todo-app dev       # Todo app with routing
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
- [x] **Advanced Animation System** - Complete animation framework
- [x] **Scroll Animations** - IntersectionObserver-based animations
- [x] **Interactive Animations** - Hover, click, and loop animations
- [x] **Theme System** - Light/dark mode with transitions
- [x] **Performance Optimizations** - Throttled events and smooth rendering

### 🚧 In Progress (v1.1.0)
- [ ] **JSX Support** - Babel plugin for JSX compilation
- [ ] **SSR** - Server-side rendering capabilities
- [ ] **Devtools** - Browser extension for debugging
- [ ] **Animation Timeline** - Visual animation editor
- [ ] **Forms** - Form handling utilities and validation
- [ ] **Gesture Support** - Touch and swipe animations

### 🔮 Future (v2.0.0)
- [ ] **CLI Tool** - `create-singular-app` scaffolding
- [ ] **Plugin System** - Extensible architecture
- [ ] **Static Site Generator** - Like Astro/Next.js
- [ ] **Mobile Renderer** - React Native-style mobile support
- [ ] **Performance Profiler** - Built-in performance monitoring
- [ ] **3D Animations** - WebGL-based 3D transitions

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

# Test animations
pnpm --filter counter-app dev

# Submit PR
```

---

## 📝 License

MIT © [Singular Core Team](https://github.com/singular-framework)

---

## 🔗 Links

- **Live Demo**: [https://singular-counter-app.vercel.app/](https://singular-counter-app.vercel.app/)
- **Documentation**: [https://singular-framework.dev](https://singular-framework.dev)
- **NPM**: [https://www.npmjs.com/package/singular-framework](https://www.npmjs.com/package/singular-framework)
- **Discord**: [https://discord.gg/yXv43D9B](https://discord.gg/yXv43D9B)
- **Twitter**: [@SingularFramework](https://twitter.com/SingularFramework)

---

**Made with ❤️ and ✨ animations by the Singular community**
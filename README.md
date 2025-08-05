# 🔷 Singular

**Singular** is a lightweight, reactive JavaScript UI library designed to be an approachable and high-performance alternative to React — without the overhead.

> ⚡ Simple syntax • 🔁 Fine-grained reactivity • 🧠 Beginner-friendly • 🛠️ Modern tooling

---

## 🌟 Features

- ✅ Minimal syntax, no JSX required (but optional)
- ✅ `createElement()` to build components
- ✅ `render()` to mount content
- ✅ Fine-grained reactivity (coming soon)
- ✅ Easy to learn, easy to switch from React
- ✅ Designed for modern browsers and tooling

---

## 📦 Project Structure

```
singular/
├── packages/
│   └── core/              # Core rendering & DOM logic
│       ├── src/
│       │   ├── render.ts
│       │   ├── createElement.ts
│       │   └── index.ts
│       └── tsconfig.json
│
├── examples/
│   └── counter-app/       # Simple example app using singular-core
│       ├── index.html
│       └── src/main.ts
│
├── pnpm-workspace.yaml
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/singular.git
cd singular
pnpm install
```

### 2. Build core package

```bash
pnpm --filter singular-core run build
```

> ✅ Tip: Enable watch mode to auto-compile on changes:

```bash
cd packages/core
tsc --watch
```

> This allows `counter-app` to hot-reload whenever core code changes.

### 3. Run the example app

```bash
pnpm --filter counter-app dev
```

---

## 📚 Example

```ts
// src/main.ts in counter-app
import { render } from 'singular-core';

const container = document.getElementById('app');
if (!container) throw new Error('App container not found');

render('<h1>Hello Singular</h1>', container);
```

---

## 📅 Roadmap

- [x] `render()` and `createElement()`
- [ ] `useState()` and reactivity
- [ ] Functional components
- [ ] Props & events
- [ ] Devtools, CLI, and docs site

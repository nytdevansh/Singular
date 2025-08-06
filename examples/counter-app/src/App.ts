import { signal, createElement } from 'singular-core';

export function App() {
  const count = signal(0);

  return createElement('div', {},
    createElement('p', {}, () => `Count: ${count()}`), // 👈 signal is used inside function
    createElement('button', { onclick: () => count(count() + 1) }, 'Increment')
  );
}
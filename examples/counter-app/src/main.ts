import { render, createElement } from 'singular-core';

const container = document.getElementById('app');
if (!container) throw new Error('App container not found');

const el = createElement('h1', { style: 'color: purple' }, 'Hello via createElement!');
render(el, container);
createElement("button", { onClick: () => alert("clicked") }, "Click me");
import { render } from 'singular-core';
import { App } from './App';

const container = document.getElementById('app');
if (container) {
  render(App(), container);
}
// jsx/runtime.ts
import { createElement, Fragment } from '../dom/createElement.js';

export function jsx(type: any, props: any) {
  const { children, ...rest } = props || {};
  return createElement(type, rest, children);
}

export function jsxs(type: any, props: any) {
  return jsx(type, props);
}

export { Fragment as JSXFragment };

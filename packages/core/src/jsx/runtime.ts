// jsx/runtime.ts
import { createElement, Fragment as BaseFragment } from '../dom/createElement.js';

export type VNode = ReturnType<typeof createElement> | DocumentFragment;

export function _spread(props: Record<string, any> = {}) {
  return props;
}

export const Fragment = BaseFragment;
export { BaseFragment as JSXFragment };

export function h(type: any, props: any, ...children: any[]) {
  return createElement(type, props ?? {}, ...children);
}

export function jsx(type: any, props: any) {
  const { children, ...rest } = props || {};
  return createElement(type, rest, children);
}

export function jsxs(type: any, props: any) {
  return jsx(type, props);
}

// dom/createElement.ts - Your createElement implementation

import { effect } from '../reactivity/effect.js';

type Props = Record<string, any> | null;
type Child = string | number | boolean | HTMLElement | (() => any) | Child[];

export function createElement(type: string, props: Props, ...children: Child[]): HTMLElement {
  const el = document.createElement(type);

  // Handle props
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('on') && typeof value === 'function') {
        // Event listeners
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, value);
      } else if (key === 'ref' && typeof value === 'function') {
        // Ref callback
        value(el);
      } else if (key === 'style' && typeof value === 'object') {
        // Style object
        Object.assign(el.style, value);
      } else if (key === 'className' || key === 'class') {
        // Class handling
        if (typeof value === 'function') {
          // Reactive class
          effect(() => {
            el.className = String(value());
          });
        } else {
          el.className = String(value);
        }
      } else {
        // Regular attributes
        if (typeof value === 'function') {
          // Reactive attribute
          effect(() => {
            const attrValue = value();
            if (attrValue != null) {
              el.setAttribute(key, String(attrValue));
            } else {
              el.removeAttribute(key);
            }
          });
        } else if (value != null) {
          el.setAttribute(key, String(value));
        }
      }
    }
  }

  // Handle children
  children.flat(10).forEach(child => insertChild(el, child));
  return el;
}

function insertChild(parent: Node, child: any) {
  if (typeof child === 'function') {
      const _text = document.createTextNode(String(child()));
      parent.appendChild(_text);

      effect(() => {
        _text.textContent = String(child());
      });
  } else if (typeof child === "string" || typeof child === "number") {
    parent.appendChild(document.createTextNode(String(child)));
  } else if (Array.isArray(child)) {
    child.forEach(nested => {
      insertChild(parent, nested);
    });
  } else if (child instanceof Node) {
    parent.appendChild(child);
  } else if (child != null) {
    parent.appendChild(document.createTextNode(String(child)));
  }
}

// Fragment component for multiple children without wrapper
export function Fragment(props: { children: Child[] }): DocumentFragment {
  const fragment = document.createDocumentFragment();
  props.children.forEach(child => insertChild(fragment as any, child));
  return fragment;
}

export const JSXFragment = Fragment;

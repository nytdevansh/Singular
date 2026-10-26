declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }

  interface ElementChildrenAttribute {
    children: {};
  }

  type Element = HTMLElement | DocumentFragment;
}

export {};
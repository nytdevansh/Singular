declare namespace JSX {
  interface Element {
    type: any;
    props: any;
    key: string | null;
  }
  
  interface ElementClass {
    render(): Element;
  }
  
  interface ElementAttributesProperty {
    props: any;
  }
  
  interface ElementChildrenAttribute {
    children: any;
  }
  
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
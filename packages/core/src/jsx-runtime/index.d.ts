import { Props, Child } from '../dom/createElement';

export type { Props as JSXProps, Child as JSXChild };

declare global {
  namespace JSX {
    interface Element {
      type: any;
      props: Props;
      children: Child[];
    }
    
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export declare function jsx(type: any, props: any): JSX.Element;
export declare function jsxs(type: any, props: any): JSX.Element;
export declare function Fragment(props: { children?: Child[] }): any;
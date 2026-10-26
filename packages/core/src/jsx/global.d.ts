import { VNode } from './runtime';

declare global {
  namespace JSX {
    type Element = VNode;
    
    interface ElementChildrenAttribute {
      children: {};
    }

    interface IntrinsicElements {
      // HTML Elements
      [tagName: string]: any;
      div: HTMLElementProps;
      span: HTMLElementProps;
      p: HTMLElementProps;
      h1: HTMLElementProps;
      h2: HTMLElementProps;
      h3: HTMLElementProps;
      button: ButtonProps;
      input: InputProps;
      img: ImgProps;
    }
  }

  interface HTMLElementProps {
    id?: string;
    className?: string;
    class?: string;
    style?: string | Record<string, any>;
    onClick?: (e: Event) => void;
    onInput?: (e: Event) => void;
    onChange?: (e: Event) => void;
    ref?: (el: any) => void;
    key?: string | number;
    children?: any;
    [key: string]: any;
  }

  interface ButtonProps extends HTMLElementProps {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }

  interface InputProps extends HTMLElementProps {
    type?: string;
    value?: string | number;
    placeholder?: string;
    disabled?: boolean;
  }

  interface ImgProps extends HTMLElementProps {
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
  }
}

export {};

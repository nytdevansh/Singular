// Remove the duplicate IntrinsicElements interface entirely
// Keep only the prop interfaces:

export interface HTMLElementProps {
  id?: string;
  class?: string;
  className?: string;
  style?: string | CSSProperties;
  title?: string;
  
  [key: `data-${string}`]: any;
  [key: `aria-${string}`]: any;
  
  onClick?: (event: Event) => void;
  onInput?: (event: Event) => void;
  onChange?: (event: Event) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  
  ref?: (element: any) => void;
  key?: string | number;
  children?: any;
}

export interface ButtonProps extends HTMLElementProps {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export interface InputProps extends HTMLElementProps {
  type?: string;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

export interface TextAreaProps extends HTMLElementProps {
  value?: string;
  placeholder?: string;
  rows?: number;
  cols?: number;
  disabled?: boolean;
}

export interface SelectProps extends HTMLElementProps {
  value?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export interface FormProps extends HTMLElementProps {
  onSubmit?: (event: Event) => void;
  action?: string;
  method?: 'get' | 'post';
}

export interface ImgProps extends HTMLElementProps {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}

export interface CSSProperties {
  [key: string]: string | number;
}

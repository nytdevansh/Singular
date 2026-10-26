declare namespace JSX {
  interface IntrinsicElements {
    div: {
      children?: any;
      className?: string;
      style?: string | { [key: string]: string };
      onClick?: () => void;
    };
    h1: {
      children?: any;
      className?: string;
    };
    h2: {
      children?: any;
      className?: string;
    };
    button: {
      children?: any;
      className?: string;
      onClick?: () => void;
    };
  }
}
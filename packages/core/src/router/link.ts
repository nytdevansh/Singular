// router/link.ts
export interface LinkProps {
  to: string;
  children: any;
  className?: string;
}

export function Link({ to, children, className }: LinkProps) {
  return {
    type: 'a',
    props: {
      href: to,
      className,
      onClick: (e: Event) => {
        e.preventDefault();
        window.history.pushState({}, '', to);
      }
    },
    children: [children]
  };
}

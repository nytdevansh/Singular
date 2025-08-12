// components/boundary.ts
export interface ErrorBoundaryProps {
  fallback: (error: Error) => any;
  children: any;
}

export function ErrorBoundary({ fallback, children }: ErrorBoundaryProps) {
  try {
    return children;
  } catch (error) {
    console.error('ErrorBoundary caught:', error);
    return fallback(error as Error);
  }
}

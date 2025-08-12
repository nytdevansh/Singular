// components/context.ts
export interface Context<T> {
  id: symbol;
  defaultValue: T;
}

const contextValues = new Map<symbol, any>();

export function createContext<T>(defaultValue: T): Context<T> {
  return {
    id: Symbol('context'),
    defaultValue
  };
}

export function useContext<T>(context: Context<T>): T {
  return contextValues.get(context.id) ?? context.defaultValue;
}

export function Provider<T>({ context, value, children }: {
  context: Context<T>;
  value: T;
  children: any;
}) {
  contextValues.set(context.id, value);
  return children;
}


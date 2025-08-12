// reactivity/owner.ts
export interface Owner {
  cleanups: (() => void)[];
  disposed: boolean;
}

let currentOwner: Owner | null = null;

export function createOwner(): Owner {
  return {
    cleanups: [],
    disposed: false
  };
}

export function runWithOwner<T>(owner: Owner, fn: () => T): T {
  const prevOwner = currentOwner;
  currentOwner = owner;
  try {
    return fn();
  } finally {
    currentOwner = prevOwner;
  }
}

export function getOwner(): Owner | null {
  return currentOwner;
}

export function dispose(owner: Owner) {
  if (!owner.disposed) {
    owner.cleanups.forEach(cleanup => cleanup());
    owner.cleanups = [];
    owner.disposed = true;
  }
}

/**
 * Zone-less change detection using requestAnimationFrame
 */

export interface ChangeDetectorRef {
  markForCheck: () => void;
  detach: () => void;
  reattach: () => void;
}

export class ChangeDetector {
  private static pending = new Set<ChangeDetectorRef>();
  private static rafId: number | null = null;

  static markForCheck(ref: ChangeDetectorRef) {
    this.pending.add(ref);
    this.scheduleCheck();
  }

  static detach(ref: ChangeDetectorRef) {
    this.pending.delete(ref);
  }

  static reattach(ref: ChangeDetectorRef) {
    this.markForCheck(ref);
  }

  private static scheduleCheck() {
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => this.check());
    }
  }

  private static check() {
    this.rafId = null;
    const refs = Array.from(this.pending);
    this.pending.clear();

    for (const ref of refs) {
      if (ref.markForCheck) {
        ref.markForCheck();
      }
    }
  }
}

/**
 * Create a change detector ref for a component
 */
export function createChangeDetectorRef(component: any): ChangeDetectorRef {
  const ref: ChangeDetectorRef = {
    markForCheck: () => {
      if (component.render) {
        component.render();
      }
    },
    detach: () => ChangeDetector.detach(ref),
    reattach: () => ChangeDetector.reattach(ref)
  };

  return ref;
}
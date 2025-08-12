// scheduler/raf.ts
let rafQueue: (() => void)[] = [];
let isFlushingRaf = false;

export function scheduleRaf(fn: () => void) {
  rafQueue.push(fn);
  if (!isFlushingRaf) {
    requestAnimationFrame(flushRaf);
  }
}

export function flushRaf() {
  if (isFlushingRaf) return;
  
  isFlushingRaf = true;
  const tasks = rafQueue;
  rafQueue = [];
  
  tasks.forEach(task => {
    try {
      task();
    } catch (error) {
      console.error('RAF task error:', error);
    }
  });
  
  isFlushingRaf = false;
}

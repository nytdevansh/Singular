// scheduler/priorities.ts
export type Priority = 'high' | 'normal' | 'low';

const queues = {
  high: [] as (() => void)[],
  normal: [] as (() => void)[],
  low: [] as (() => void)[]
};

export function scheduleIdle(fn: () => void, priority: Priority = 'normal') {
  queues[priority].push(fn);
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => flushIdleQueue(priority));
  } else {
    setTimeout(() => flushIdleQueue(priority), 0);
  }
}

function flushIdleQueue(priority: Priority) {
  const queue = queues[priority];
  queues[priority] = [];
  
  queue.forEach(task => {
    try {
      task();
    } catch (error) {
      console.error(`${priority} priority task error:`, error);
    }
  });
}

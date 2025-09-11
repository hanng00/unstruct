// batchExecutor.ts
export interface BatchExecutorOptions {
  batchSize?: number; // max concurrent tasks
  onProgress?: (completed: number, total: number) => void; // optional progress callback
}

/**
 * Executes an array of async tasks in batches with concurrency control.
 * @param items The items to process
 * @param taskFn An async function to run on each item
 * @param options Optional settings
 * @returns Object with fulfilled and rejected items
 */
export async function batchExecutor<T, R>(
  items: T[],
  taskFn: (item: T) => Promise<R>,
  options: BatchExecutorOptions = {}
): Promise<{
  fulfilled: { item: T; result: R }[];
  rejected: { item: T; reason: unknown }[];
}> {
  const batchSize = options.batchSize ?? 10;
  const total = items.length;
  let completed = 0;

  const fulfilled: { item: T; result: R }[] = [];
  const rejected: { item: T; reason: unknown }[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const results = await Promise.allSettled(batch.map(taskFn));

    results.forEach((result, index) => {
      completed++;
      options.onProgress?.(completed, total);

      const item = batch[index];

      if (result.status === "fulfilled") {
        fulfilled.push({ item, result: result.value });
      } else {
        rejected.push({ item, reason: result.reason });
      }
    });
  }

  return { fulfilled, rejected };
}

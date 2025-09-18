// utils/runWithConcurrencyLimit.ts

/**
 * Runs async tasks with a maximum concurrency limit.
 * @param items Array of items to process
 * @param concurrency Maximum number of tasks running at the same time
 * @param task Async function to run for each item
 * @returns Array of results in the same order as items
 */
export async function runWithConcurrencyLimit<T, R>(
    items: T[],
    concurrency: number,
    task: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    let currentIndex = 0;
  
    const workers: Promise<void>[] = [];
  
    async function worker() {
      while (currentIndex < items.length) {
        const index = currentIndex++;
        try {
          results[index] = await task(items[index]);
        } catch (err) {
          // Optional: handle per-item errors
          console.error(`Error processing item at index ${index}`, err);
          results[index] = null as any; // or throw, depending on your needs
        }
      }
    }
  
    // Start up to `concurrency` workers
    for (let i = 0; i < Math.min(concurrency, items.length); i++) {
      workers.push(worker());
    }
  
    await Promise.all(workers);
    return results;
  }
  
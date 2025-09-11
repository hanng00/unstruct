"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Time in milliseconds that data remains fresh
            staleTime: 1000 * 60 * 5, // 5 minutes
            // Time in milliseconds that unused/inactive cache data remains in memory
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            // Retry failed requests
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error instanceof Error && "status" in error) {
                const status = (error as Error & { status: number }).status;
                if (status >= 400 && status < 500) {
                  return false;
                }
              }

              // Don't retry validation errors from successful HTTP responses
              // This prevents infinite refetch loops when backend changes response format
              if (
                error instanceof Error &&
                error.message.includes("Validation error:")
              ) {
                return false;
              }

              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            // Refetch on window focus
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Retry failed mutations
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <div className="print:hidden">
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </QueryClientProvider>
  );
}

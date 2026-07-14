"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isApiError } from "@/lib/api/http-error";

/**
 * App-wide client providers. The QueryClient is created inside state so it is stable
 * across re-renders but never shared between requests/users on the server.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            // Never retry auth failures — they won't fix themselves on retry.
            retry: (failureCount, error) =>
              isApiError(error) && (error.isUnauthorized || error.status === 403)
                ? false
                : failureCount < 2,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

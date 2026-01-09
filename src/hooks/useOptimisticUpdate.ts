import { useState, useCallback } from 'react';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

export function useOptimisticUpdate<T, P>(
  mutationFn: (params: P) => Promise<T>,
  options?: OptimisticUpdateOptions<T>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (params: P, optimisticData?: T) => {
      setIsLoading(true);
      setError(null);

      // If optimistic data provided, call onSuccess immediately
      if (optimisticData && options?.onSuccess) {
        options.onSuccess(optimisticData);
      }

      try {
        const result = await mutationFn(params);
        
        // Call onSuccess with real data (will override optimistic if provided)
        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);

        // Rollback optimistic update by calling onError
        if (options?.onError) {
          options.onError(error);
        }

        throw error;
      } finally {
        setIsLoading(false);
        if (options?.onSettled) {
          options.onSettled();
        }
      }
    },
    [mutationFn, options]
  );

  return {
    mutate,
    isLoading,
    error,
  };
}

// Example usage:
// const { mutate } = useOptimisticUpdate(
//   async (action: string) => generateNarrative(character, action),
//   {
//     onSuccess: (data) => {
//       addMessage(data.narrative);
//     },
//     onError: (error) => {
//       // Rollback optimistic update
//       removeLastMessage();
//       showError(error.message);
//     },
//   }
// );
//
// // Use with optimistic data
// mutate('Train cultivation', {
//   narrative: 'You begin training...',
//   // ... optimistic response
// });

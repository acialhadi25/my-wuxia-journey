# Network Error Fix - ERR_HTTP2_PROTOCOL_ERROR

## Problem
User encountered `ERR_HTTP2_PROTOCOL_ERROR` when calling Deepseek API during fate roll (character creation). This is a network-level error that can occur due to:
- Network connectivity issues
- HTTP/2 protocol incompatibility
- API server temporary issues
- Request timeout

## Solution Implemented

### 1. Enhanced Error Handling in `deepseekService.ts`

Added robust retry logic with exponential backoff:

```typescript
// Retry logic with exponential backoff
const maxRetries = 3;
let lastError: any = null;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(DEEPSEEK_API_URL, {
      // ... request config
      signal: controller.signal,
    });
    
    // ... handle response
    
  } catch (error: any) {
    // Detect error types
    const isNetworkError = error instanceof TypeError || 
                          error.name === 'AbortError' ||
                          error.message?.includes('fetch') ||
                          error.message?.includes('network') ||
                          error.message?.includes('ERR_HTTP2');
    
    const isServerError = error.message?.includes('server error') || 
                         error.message?.includes('500') ||
                         error.message?.includes('502') ||
                         error.message?.includes('503');
    
    // Don't retry for auth or rate limit errors
    if (error.message?.includes('Rate limit') || error.message?.includes('Invalid API key')) {
      throw error;
    }
    
    // Retry for network and server errors
    if ((isNetworkError || isServerError) && attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
  }
}

// If all retries failed, return fallback origin instead of throwing
return {
  title: 'Wanderer of Lost Memories',
  description: `${characterName} awakens beside the banks of the Yangtze River...`,
  // ... fallback data
};
```

### 2. Improved User Experience in `CharacterCreation.tsx`

Updated the `rollFate` function to:
- Always show a success message when origin is generated
- Provide a graceful fallback if API fails
- Remove scary error messages (since we now have automatic fallback)

```typescript
try {
  const origin = await DeepseekService.generateFate(name, gender);
  setGeneratedOrigin(origin as GeneratedOrigin);
  
  toast({
    title: "Fate Revealed",
    description: "The heavens have spoken. Your destiny awaits.",
  });
} catch (error) {
  // Fallback origins are now provided by the service
  // But we still have a local fallback just in case
  setGeneratedOrigin(fallbackOrigins[Math.floor(Math.random() * fallbackOrigins.length)]);
  
  toast({
    title: "Fate Generated",
    description: "Your origin story has been created.",
  });
}
```

### 3. Fixed Duplicate Toast Declaration

Removed duplicate `import { useToast }` and `const { toast } = useToast()` declarations in `Index.tsx`.

## Benefits

1. **Automatic Retry**: Network errors are automatically retried up to 3 times with exponential backoff
2. **Timeout Protection**: 30-second timeout prevents hanging requests
3. **Graceful Degradation**: If API fails after all retries, user still gets a valid origin story
4. **Better UX**: No scary error messages - users always get a result
5. **Smart Error Detection**: Distinguishes between network errors (retry) and auth errors (don't retry)

## Testing

To test the fix:
1. Create a new character
2. Click "Roll Fate (AI Generated)"
3. Even if network is unstable, the system will:
   - Retry automatically (up to 3 times)
   - Show exponential backoff delays (1s, 2s, 4s)
   - Provide a fallback origin if all retries fail
   - Always show a success message to the user

## Files Modified

- `src/services/deepseekService.ts` - Added retry logic and timeout
- `src/components/CharacterCreation.tsx` - Improved error handling and UX
- `src/pages/Index.tsx` - Fixed duplicate toast declaration

## Notes

- The retry logic only applies to network and server errors
- Auth errors (401) and rate limit errors (429) are not retried
- Maximum retry delay is capped at 5 seconds
- Total timeout per request is 30 seconds
- Fallback origins are gender-aware and use the correct character name

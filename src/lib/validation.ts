import { z } from 'zod';
import DOMPurify from 'dompurify';

// Character name validation
export const CharacterNameSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must be less than 30 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores')
    .refine(
      (val) => !/<script|javascript:|on\w+=/i.test(val),
      'Invalid characters detected'
    ),
});

// Action input validation
export const ActionInputSchema = z.object({
  action: z.string()
    .min(1, 'Action cannot be empty')
    .max(500, 'Action is too long (max 500 characters)')
    .refine(
      (val) => !/<script|javascript:|on\w+=/i.test(val),
      'Invalid characters detected'
    ),
});

// Character creation validation
export const CharacterCreationSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must be less than 30 characters'),
  gender: z.enum(['Male', 'Female'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  origin: z.string().min(1, 'Please select an origin'),
  goldenFinger: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    effect: z.string(),
  }),
});

// Sanitize user input
export function sanitizeInput(input: string): string {
  // Remove any HTML tags and scripts
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });

  // Trim whitespace
  return cleaned.trim();
}

// Validate and sanitize action input
export function validateAction(action: string): { 
  success: boolean; 
  data?: string; 
  error?: string 
} {
  try {
    const validated = ActionInputSchema.parse({ action });
    const sanitized = sanitizeInput(validated.action);
    return { success: true, data: sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Invalid input' 
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Validate character name
export function validateCharacterName(name: string): {
  success: boolean;
  data?: string;
  error?: string;
} {
  try {
    const validated = CharacterNameSchema.parse({ name });
    const sanitized = sanitizeInput(validated.name);
    return { success: true, data: sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid name',
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Validate character creation data
export function validateCharacterCreation(data: unknown): {
  success: boolean;
  data?: z.infer<typeof CharacterCreationSchema>;
  error?: string;
} {
  try {
    const validated = CharacterCreationSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid character data',
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

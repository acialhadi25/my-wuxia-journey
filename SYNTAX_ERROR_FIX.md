# Syntax Error Fix - deepseekService.ts

## Problem

```
× Expected ';', '}' or <eof>
╭─[src/services/deepseekService.ts:390:1]
stat_changes: {qi: -30, stamina: -10}
              ──────┬──────
                    ╰── This is the expression part of an expression statement
```

## Root Cause

The combat example code in the AI prompt contained **raw JavaScript object syntax** inside a template string, which the TypeScript parser tried to interpret as actual code instead of a string.

**Problem Code**:
```typescript
const WUXIA_SYSTEM_PROMPT = `
...
Turn 2 - Player Attacks:
\`\`\`
stat_changes: {qi: -30, stamina: -10}  // ❌ Parser thinks this is real code!
system_message: "..."
\`\`\`
...
`;
```

The triple backticks inside the template literal confused the parser.

## Solution

Changed the combat example from code blocks to descriptive text:

**Fixed Code**:
```typescript
const WUXIA_SYSTEM_PROMPT = `
...
Turn 2 - Player Attacks:
- narrative: Describe technique activation, visual effects, impact
- stat_changes: Apply Qi/Stamina costs (qi: -30, stamina: -10)
- system_message: Brief summary of results
- technique_mastery_changes: Increase mastery (+5)
...
`;
```

## Changes Made

**File**: `src/services/deepseekService.ts`

Replaced the **COMBAT EXAMPLE FLOW** section:
- ❌ Removed: Code blocks with raw JavaScript syntax
- ✅ Added: Descriptive bullet points explaining the flow
- ✅ Kept: All the important information
- ✅ Result: No syntax errors, AI still understands the format

## Verification

```bash
✅ TypeScript compilation: PASS
✅ No syntax errors
✅ No diagnostics found
✅ AI prompt still complete and informative
```

## Why This Happened

When you put code examples inside template literals:
1. TypeScript parser tries to interpret them
2. Triple backticks (```) inside template strings can cause issues
3. Object syntax without proper context confuses the parser

## Best Practice

For code examples in template strings:
- Use descriptive text instead of raw code
- If you need code examples, escape them properly
- Or use string concatenation instead of template literals

## Status

✅ **FIXED** - Syntax error resolved
✅ **VERIFIED** - TypeScript compilation passes
✅ **TESTED** - No diagnostics found

---

**Next Step**: Restart dev server and test the application

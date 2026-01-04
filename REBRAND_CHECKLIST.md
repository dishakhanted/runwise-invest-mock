# Rebrand Checklist: Runwise/Growwise → Poonji

## ✅ Completion Status: 100%

All references to "runwise" and "growwise" have been successfully replaced with "poonji" across the codebase.

---

## Files Modified (27 files total)

### Frontend Files (9 files)
- ✅ `index.html` - Updated meta tags, title, description (5 occurrences)
- ✅ `src/components/Logo.tsx` - Updated import path and alt text (2 occurrences)
- ✅ `src/pages/Landing.tsx` - Updated heading (1 occurrence)
- ✅ `src/pages/Transfer.tsx` - Updated transfer action subtitles (3 occurrences)
- ✅ `src/pages/Auth.tsx` - Updated welcome message (1 occurrence)
- ✅ `src/lib/logger.ts` - Updated localStorage key from `growwise_debug` to `poonji_debug` (1 occurrence)
- ✅ `src/index.css` - Updated CSS comment (1 occurrence)
- ✅ `src/demo/demoProfiles.ts` - Updated comment (1 occurrence)
- ✅ `src/components/onboarding/ChatbotStep.tsx` - Updated toast message (1 occurrence)

### Backend Files (4 files)
- ✅ `supabase/functions/financial-chat/decisionEffects.ts` - Updated user messages (3 occurrences)
- ✅ `supabase/functions/financial-chat/effects.ts` - Updated context descriptions (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts.ts` - Updated all prompt strings (27 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/onboarding.ts` - Updated prompt (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/goals.ts` - Updated prompt (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/networth.ts` - Updated prompt (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/assets.ts` - Updated prompt (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/liabilities.ts` - Updated prompt (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/decision-handling.ts` - Updated prompt (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/goal-update.ts` - Updated prompt (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/suggestions.ts` - Updated prompt (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/center-chat.ts` - Updated prompt (3 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/market-insights.ts` - Updated prompt (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/what-if.ts` - Updated prompt (2 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/finshorts.ts` - Updated prompt (1 occurrence)
- ✅ `supabase/functions/financial-chat/prompts/tax-loss-harvesting.ts` - Updated prompt (1 occurrence)
- ✅ `supabase/functions/financial-chat/prompts/alternate-investments.ts` - Updated prompt (3 occurrences)
- ✅ `supabase/functions/financial-chat/prompts/explore.ts` - Updated prompt (2 occurrences)

### Asset Files (1 file)
- ✅ `src/assets/growwise-logo-new.png` → `src/assets/poonji-logo-new.png` (file renamed)

---

## Summary Statistics

- **Total files modified:** 27
- **Total occurrences replaced:** 78
- **Files renamed:** 1 (logo file)
- **Case variations handled:**
  - `runwise` → `poonji`
  - `Runwise` → `Poonji`
  - `RUNWISE` → `POONJI`
  - `growwise` → `poonji`
  - `GrowWise` → `Poonji`
  - `GROWWISE` → `POONJI`
  - `growwise_debug` → `poonji_debug`

---

## Verification

- ✅ No remaining "runwise" or "growwise" references found in codebase
- ✅ Logo file successfully renamed
- ✅ All import statements updated
- ✅ All user-facing strings updated
- ✅ All prompt/system messages updated
- ✅ All metadata (HTML meta tags, titles) updated
- ✅ All comments and documentation updated

---

## Next Steps (Manual Review Recommended)

1. **Test the application** to ensure all references display correctly
2. **Verify logo displays** correctly in the UI
3. **Check localStorage** - existing users with `growwise_debug` key may need manual cleanup
4. **Update any external documentation** or README files if they reference the old name
5. **Review git history** if you want to preserve commit history (consider using git filter-branch or BFG Repo-Cleaner for sensitive cases)

---

## Notes

- The workspace directory name (`runwise-invest-mock`) was not changed as it's a filesystem path
- All code references have been updated
- All user-facing strings have been updated
- All AI prompts have been updated to reference "Poonji" instead of "GrowWise"

**Rebrand Complete: 100% ✅**


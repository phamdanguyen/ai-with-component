---
trigger: always_on
---

PROJECT RULES & DEFINITION OF DONE (SPRINT LEVEL)
This workspace adheres to a strict Definition of Done. All Agents must validate their work against this checklist before requesting human review.

1. TECH STACK & STANDARDS
Language/Framework:

Formatting: Code must pass without warnings.

Testing Framework: [Ví dụ: Jest / Cypress / Playwright].

2. MANDATORY DOD CHECKLIST (Must Verify)
✅ Code Quality
[ ] No Placeholder Code: No // TODO or pass left in the final logic.

[ ] Type Safety: No usage of any type (TypeScript) unless absolutely necessary and commented.

[ ] Comments: Public functions must have JSDoc/Docstring explaining inputs/outputs.

✅ Automated Verification
[ ] Unit Tests: New logic includes unit tests. Coverage must not decrease.

[ ] Integration Tests: Critical flows (Login, Checkout, etc.) must pass e2e checks.

[ ] Build Check: The project must compile/build successfully (npm run build).

✅ UI/UX Verification (If applicable)
[ ] Responsiveness: UI verified on Mobile and Desktop viewports via Browser Agent.

[ ] Accessibility: Interactive elements must have aria-label or visible labels.

[ ] No Jank: Animations must use transform or opacity (no layout thrashing).

✅ Operational Safety
[ ] Dependencies: No new packages added without documenting reason in implementation_plan.md.

[ ] Environment: No hardcoded secrets. Use process.env or equivalent.

3. ARTIFACT MANAGEMENT
Update Frequency: Update task.md after every sub-task completion.

Handoff: When finishing a task, your final message must link to the walkthrough.md proof.

4. EXCEPTION HANDLING
If you encounter a "Hallucination Loop" (repeating the same error fix > 3 times), STOP and ask the human for guidance.

If a test fails, analyze the FAILURE LOG before changing the source code.
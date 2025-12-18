---
name: implement-phase
description: Implementation of a feature development - Execute the implementation plan following all core quality principles
---

# Phase 2: Implement

**Before starting, load and review the core quality standards:**
Use `devskills_get_skill("core-principles")` to review the non-negotiable quality standards that must be followed throughout this phase.

**Objective:** Execute the implementation plan adhering to all core principles.

## Instructions

1. **Setup and Preparation**

   - Install any new dependencies identified in planning

2. **Incremental Implementation**

   - Follow the implementation plan step-by-step
   - Implement one component/module at a time
   - Keep changes focused and atomic

3. **Code Quality Checklist**
   For each component implemented, verify:

   - [ ] Follows naming conventions and code style
   - [ ] Implements single responsibility principle
   - [ ] Uses proper types (no `any` in TypeScript)
   - [ ] Handles errors appropriately
   - [ ] Includes necessary validation
   - [ ] Extracts magic values to constants
   - [ ] Removes debugging code and console logs
   - [ ] Adds appropriate comments for complex logic

4. **Integration**

   - Integrate new components with existing code
   - Update imports and dependencies
   - Ensure backward compatibility where needed
   - Handle configuration and environment variables

5. **Self-Review**
   - Review your own code before marking complete
   - Check for code smells and refactoring opportunities
   - Verify adherence to core principles
   - Ensure consistent formatting

## Output

- Fully implemented feature code
- Updated/new configuration files
- Inline documentation for complex methods/logic

**MANDATORY: Request user confirmation before proceeding to Review phase.**

---

**Next Step:** Once the user confirms the implementation is complete, save the generated implementation output into the `./output-implementation.md` file, use devskills to get the `review-phase` skill and follow its instructions.

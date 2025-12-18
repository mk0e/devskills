---
name: review-phase
description: Reviewing phase of a feature development - Conduct thorough code review to ensure quality, correctness, and adherence to standards.
---

# Phase 3: Review

**Before starting, load and review the core quality standards:**
Use `devskills_get_skill("core-principles")` to review the non-negotiable quality standards that must be validated during this phase.

**Objective:** Conduct thorough code review to ensure quality, correctness, and adherence to standards.

## Instructions

1. **Automated Checks**

   - Run linter and fix all warnings/errors
   - Run type checker (TypeScript, mypy, etc.)
   - Check for unused imports and variables
   - Verify code formatting (prettier, black, etc.)
   - Run static analysis tools if available

2. **Code Quality Review**
   Review against core principles:

   - [ ] **Clean Code**: Names are clear, functions are focused
   - [ ] **SOLID**: Each class/function has single responsibility
   - [ ] **DRY**: No code duplication
   - [ ] **Type Safety**: Strong typing throughout
   - [ ] **Error Handling**: All error cases covered
   - [ ] **Performance**: No obvious inefficiencies
   - [ ] **Security**: Input validation, no vulnerabilities

3. **Functional Review**

   - Verify implementation matches requirements
   - Check edge cases are handled
   - Ensure error scenarios are covered
   - Verify data validation logic
   - Check state management correctness

4. **Integration Review**

   - Verify integration points work correctly
   - Check backward compatibility
   - Ensure dependencies are properly managed
   - Verify configuration handling

5. **Documentation Review**

   - Verify all public APIs are documented
   - Check that comments are accurate and helpful
   - Ensure README and external docs are updated
   - Verify examples are correct

6. **Refactoring**

   - Identify and apply refactoring opportunities
   - Extract duplicated code
   - Simplify complex logic
   - Improve naming if needed
   - Optimize imports and dependencies

7. **Security Review**
   - Check for injection vulnerabilities
   - Verify authentication/authorization
   - Ensure sensitive data is protected
   - Check for information leakage
   - Review third-party dependencies for vulnerabilities

## Output

- List of issues found and resolved
- Refactoring changes applied
- Updated code passing all automated checks
- Documentation of any technical debt or follow-up items

**MANDATORY: Request user confirmation before proceeding to Test phase.**

---

**Next Step:** Once the user confirms the review is complete, save the generated review into the `./output-review.md` file, use devskills to get the `test-phase` skill and follow its instructions.

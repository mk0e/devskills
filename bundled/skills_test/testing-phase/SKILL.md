---
name: test-phase
description: Testing phase of feature development - Verify feature correctness through comprehensive testing.
---

# Phase 4: Test

**Before starting, load and review the core quality standards:**
Use `devskills_get_skill("core-principles")` to review the non-negotiable quality standards that must be verified through testing.

**Objective:** Verify feature correctness through comprehensive testing.

## Instructions

1. **Unit Testing**

   - Write unit tests for all new functions/methods using the installed framework (e.g. Jest)
   - Test happy paths and edge cases
   - Test error handling and validation
   - Aim for high code coverage (>80% for new code)
   - Use meaningful test names that describe scenarios
   - Follow AAA pattern (Arrange, Act, Assert)
   - Mock external dependencies appropriately

2. **Integration Testing**

   - Test component interactions
   - Verify data flow between modules
   - Test API integrations
   - Verify state management works correctly
   - Test with realistic data

3. **Edge Cases and Error Scenarios**

   - Test boundary conditions
   - Test with invalid inputs
   - Test error recovery
   - Test concurrent operations if relevant
   - Test with empty/null/undefined values

4. **Performance Testing** (if applicable)

   - Test with large datasets
   - Measure response times
   - Check for memory leaks
   - Verify rendering performance

5. **Regression Testing**

   - Run existing test suite
   - Verify no existing functionality is broken
   - Check related features still work

## Test Quality Checklist

- [ ] All new code has unit tests
- [ ] Tests are deterministic (no flaky tests)
- [ ] Tests are independent of each other
- [ ] Tests have clear, descriptive names
- [ ] Edge cases are covered
- [ ] Error scenarios are tested
- [ ] Mocks are used appropriately
- [ ] Test coverage meets project standards
- [ ] All tests pass consistently
- [ ] Existing tests still pass

## Output

- Complete test suite for new feature
- Test coverage report
- List of any known issues or limitations
- Confirmation that all tests pass

**MANDATORY: Request user final confirmation that the feature is complete and ready for deployment/merge.**

---

**Workflow Complete:** This is the final phase. Once the user confirms all tests pass and the feature is ready, the feature development workflow is complete.

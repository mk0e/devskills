---
name: feature-flow
description: Implement Jira/feature requests in Angular/TypeScript projects. Use when implementing new features in Angular applications, modifying existing components/services, writing Jest tests, or handling feature implementation workflows. Integrates with Angular MCP server for project structure analysis. Includes mandatory developer confirmation before implementation, code review, and comprehensive testing phases.
---

# Feature Implementation Workflow

A comprehensive workflow for implementing Jira features in production-ready Angular/TypeScript code with Jest tests.

## Integration

This skill integrates with the **Angular MCP Server** (`@angular/mcp`) to query the workspace, inspect project structure, and assist with Angular-specific tooling.

## Core Principles

- **Always prefer modifying existing files** instead of creating new ones
- **Only create new files if strictly necessary** (e.g., completely new module, component, or service)
- Inspect project structure before generating code to identify relevant files
- **Never delete or overwrite existing code without explicit developer confirmation**
- **Do not write comments inside the code** unless explicitly requested
- When modifying existing Angular components, **strictly follow the established structure and coding style**
- Provide full file content when creating or modifying files
- Review your own code for readability, maintainability, and correctness

## Mandatory Developer Confirmation Rule

After producing the step-by-step implementation plan, **STOP**.

You are **FORBIDDEN** from proceeding to implementation, modifying files, writing code, or executing commands until the developer explicitly replies with: **GO**

If the developer response does NOT contain the exact keyword "GO", you MUST NOT proceed and MUST ask again for confirmation.

This rule takes precedence over all other auto-execution policies.

## Session Logging

At the beginning of each session:

1. Create (if not exists) a log file under `/logs` directory
2. File name format: `feature-session-[yyyyMMdd-HHmmss].log`
3. Log every significant action:
   - Feature description and plan summary
   - Files created or modified (with paths)
   - Confirmations requested from the developer
   - Errors encountered and fixes applied
   - Test results and any retries
4. Use simple, human-readable text format (no JSON)
5. Append logs incrementally throughout the session

## Workflow Phases

### PHASE 1 — DISCOVERY & PLANNING

1. Analyze the feature description provided by the user
2. Query the **Angular MCP server** to understand:
   - Existing modules, components, and services related to the feature
   - The most appropriate integration points
3. Present a **plan** to the user for confirmation:
   - Files to be modified and why
   - Files to be created **only if strictly necessary**, with justification
   - Proposed approach for state management and side effects
   - Testing strategy and mock plan

**Do not proceed to Phase 2 until the user confirms the plan with "GO".**

### PHASE 2 — IMPLEMENTATION

1. Modify the existing files as planned
2. Create new files **only if absolutely required**, according to the justification in Phase 1
3. Before **removing or replacing** any existing function, method, or logic block:
   - Clearly show the developer what would be removed
   - Explain why the change is needed
   - **Wait for explicit developer approval** before applying the deletion
4. Follow Angular best practices:
   - Separation of concerns: logic in services/facades, components only handle UI
   - Use RxJS pipeable operators or Signals, with proper cleanup
   - Explicit interfaces/types for all data models

### PHASE 3 — CODE REVIEW

1. Review the implemented code for correctness, readability, and performance
2. Verify that **no existing methods, functions, or logic have been accidentally removed or broken**
3. If issues or regressions are found, **correct them directly** in the code and briefly explain the fix
4. Suggest improvements for maintainability or style if necessary
5. Be concise, technically accurate, and confident

### PHASE 4 — TESTING

1. Generate Jest `.spec.ts` files for the implemented feature
2. Mock all injected dependencies; do not use real services
3. Cover at minimum:
   - Component creation (smoke test)
   - Inputs triggering logic
   - Outputs emitting events
   - Service methods handling success and error states
4. Verify that previous functionality still works (no regressions)
5. **Run all tests from the terminal**
6. If any test fails, **correct only the files or tests that you have created or modified** until all tests pass
7. Provide estimated coverage

## Error Handling

If the user reports a build or test error:

1. Ask for the **exact error message and stack trace**
2. Analyze **only the specific file** causing the error
3. Provide a **corrected version of the entire file**, not a diff
4. If necessary, use the **Angular MCP diagnostics** to identify dependency or type errors

## Auto-Execution Policy

The agent is authorized to automatically execute commands (tests, builds, linting, formatting, code generation) **ONLY AFTER** the developer has approved the implementation plan using the exact keyword "GO".

Before developer confirmation:

- No code modification is allowed
- No command execution is allowed
- No file creation or deletion is allowed

## Usage Example

**User input:**

> Implement a "Forgot Password" feature in the authentication flow. Update `src/app/pages/login.component.ts` and `src/app/services/auth.service.ts` if needed. Then review the code and write unit tests using Jest.

**Expected workflow:**

1. Analyze relevant files through MCP server queries
2. Present a clear plan before modifying anything
3. Wait for "GO" confirmation
4. Modify or extend existing files, confirming before deleting code
5. Review implementation and verify no regressions
6. Generate and run Jest tests. Fix issues until all pass

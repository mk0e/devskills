---
name: core-principles
description: Non-negotiable quality standards for feature development including Clean Code, SOLID, DRY, Type Safety, Error Handling, Performance, Security, and Documentation principles.
---

# Core Principles

Always adhere to these non-negotiable quality standards:

## Code Quality Standards

1. **Clean Code**

   - Write self-documenting code with clear, descriptive names
   - Keep functions small and focused on a single responsibility
   - Avoid magic numbers and strings; use named constants
   - Remove commented-out code and dead code

2. **SOLID Principles**

   - Single Responsibility: Each class/function has one reason to change
   - Open/Closed: Open for extension, closed for modification
   - Liskov Substitution: Subtypes must be substitutable for base types
   - Interface Segregation: Prefer specific interfaces over general ones
   - Dependency Inversion: Depend on abstractions, not concretions

3. **DRY (Don't Repeat Yourself)**

   - Extract repeated logic into reusable functions/modules
   - Use composition and inheritance appropriately
   - Create shared utilities for common operations

4. **Type Safety**

   - Use strict typing (TypeScript strict mode, type hints in Python)
   - Avoid `any` types; prefer unknown or specific types
   - Define clear interfaces and contracts

5. **Error Handling**

   - Handle errors gracefully with meaningful messages
   - Use appropriate error types and hierarchies
   - Never silently swallow errors
   - Log errors with sufficient context for debugging

6. **Performance Awareness**

   - Avoid premature optimization, but be mindful of algorithmic complexity
   - Use appropriate data structures
   - Minimize unnecessary computations and re-renders
   - Profile before optimizing

7. **Security First**

   - Validate and sanitize all inputs
   - Never trust user data
   - Follow least-privilege principles
   - Protect sensitive data

8. **Determine additional rules**

   - Working with Angular code? → Add "Angular Criteria" below

9. **Angular Criteria**

  - Use strict type checking
  - Prefer type inference when the type is obvious
  - Avoid the `any` type; use `unknown` when type is uncertain
  - Always use standalone components over NgModules
  - Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
  - Use signals for state management
  - Implement lazy loading for feature routes
  - Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
  - Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
  - Keep components small and focused on a single responsibility
  - Use `input()` and `output()` functions instead of decorators
  - Use `computed()` for derived state
  - Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
  - Prefer inline templates for small components
  - Prefer Reactive forms instead of Template-driven ones
  - Do NOT use `ngClass`, use `class` bindings instead
  - Do NOT use `ngStyle`, use `style` bindings instead
  - When using external templates/styles, use paths relative to the component TS file.
  - Use signals for local component state
  - Use `computed()` for derived state
  - Keep state transformations pure and predictable
  - Do NOT use `mutate` on signals, use `update` or `set` instead
  - Keep templates simple and avoid complex logic
  - Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
  - Use the async pipe to handle observables
  - Do not assume globals like (`new Date()`) are available.
  - Do not write arrow functions in templates (they are not supported).
  - Design services around a single responsibility
  - Use the `providedIn: 'root'` option for singleton services
  - Use the `inject()` function instead of constructor injection 
---
name: plan-phase
description: Plan phase of feature development - Analyze requirements, design architecture, and create comprehensive implementation plan.
---

# Phase 1: Plan

**Before starting, load and follow the core quality standards:**
Use `devskills_get_skill("core-principles")` to follow the non-negotiable quality standards.

**Objective:** Analyze the provided feature requirements within the <text> tags, design the architecture, and create a comprehensive implementation plan.

<text> {input requirements} </text>

## Instructions

1. **Requirements Analysis**

   - Gather and document all requirements (functional and non-functional) passed from the <text> tags
   - Identify success criteria
   - Clarify ambiguities with the user
   - Document acceptance criteria

2. **Technical Investigation**

   - Analyze existing codebase relevant to the feature
   - Identify files, modules, and components that need modification
   - Research dependencies and third-party libraries needed
   - Assess technical constraints and limitations
   - Review similar implementations in the codebase

3. **Architecture Design**

   - Design the high-level architecture
   - Identify new components, services, or modules needed
   - Favor reuse instead of creating new components
   - Define data models and interfaces
   - Plan state management approach if needed
   - Consider scalability and extensibility
   - Identify potential edge cases and error scenarios

4. **Implementation Strategy**

   - Break down the feature into discrete, testable units
   - Create a step-by-step implementation plan
   - Identify dependencies between tasks
   - Estimate complexity and risks
   - Plan for backward compatibility if needed

5. **Testing Strategy**

   - Define what needs to be tested (unit, integration, e2e)
   - Identify test scenarios and edge cases
   - Plan test data requirements
   - Consider performance testing needs

6. **Documentation Plan**
   - Plan what documentation needs to be created/updated
   - Identify API documentation requirements
   - Plan user-facing documentation if applicable

## Output

Create a comprehensive plan document including:

- Feature overview and requirements
- Files to be created/modified
- Architecture diagrams (if complex)
- Step-by-step implementation tasks
- Testing approach
- Potential risks and mitigation strategies

**MANDATORY: Request user confirmation before proceeding to Implementation phase.**

---

**Next Step:** Once the user confirms the plan, save the generated plan into the `./output-plan.md` file, then use devskills to get the `implement-phase` skill and follow its instructions.

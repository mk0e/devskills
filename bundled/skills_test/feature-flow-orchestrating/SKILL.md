---
name: feature-flow-orchestrator
description: Comprehensive workflow of steps for planning, implementing, reviewing, and testing code features with mandatory quality standards. Use any time you want to start implementing a new feature giving some initial requirements.
---

# Feature Development Workflow

This skill orchestrates a structured, phase-based approach to feature development with mandatory quality standards and user confirmations between phases.

## Overview

The feature development workflow consists of four sequential phases:

1. **Plan** - Analyze requirements, design architecture, create implementation plan
2. **Implement** - Execute the plan following core quality principles
3. **Review** - Conduct thorough code review for quality and standards adherence
4. **Test** - Verify feature correctness through comprehensive testing

Each phase has its own dedicated skill with detailed instructions. The workflow enforces user confirmation before proceeding between phases.

## Core Quality Standards

All phases must adhere to non-negotiable quality standards as described in the `core-principles` skill.

**To review these standards in detail:** Use `devskills_get_skill("core-principles")` before starting any phase.

## How to Use This Workflow

**To begin the feature development process:**

Use devskills to get the `plan-phase` skill and follow its instructions to start Phase 1.

Each phase skill will guide you to the next phase upon completion. The workflow progresses as follows:

```
plan-phase → implement-phase → review-phase → test-phase
```

## Workflow Summary

1. **Plan** → Create comprehensive implementation plan → **User Confirmation**
2. **Implement** → Write code following core principles → **User Confirmation**
3. **Review** → Thorough quality and security review → **User Confirmation**
4. **Test** → Comprehensive testing and validation → **Final User Confirmation**

Each phase builds on the previous one. Never skip phases or user confirmations.

---

**Next Step:** Call `devskills_get_skill('plan-phase')` to begin Phase 1 to begin the feature development workflow.


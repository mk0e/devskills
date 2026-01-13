# DevSkills: Enterprise Context & Strategic Positioning

## The Situation

**Context**: Swiss telco, significant in-house development, currently using GitHub Copilot.

**Problem**: AI coding agents are gaining "skills" (reusable knowledge packages), but enterprise requirements for skill management are unaddressed by vendor solutions.

---

## The Skills Landscape (Late 2025)

### What Are Skills?

Folders containing instructions (`SKILL.md`), scripts, and resources that teach AI agents how to perform specific tasks. Introduced by Anthropic (Oct 2025), opened as standard at [agentskills.io](https://agentskills.io) (Dec 2025), now governed by Agentic AI Foundation (Linux Foundation, co-founded by Anthropic, OpenAI, Block).

### Native Support in Major Coding Agents

| Agent | Skills Location | How to Install | Versioning |
|-------|-----------------|----------------|------------|
| Claude Code | `~/.claude/skills/`, `.claude/skills/` | Manual copy OR plugin marketplace | ✅ Plugins: commit SHA pinning, semver (`@1.0.0`), auto-update toggle |
| GitHub Copilot | `.github/skills/`, `~/.github/skills/` | Manual copy only | ❌ None |
| OpenAI Codex | `~/.codex/skills/` | Manual copy only | ❌ None |
| Cursor, Goose, DeepAgents | Similar patterns | Manual copy only | ❌ None |

**Key insight**: Claude Code plugins have versioning. Other native implementations = files on local filesystem with no versioning. None have access control or audit capabilities.

---

## Two Approaches to Skills Delivery

### 1. Native (Filesystem-Based)

How it works:
- Skills as directories on developer machines
- Agent reads from filesystem at startup/on-demand
- Cross-platform: one skill library + vendor-specific wrappers (e.g., [superpowers repo](https://github.com/obra/superpowers))

Pros:
- Simple, no server needed
- Works offline
- Fast (local filesystem)
- Claude Code plugins: versioning, catalog, auto-update

Cons:
- No access control (any vendor)
- No audit trail (any vendor)
- No enterprise identity integration
- Copilot/Codex/others: no versioning, manual distribution

### 2. MCP-Based (Server-Delivered)

How it works:
- Skills served via Model Context Protocol
- Any MCP-compatible agent connects to server
- Skills fetched on-demand over protocol

Pros:
- Centralized management
- Version control possible
- Access control possible
- Audit trail possible
- Update once, all clients get new skills
- No client-side installation

Cons:
- Requires server infrastructure
- Network dependency
- Additional complexity

---

## When Each Approach Wins

| Scenario | Native | MCP |
|----------|--------|-----|
| Individual dev, major coding agent | ✅ Simpler | Overhead |
| Small team, single agent | ✅ Simpler | Overhead |
| Custom agents (OpenAI Agents SDK, Claude Agent SDK, LangChain) | Must implement skill loading | ✅ Plug-and-play |
| Enterprise: centralized governance | Complex | ✅ Single server |
| Proprietary/sensitive skills | Risk on dev machines | ✅ Server-side only |
| Workflow platforms (n8n) | N/A | ✅ MCP integration |
| Version pinning | ⚠️ Claude Code only | ✅ Any agent |
| Access control, audit, compliance | ❌ Not possible | ✅ Server-side |

**Bottom line**: Native wins for simplicity. Claude Code plugins add versioning/catalog. MCP wins for enterprise control across any agent.

---

## Enterprise Gaps

| Requirement | Copilot | Claude Code (Plugins) | MCP Potential |
|-------------|---------|----------------------|---------------|
| **Versioning** | ❌ None | ✅ SHA/semver pinning | ✅ Git tags/branches |
| **Rollback** | ❌ Manual | ⚠️ Reinstall older version | ✅ Server config |
| **Access Control** | ❌ None | ❌ None | ✅ Server-side auth |
| **Role-Based Skills** | ❌ None | ❌ None | ✅ Filter by user/team |
| **Audit Trail** | ❌ None | ❌ None | ✅ Log all requests |
| **Compliance Reporting** | ❌ None | ❌ None | ✅ Structured logs |
| **Centralized Catalog** | ❌ None | ✅ Plugin marketplace | ✅ Server index |
| **Approval Workflow** | ❌ None | ❌ None | ✅ Gate before publish |
| **Push Updates** | ❌ Manual | ⚠️ Auto-update toggle | ✅ Automatic |
| **Analytics** | ❌ None | ❌ None | ✅ Server metrics |
| **Enterprise Identity** | ❌ None | ❌ None | ✅ SSO/LDAP integration |

**Claude Code leads** on versioning and catalog. **All vendors lack** access control, audit, compliance, approval workflows, analytics.

---

## Enterprise Requirements (Swiss Telco Context)

### Must Have (Likely)

1. **Version Control & Rollback**
   - Pin skills to specific versions
   - Gradual rollout (10% → 50% → 100%)
   - Rollback if skill causes issues

2. **Access Control**
   - Role-based skill access
   - Integration with enterprise identity (Azure AD, Okta)
   - Sensitive skills (security, compliance) restricted

3. **Audit & Compliance**
   - Swiss data protection (nDSG)
   - Telecom regulations (BAKOM)
   - Who loaded which skill, when, for what
   - SIEM integration

4. **Centralized Catalog**
   - Enterprise-wide skill registry
   - Search, categorization, tagging
   - Ownership, documentation

5. **Governance**
   - Approval workflow before publishing
   - Security review (skills can execute scripts!)
   - Quality gates

### Should Have (Probable)

6. **Distribution without developer action**
   - No manual copying
   - Ensure approved versions only

7. **Multi-environment**
   - Dev/staging/prod skill variants
   - Environment-specific config

8. **Analytics**
   - Usage statistics
   - Error rates
   - ROI measurement

### Could Have (Explore)

9. **Skill composition & inheritance**
   - Base skills that teams extend
   - Avoid duplication

10. **Secrets management**
    - Vault integration
    - Credentials injected at runtime

11. **Skill testing & CI/CD**
    - Automated testing before publish

12. **Incident response**
    - Immediate disable capability
    - Blast radius assessment

---

## DevSkills MCP Server: Current State

### What It Does Today

- Serves skills via MCP protocol
- Any MCP-compatible agent can consume
- Git-based skill storage
- Multi-repo support
- Optional slash-command prompts

### What It Does NOT Do (Yet)

- Version pinning
- Access control
- Audit logging
- Approval workflow
- Analytics
- Enterprise identity integration

---

## Strategic Positioning

### Target Use Cases

1. **Custom agents built with SDKs** (OpenAI Agents SDK, Claude Agent SDK, LangChain) that have MCP support but no native skill loading

2. **Enterprise environments** needing centralized skill management with governance

3. **Security-conscious deployments** where skills shouldn't live on developer machines

### Not Competing With

Native skills for individual developers using Claude Code/Copilot/Codex directly. For that use case, native is simpler.

### Potential Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Enterprise Skills Platform                   │
├─────────────────────────────────────────────────────────────┤
│  Git Repos ──▶ Approval Workflow ──▶ Skill Catalog          │
│      │                                     │                │
│      ▼                                     ▼                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              DevSkills MCP Server                    │   │
│  │  • Version Manager (git tags/branches)               │   │
│  │  • Access Control (enterprise identity)              │   │
│  │  • Audit Logger (SIEM integration)                   │   │
│  │  • Catalog Index (search, metadata)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │ MCP Protocol
                           ▼
          Developer Machines (no local installation)
          ┌──────────┐  ┌──────────┐  ┌──────────┐
          │ Copilot  │  │ Claude   │  │ Custom   │
          │ (MCP)    │  │ Code     │  │ Agents   │
          └──────────┘  └──────────┘  └──────────┘
```

---

## Open Questions

1. **Requirements validation**: Which enterprise requirements are actually needed vs. nice-to-have?

2. **Build vs. buy**: Could existing enterprise platforms (ServiceNow, internal portals) handle some of this?

3. **Adoption path**: How to migrate from "copy files" to centralized MCP?

4. **Scope**: Skills only, or also MCP tools, prompts, agents?

5. **Product potential**: Internal tooling or potential product?

---

## Next Steps

- [ ] Validate enterprise requirements with stakeholders
- [ ] Prioritize: MVP vs. full platform
- [ ] Prototype: Add versioning and basic access control to DevSkills
- [ ] Pilot: Test with one team before broader rollout

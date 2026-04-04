# Skill Registry — IceCore
Generated: 2026-03-31

## User Skills

| Skill | Trigger |
|-------|---------|
| `branch-pr` | When creating a pull request, opening a PR, or preparing changes for review |
| `issue-creation` | When creating a GitHub issue, reporting a bug, or requesting a feature |
| `judgment-day` | When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" |
| `skill-creator` | When user asks to create a new skill, add agent instructions, or document patterns for AI |

## SDD Skills (orchestrator-managed)

| Skill | Phase |
|-------|-------|
| `sdd-explore` | Investigate ideas and explore codebase |
| `sdd-propose` | Create change proposals |
| `sdd-spec` | Write specifications with Given/When/Then |
| `sdd-design` | Technical design documents |
| `sdd-tasks` | Implementation task breakdown |
| `sdd-apply` | Implement tasks |
| `sdd-verify` | Validate implementation against specs |
| `sdd-archive` | Close and persist completed changes |

## Compact Rules

### branch-pr
- Always file an issue FIRST before creating a PR (issue-first enforcement)
- PR title: `<type>(<scope>): <description>` — conventional commits format
- PR body: Summary (bullet points) + Test plan (checklist) + link to issue
- Never push directly to main/master

### issue-creation
- Check for duplicate issues before creating
- Use conventional title: `<type>: <description>`
- Include steps to reproduce for bugs; acceptance criteria for features
- Apply appropriate labels

### judgment-day
- Launch TWO independent blind judge sub-agents simultaneously
- Agents review the SAME target without seeing each other's output
- Synthesize findings, apply fixes, re-judge until both pass or escalate after 2 iterations
- Use for high-stakes code reviews before merging

### skill-creator
- Follow Agent Skills spec format with YAML frontmatter
- Include: When to Use, Compact Rules, full instructions
- Skills stored under `~/.claude/skills/<name>/SKILL.md`

## Project Conventions

- No project-level CLAUDE.md, AGENTS.md, or .cursorrules found
- Global CLAUDE.md applies: conventional commits, no AI attribution, no cat/grep/find/sed/ls
- Frontend: React 19 + Vite 7 + TailwindCSS 4 + React Router 7 — no test runner configured
- Backend: Spring Boot 4 + Java 21 + Spring Security + JPA + PostgreSQL — JUnit 5 via spring-boot-starter-*-test
- strict_tdd: false (frontend has no test runner; backend has only context-load smoke test)

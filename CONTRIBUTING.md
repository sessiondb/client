# Contributing Guidelines

Thank you for your interest in contributing to the SessionDB frontend (UI)! We greatly value feedback and contributions from our community. This document will guide you through the contribution process.

## How can I contribute?

### Finding Issues to Work On

- Check our existing [open issues](https://github.com/sessiondb/sessiondb/issues)
- Look for **good first issue** labels to start with
- Review recently closed issues to avoid duplicates

### Types of Contributions

- **Report Bugs:** Use our Bug Report template (or open an issue with clear reproduction steps)
- **Request Features:** Submit using a Feature Request template or issue with use case and requirements
- **Improve Documentation:** Create an issue with a documentation label
- **Report Performance Issues:** Describe the scenario, environment, and impact
- **Report Security Issues:** Follow our [Security Policy](SECURITY.md)
- **Join Discussions:** Participate in project discussions and issue threads

### Creating Helpful Issues

When creating issues, include:

**For Feature Requests:**

- Clear use case and requirements
- Proposed solution or improvement
- Any open questions or considerations

**For Bug Reports:**

- Step-by-step reproduction steps
- Version information (Node/npm, browser, SessionDB backend version if relevant)
- Relevant environment details (OS, API URL, etc.)
- Any modifications you've made
- Expected vs actual behavior

## Submitting Pull Requests

### Development

- Set up your development environment (see [README](README.md): `npm install`, `npm run dev`)
- Work against the latest `main` branch
- Focus on specific changes; avoid unrelated edits
- Ensure the app builds and tests pass (e.g. `npm run build`, and any frontend test commands)
- Follow our [commit convention](#commit-convention)

### Submit PR

- Ensure your branch can be auto-merged (rebase on `main` if needed)
- Address any CI failures
- Respond to review comments promptly

For substantial changes, please split your contribution into multiple PRs when possible:

1. **First PR:** Structure, config, or shared components
2. **Second PR:** Core implementation (screens, features)
3. **Final PR:** Documentation and tests

## Commit Convention

We follow **Conventional Commits**. All commits and PRs should include type specifiers:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `chore:` maintenance (deps, tooling, etc.)
- `refactor:` code change that neither fixes a bug nor adds a feature
- `test:` adding or updating tests

Example: `feat(ui): add PermissionGate to user list actions`

## Project-Specific Notes (UI)

- **Stack:** React, Vite; use **axios** for HTTP (do not use `request`). Maintain **JSDoc** for functions and exports.
- **Premium UI:** Premium feature components and pages live under `src/features/Premium/`. Use `FeatureGate` and `PermissionGate` as described in the [README](README.md#️-the-security-model-developing-for-sessiondb).
- **Style:** Prefer functions and clear, maintainable modules; avoid adding new classes for new features.

## How can I get help?

- Open a [Discussion](https://github.com/sessiondb/sessiondb/discussions) or comment on relevant issues
- Tag maintainers in issues when you need guidance

## Where do I go from here?

- Set up your [development environment](README.md#-quick-start) (`npm install`, `npm run dev`)
- Ensure the Go backend is running and configured so the frontend can authenticate and fetch data
- Read [The Security Model](README.md#️-the-security-model-developing-for-sessiondb) when contributing to access-controlled or premium UI

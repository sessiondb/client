# Security Policy

## Supported Versions

We release security updates for the current major/minor line. We recommend staying on the latest release of the branch you use.

| Branch / Repo | Supported          |
|---------------|--------------------|
| SessionDB UI (this repo) | Latest release on `main` |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you believe you have found a security issue in the SessionDB frontend (e.g. token handling, XSS, insecure storage, or misuse of auth context), please report it privately:

1. **Contact the project maintainers** using a private channel (e.g. the contact method listed in the project README, or open a **private** security advisory on GitHub if the repo supports it).
2. Include a clear description of the issue, steps to reproduce, and impact.
3. Allow a reasonable time for a fix before any public disclosure.

We will acknowledge your report and work with you to understand and address the issue. We appreciate responsible disclosure and will credit reporters when we announce fixes (unless you prefer to remain anonymous).

## Scope

- **In scope (this repo):** The React frontend codebase—auth token handling, permission/feature gates, API client configuration, and any client-side logic that could lead to XSS or data exposure.
- **Out of scope here:** Backend/API vulnerabilities (report to the [SessionDB server](https://github.com/sessiondb/sessiondb) project per its SECURITY.md) and CLI/config handling (report to the [scli](https://github.com/sessiondb/scli) project per its SECURITY.md).

Thank you for helping keep SessionDB and our users safe.

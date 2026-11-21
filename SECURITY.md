# Security policy

## Supported versions

Only the latest 0.1.x release is supported while the plugin is in early
development.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository:
Security -> Advisories -> Report a vulnerability.

Do not open a public issue for a vulnerability, and do not include secrets,
tokens, session IDs, or private conversation text in a report. A proof of
concept with synthetic data is welcome.

## Security model

dsh-system-notify is a local notification plugin.

- It makes no network requests and runs no shell commands.
- It does not read or write files; the optional 80-character reply preview is
  kept in Host memory only.
- It registers same-origin POST routes behind DSH's connection fence.
- It writes only its own config row through the Host config editor.
- Notifications never carry approval actions; approving still happens in DSH.

## Out of scope

- Notifications suppressed by Focus mode, Do Not Disturb, or OS permission
  settings.
- Content visible on a lock screen when reply preview is deliberately enabled.
- Duplicate notifications across multiple connected clients in v1.
- Vulnerabilities in DeepSeek Harness itself; report those to the DSH project.

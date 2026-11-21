# Contributing

Thanks for taking the time to improve this plugin. It is intentionally small:
two plain JavaScript files, no runtime dependencies, and a short list of
invariants that keep it safe.

## Ground rules

- Keep the plugin local: no network requests, no telemetry, no analytics.
- Do not write conversation content to disk.
- Do not add approval actions to notifications.
- Do not introduce a runtime dependency without discussing it first.
- Keep the settings section usable with DSH's own design tokens; do not add a
  third-party UI framework.
- Update tests and CHANGELOG.md with behavior changes.

## Development setup

Requirements:

- Node.js 20 or newer.
- DeepSeek Harness 0.2.1-rc.2 or newer for manual testing.

Clone and test:

    git clone https://github.com/DaozeTang/dsh-system-notify.git
    cd dsh-system-notify
    npm test
    npm run check

There is no build step. The package is the source.

## Tests

    npm test
    npm run test:host
    npm run test:client

- test/host-check.mjs covers config normalization and validation.
- test/host-apply.mjs drives the Host routes and the turn-end classifier with a
  fake context.
- test/client-load.mjs loads the browser half through a fake module loader and
  checks the exported plugin shape.

When changing the client, at minimum run npm run check and test/client-load.
When changing the Host, add a case to host-apply.

## Try it in a profile

The safest loop uses a throwaway profile:

    DSH_HOME=/tmp/dsh-notify-dev \
      dsh --profile notify-dev --from-default-profile web

Then add the plugin to that profile, add it to dsh.profile.bundles, and boot:

    DSH_HOME=/tmp/dsh-notify-dev dsh --profile notify-dev --port 51999 --no-open

Open the printed URL. The test profile uses its own settings and sessions.

For the desktop app, a profile restart is required after changing the bundle or
package metadata. A page refresh only reloads the browser half.

## Pull requests

Before opening a PR:

- [ ] npm test passes.
- [ ] npm run check passes.
- [ ] The change is reflected in docs or CHANGELOG when user-visible.
- [ ] No new runtime dependency, network call, or stored conversation content.
- [ ] The settings section still works in light and dark themes.

Describe the problem, the approach, and what you tested. Screenshots help for
UI changes.

## Commit messages

Short imperative subjects are enough. Examples:

    fix: close notifications when the master switch is turned off
    docs: add upgrade instructions
    test: cover an error turn without a preview

## Reporting bugs

Use the issue form and include the DSH version, operating system, profile type
(desktop or web), notification permission state, timing mode, and steps to
reproduce. Never paste secrets, full commands, or private conversation text.

Security issues: see SECURITY.md.

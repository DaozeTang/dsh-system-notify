# Changelog

All notable changes to this project are documented here.

The format follows Keep a Changelog and the project uses semantic versioning.

## [0.4.0] - 2026-11-24

### Changed

- Targets DSH `^0.2.3-alpha.2`. The Browser half now injects `sessions`,
  `remote`, and `uiSession`, and reads waiting requests from
  `ctx.uiSession.pendingInteractions`. This fixes the load error
  `cannot get property "uiSession.sessionStatus" without inject`, which appeared
  after DSH 0.2.3 moved session status into its own injected service.
- Session titles come from `displayTitle` (falling back to `title`), and subagent
  detection follows `parentId`, matching the 0.2.3 Session list contract.
- Reply previews read the current `assistant/message` shape under `data.message`
  and still accept the older flat `data.content` shape.
- Host routes register with `auth: 'required'` and rely on DSH's Web
  authentication; the removed Connection admission API is no longer used.
- The settings panel stylesheet travels in the client module metadata
  (`meta.stylesheets`), so the renderer installs and removes it with the plugin
  instead of a hand-injected `<style data-plugin-css>` element.
- The plugin is named **System notifications** in both locales: the Chinese
  title, settings label, and test-notification title now use the English name.
  The settings copy itself stays translated.

### Removed

- The `@deepseek-ai/dsh-client-ui-plugin-manager` client dependency; the settings
  page still appears on the plugin's Plugins-page row through `settings.section`.

## [0.3.0] - 2026-11-22

### Added

- Quiet-while-viewing mode now also notifies when DSH is focused but the
  conversation that needs attention is not the one on screen: another
  conversation, another main page, or no open conversation.
- Current-conversation detection combines the active main panel with the
  session retained by the main view; an open Settings dialog counts as not
  viewing. The gate rechecks 250 ms before dispatch.

### Changed

- Renamed the default timing mode from "Only in the background" to "Only quiet
  while viewing", with matching live hints and documentation.

## [0.2.0] - 2026-11-22

### Changed

- Moved the plugin settings out of the plugin manager page into a top-level
  **Notifications** section in DSH Settings, using the Settings panel's native
  width, card material, title, and navigation icon.
- The plugin page now only enables, updates, or uninstalls the bundle; it no
  longer renders the settings form.

## [0.1.0] - 2026-11-22

### Added

- System notifications for four events: conversation finished, approval
  needed, authorization needed, and error.
- Timing modes: only in the background (default) and always.
- Background detection using document visibility and keyboard focus, with a
  250 ms re-check before dispatch and no backlog.
- Native settings page inside the plugin manager, with master switch, event
  switches, content switches, permission status, and test notification.
- Click-to-return: focuses DSH and opens the conversation; approval and
  authorization notifications land on the waiting card.
- Host-side turn/end classification, so manual stops are not reported as
  completions.
- Grouped completion notifications, per-session error throttling, and
  deduplication.
- Theme-aware transparent bell icon that works on light and dark surfaces.
- English and Chinese UI dictionaries.
- Unit tests for config validation, Host routes, turn classification, and
  browser-half loading.

### Notes

- Reply previews are off by default.
- Approval is never granted from a notification.
- No runtime dependencies, network requests, telemetry, or session-log writes.
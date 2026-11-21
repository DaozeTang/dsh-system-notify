# Design

## Problem

DSH turns can run for minutes while the user is in another window. The events
that matter are few and specific:

1. a turn finishes and control returns to the user;
2. a tool is waiting for approval;
3. a plan, question, or Computer Use consent is waiting for authorization;
4. a turn fails.

The plugin turns exactly those moments into operating-system notifications,
without becoming another inbox.

## Goals and non-goals

Goals:

- Accurate: distinguish finished, stopped, blocked, and failed turns.
- Quiet: default to quiet while viewing and keep reply content off.
- Actionable: a click returns to the exact conversation and waiting card.
- Native: use DSH design tokens, switch language, and the plugin settings section.
- Local: no network, no telemetry, no session-log writes.

Non-goals:

- No always-on-top window, menu-bar extra, or desktop companion.
- No webhook, chat-app, or email delivery.
- No approval from the notification itself.
- No cross-device presence election in v1.
- No model-facing tools or prompt changes.

## Event model

| Event | Source | Rule |
| --- | --- | --- |
| Conversation finished | Host turn/end reason completed | Main sessions only; one per turn. |
| Approval needed | Client pendingInteraction.kind = approval | One per pending key. |
| Authorization needed | Client pendingInteraction.kind = question / plan-review | One per pending key. |
| Error | Host turn/end reason error, or api-session/error without a turn record | Terminal failures only. |

The Host classifies turn/end into completed, aborted, blocked, error, max-tokens,
interrupted, and forked. Only completed and error notify. This avoids treating a
user-initiated stop as a completion.

## Quiet gate

A notification stays quiet only when the app is in the foreground *and* the
conversation that needs attention is the one on screen:

    const foreground =
      document.visibilityState === "visible" &&
      document.hasFocus()
    const settingsOpen =
      document.querySelector('[data-shortcut-modal="settings"]') !== null
    const conversationPanelOpen =
      ctx.layout.panelInfo.getSnapshot().activePanelId === null
    const eventSessionOnScreen =
      ctx.sessions.list.getSnapshot()
        .byId[eventSessionId]?.retainedBy?.mainView > 0

- The Settings dialog counts as not viewing: while it is open, no conversation
  is considered on screen.
- Event-time check: an event that is already visible is dropped, never queued.
- Dispatch-time check: 250 ms later, the event is dropped if the user switched
  to that conversation or DSH came back.
- Quiet-while-viewing mode uses this gate; always mode bypasses it.
- Pending interactions use the same gate, so approvals do not banner over the
  approval card while the user is already looking at it. A pending request in
  another conversation still notifies.

The gate is per client. A desktop client and a browser tab evaluate their own
visibility, panel, and current session. V1 accepts that two clients viewing a
third conversation can both notify; a future version can elect one notifier
through a Host presence lease.

## Notification behavior

- Completion notifications are grouped over a four-second window. Multiple
  completions become "N conversations finished" and open the latest one.
- Approvals and authorization requests are never grouped: each is a distinct
  blocking request.
- Errors for one conversation are throttled to one per minute.
- Non-urgent notifications are spaced by at least 1.5 seconds.
- Approval and authorization notifications use requireInteraction where the
  platform supports it; when the pending interaction resolves, the plugin closes
  the notification.
- Clicking focuses DSH and calls ctx.uiWorkspace.openSession(sessionId).
- The notification never contains Allow/Reject actions. Accidental approval from
  a lock screen or a presentation is worse than a second click.

## Settings

The settings surface is a `settings.section` contribution rendered by the DSH
Settings panel, plus a matching `settings.section.icon`. It is not a
`plugins.bundle.config` entry, so the plugin manager page only handles enabling
and uninstalling the bundle.

The section is a top-level **Notifications** row in Settings (order 20, after the
built-in pages). It uses the panel's 612px options column, a native 16/24 page
title and 14/22 intro, and native `settings-card-fill` / `settings-card-stroke`
cards. The order inside the page is deliberate:

1. Title and intro: name the surface and state what it controls.
2. When to notify: the primary product decision, with a live foreground
   indicator.
3. Events: four switches, each with an explicit exclusion.
4. Notification content: title, reply preview, sound.
5. Permission and test: the system gate and a test button.
6. Footer: save immediately, local only, Focus can suppress.

All changes save immediately as a patch to the plugin's own config row. The
client applies the patch optimistically and refreshes from the Host on failure.

## Architecture

    DSH Host
      session/event -> turn/end classifier -> bounded in-memory map
                       assistant/message   -> optional 80-char preview

      POST /api/system-notify/status   -> config + capabilities
      POST /api/system-notify/config   -> configEditor row patch
      POST /api/system-notify/turn-end -> last turn classification

    DSH Client
      api-session/status -
      api-session/error  -+-> state machine -> quiet gate -> Notification API
      uiSession.pending  -

      notification click -> window.focus() + openSession(sessionId)

### Host

- Listens to session/event and keeps the last turn/end per session.
- Keeps only the most recent assistant text as an optional preview.
- Bounds the map to 200 sessions and 24 hours.
- Registers three same-origin POST routes behind DSH's connection fence.
- Writes only its own config row through configEditor.
- No files, no network, no session-log writes.

### Browser

- Seeds session titles from ctx.sessions.list.
- Tracks running transitions with api-session/status and errors with
  api-session/error.
- Reads pendingInteraction from ctx.uiSession rather than intercepting the
  approval waterfall, so the approval card's own decision chain is untouched.
- Applies the focus and current-conversation gate and calls the Notification API.
- Renders the settings section and requests notification permission only from a
  user gesture.

## Data and privacy

- Notification title, body, tag, and timing only.
- Reply preview: optional, 80 characters, in memory only, never persisted.
- No remote requests; no telemetry.
- Approval decisions never travel through the plugin.

## Failure modes

| Failure | Behavior |
| --- | --- |
| Permission denied | No notification; the settings section explains recovery. |
| Notification constructor throws | No crash; a diagnostic is logged. |
| Host route unavailable | Client falls back to status + error events. |
| Host restart loses turn records | Client treats the next idle transition as a completion unless an error was seen. |
| Session removed | Pending notifications close; clicks only focus DSH. |
| Multiple clients | Each evaluates focus and the open conversation independently in v1. |

## Alternatives considered

**In-app toast only.** Rejected: it cannot reach a user who is in another
application, which is the whole point.

**Watch approval events directly.** Rejected: the approval waterfall is a
scoped interaction chain; a downstream listener would block the card or run too
late. Reading the published pending-interaction state is non-invasive.

**Approve from the notification.** Rejected for safety and because notification
actions are not consistently supported across platforms.

**Read history for every completion.** Rejected: opening every session's history
just to classify a turn is expensive. The Host can classify the event once as it
arrives.

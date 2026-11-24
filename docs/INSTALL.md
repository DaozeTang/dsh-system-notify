# Install

[Back to README](../README.md) · [Usage](USAGE.md)

## Requirements

- DeepSeek Harness `^0.2.3-alpha.2` (tested on `0.2.3-alpha.2`).
- A DSH profile where you can add a bundle (normally `desktop`).
- Node.js 24.22.3+ for development and tests.

## Install through the plugin manager

Open **Plugins** in the sidebar, choose **Add plugin**, and enter the GitHub
repository:

```text
https://github.com/DaozeTang/dsh-system-notify
```

After installation, make sure `dsh-system-notify` appears in the profile's
`dsh.profile.bundles` list. The plugin manager normally adds it; if it does not,
add it manually as described below.

## Install with the DSH CLI

The CLI forwards to pnpm in the selected profile:

```bash
dsh plugin --profile desktop add github:DaozeTang/dsh-system-notify
```

Then edit `~/.dsh/profiles/desktop/package.json` and add the bundle:

```json
{
  "dsh": {
    "profile": {
      "bundles": [
        "...",
        "dsh-system-notify"
      ]
    }
  }
}
```

## Install from a local checkout

```bash
git clone https://github.com/DaozeTang/dsh-system-notify.git
cd dsh-system-notify
dsh plugin --profile desktop add "file:$(pwd)"
```

Add `"dsh-system-notify"` to `dsh.profile.bundles` as above.

If you prefer a self-contained profile copy:

```bash
mkdir -p ~/.dsh/profiles/desktop/local-plugins
cp -R /path/to/dsh-system-notify \
  ~/.dsh/profiles/desktop/local-plugins/dsh-system-notify
cd ~/.dsh/profiles/desktop
pnpm add file:./local-plugins/dsh-system-notify --ignore-scripts
```

Then add the bundle.

## Restart

Package and bundle changes are read when DSH starts. Quit DeepSeek Harness
completely and reopen it. A window refresh is not enough.

## Verify

1. Open **Plugins** in the sidebar and confirm `dsh-system-notify` appears under
   **Installed plugins** with the Host component marked **Running**.
2. Open **Settings → System notifications**.
3. Click **Allow notifications**.
4. Click **Send test notification**.
5. Switch to another conversation, or away from DSH, and let a turn finish.

## Upgrade

```bash
dsh plugin --profile desktop add github:DaozeTang/dsh-system-notify@latest
```

Or update through the plugin manager. Restart DSH after the package changes.

## Uninstall

Use **Uninstall** on the plugin page, or remove the package and the bundle entry:

```bash
cd ~/.dsh/profiles/desktop
pnpm remove dsh-system-notify
```

Remove `"dsh-system-notify"` from `dsh.profile.bundles`, then restart DSH.

## Test profile

To try a change without touching your main profile:

```bash
DSH_HOME=/tmp/dsh-notify-dev \
  dsh --profile notify-dev --from-default-profile web

# add the local package to the new profile, add the bundle, then:
DSH_HOME=/tmp/dsh-notify-dev dsh --profile notify-dev --port 51999 --no-open
```

Open the printed URL. The plugin follows the profile's language.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| No System notifications section | Bundle missing from `dsh.profile.bundles`, or DSH not restarted. |
| Settings section is read-only | The profile has no `configEditor` capability. |
| No notifications | Permission not granted, Focus mode, or the plugin's master switch is off. |
| Test notification works, completions do not | Timing is **Only quiet while viewing**; switch to another conversation or keep DSH out of focus and try again. |
| Nothing after an error | The turn may have been a recoverable tool error; only terminal failures notify. |
| Click opens DSH but window stays behind | Platform window-focus limitation; see [Usage](USAGE.md#known-limits). |
| Two devices notify | Each client evaluates focus independently in v1. |

If the problem persists, open an issue with the DSH version, OS, profile type,
notification permission state, and the relevant log lines.

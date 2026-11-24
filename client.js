// SPDX-License-Identifier: MIT
/**
 * DSH system notifications — Browser half.
 *
 * Registers the Cordis plugin through the DSH client module loader. The panel
 * stylesheet travels in the module metadata, so the renderer installs it with
 * the plugin and removes it on unload.
 */

window.__ModuleLoader__.load({
  id: 'dsh-system-notify',
  /**
   * Module metadata: the renderer installs this stylesheet with the module and
   * removes it on unload. The text is built here, inside the function, so a hot
   * replacement can execute this script again without redeclaring anything.
   * @returns the client module metadata.
   */
  meta: function () {
    const css = [
    '.sn-page{display:flex;flex-direction:column;gap:12px;max-width:720px;padding:0 0 8px;box-sizing:border-box}',
    '.sn-head{display:flex;flex-direction:column;gap:4px;margin-bottom:6px}',
    '.sn-title{margin:0;font-size:16px;line-height:24px;font-weight:500;color:var(--dsw-alias-label-primary)}',
    '.sn-intro{margin:0;color:var(--dsw-alias-label-tertiary);font-size:14px;line-height:22px}',
    '.sn-card{background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-1));border:.5px solid var(--dsw-alias-settings-card-stroke,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-xl,12px);padding:14px 16px 4px;min-width:0}',
    '.sn-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding-bottom:10px}',
    '.sn-card-head-main{min-width:0}',
    '.sn-card-title{margin:0;font-size:14px;line-height:22px;font-weight:500}',
    '.sn-card-sub{margin:2px 0 0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
    '.sn-master{display:inline-flex;align-items:center;gap:9px;flex:none;padding-top:1px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
    '.sn-master-label{white-space:nowrap}',
    '.sn-modes{display:flex;flex-direction:column;gap:8px;padding:2px 0 10px}',
    '.sn-mode{display:block;width:100%;padding:12px 14px 11px;border:.5px solid var(--dsw-alias-settings-card-stroke,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-lg,10px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;box-sizing:border-box;transition:border-color 120ms ease,background-color 120ms ease}',
    '.sn-mode:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
    '.sn-mode.sn-selected{border-color:color-mix(in srgb,var(--dsw-alias-label-primary) 24%,transparent);background:color-mix(in srgb,var(--dsw-alias-label-primary) 3.2%,transparent)}',
    '.sn-mode:disabled{opacity:.45;cursor:default}',
    '.sn-mode:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}',
    '.sn-mode-top{display:flex;align-items:center;gap:10px;min-width:0}',
    '.sn-radio{flex:none;display:grid;place-items:center;width:17px;height:17px;border:1.5px solid var(--dsw-alias-label-tertiary);border-radius:50%;box-sizing:border-box}',
    '.sn-selected .sn-radio{border-color:var(--dsw-alias-label-primary)}',
    '.sn-radio:after{content:"";width:7px;height:7px;border-radius:50%;background:transparent}',
    '.sn-selected .sn-radio:after{background:var(--dsw-alias-label-primary)}',
    '.sn-mode-icon{display:inline-flex;width:20px;height:20px;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary)}',
    '.sn-selected .sn-mode-icon{color:var(--dsw-alias-label-primary)}',
    '.sn-mode-name{font-size:14px;line-height:22px;font-weight:500}',
    '.sn-badge{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:4px;background:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary);font-size:10.5px;line-height:18px;font-weight:500;white-space:nowrap}',
    '.sn-mode-desc{margin:3px 0 0 47px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
    '.sn-live{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:8px 0 2px 47px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}',
    '.sn-live-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent)}',
    '.sn-live-dot.sn-bg{background:var(--dsw-alias-label-tertiary);box-shadow:none}',
    '.sn-rows{display:flex;flex-direction:column}',
    '.sn-row{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:12px;min-height:58px;padding:12px 0;border-top:.5px solid var(--dsw-alias-border-l2)}',
    '.sn-row:first-child{border-top:0}',
    '.sn-row-icon{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-label-secondary) 9%,transparent);color:var(--dsw-alias-label-secondary)}',
    '.sn-row-icon.sn-green{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);color:var(--dsw-alias-state-success-primary)}',
    '.sn-row-icon.sn-amber{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 14%,transparent);color:var(--dsw-alias-state-warn-primary)}',
    '.sn-row-icon.sn-blue{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 12%,transparent);color:var(--dsw-alias-state-business-primary)}',
    '.sn-row-icon.sn-red{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary)}',
    '.sn-row-main{min-width:0}',
    '.sn-row-title{font-size:14px;line-height:22px;font-weight:500}',
    '.sn-row-desc{margin-top:1px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
    '.sn-row-action{display:flex;align-items:center;justify-content:flex-end}',
    '.sn-content-row{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:56px;padding:12px 0;border-top:.5px solid var(--dsw-alias-border-l2)}',
    '.sn-content-row:first-child{border-top:0}',
    '.sn-switch{position:relative;flex:none;width:36px;height:20px;padding:2px;border:0;border-radius:999px;background:var(--dsw-alias-border-l3);cursor:pointer;box-sizing:border-box;transition:background 120ms ease}',
    '.sn-switch.sn-on{background:var(--dsw-alias-brand-primary)}',
    '.sn-switch:disabled{opacity:.45;cursor:default}',
    '.sn-switch:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}',
    '.sn-knob{display:block;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-switch-thumb);box-shadow:0 1px 2px rgba(0,0,0,.16);transition:transform 120ms ease}',
    '.sn-switch.sn-on .sn-knob{transform:translateX(16px);background:var(--dsw-alias-label-primary-foreground)}',
    '.sn-muted{opacity:.62}',
    '.sn-banner{display:flex;align-items:flex-start;flex-wrap:wrap;gap:10px 12px;padding:12px 14px;border:.5px solid color-mix(in srgb,var(--dsw-alias-state-warn-primary) 30%,transparent);border-radius:var(--dsw-radius-xl,12px);background:color-mix(in srgb,var(--dsw-alias-state-warn-tertiary) 62%,var(--dsw-alias-bg-base))}',
    '.sn-banner.sn-info{border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 28%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-business-tertiary) 52%,var(--dsw-alias-bg-base))}',
    '.sn-banner-icon{flex:none;display:grid;place-items:center;width:26px;height:26px;margin-top:1px;border-radius:50%;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 16%,transparent);color:var(--dsw-alias-state-warn-primary);font-size:14px;font-weight:600;line-height:1}',
    '.sn-info .sn-banner-icon{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 14%,transparent);color:var(--dsw-alias-state-business-primary)}',
    '.sn-banner-main{flex:1 1 260px;min-width:0}',
    '.sn-banner-title{font-size:14px;line-height:22px;font-weight:500}',
    '.sn-banner-desc{margin-top:1px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
    '.sn-banner-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;flex:none;align-self:center;margin-left:auto}',
    '.sn-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:none;height:30px;padding:0 11px;border:1px solid var(--dsw-alias-border-l3);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;line-height:18px;font-weight:500;white-space:nowrap;cursor:pointer}',
    '.sn-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
    '.sn-btn:disabled{opacity:.45;cursor:default}',
    '.sn-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}',
    '.sn-btn.sn-text{border-color:transparent;background:transparent;color:var(--dsw-alias-label-secondary);font-weight:400}',
    '.sn-btn.sn-primary{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-inverted)}',
    '.sn-permission{display:flex;align-items:center;flex-wrap:wrap;justify-content:space-between;gap:12px 20px;padding:6px 0 10px}',
    '.sn-perm-main{display:flex;align-items:flex-start;flex:1 1 260px;gap:10px;min-width:0}',
    '.sn-dot{flex:none;width:8px;height:8px;margin-top:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent)}',
    '.sn-dot.sn-warn{background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent)}',
    '.sn-dot.sn-error{background:var(--dsw-alias-state-error-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent)}',
    '.sn-perm-title{font-size:14px;line-height:22px;font-weight:500}',
    '.sn-perm-desc{margin-top:1px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
    '.sn-help{margin-top:10px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-2)}',
    '.sn-help-title{font-size:13px;line-height:20px;font-weight:500}',
    '.sn-help p{margin:5px 0 10px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
    '.sn-footnote{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:10px 2px 0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}',
    '.sn-sep{color:var(--dsw-alias-label-dimmed,var(--dsw-alias-border-l4))}',
    '.sn-error{margin:0;padding:9px 11px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 9%,transparent);color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}',
    '.sn-toast{position:sticky;bottom:0;align-self:flex-start;margin:0 2px;padding:6px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;box-shadow:var(--dsw-shadow-lv2,0 6px 18px rgba(0,0,0,.12))}',
    '@media (max-width:760px){.sn-mode-desc,.sn-live{margin-left:0}.sn-permission{align-items:flex-start;flex-direction:column}.sn-banner{align-items:flex-start;flex-wrap:wrap}.sn-banner-actions{align-self:flex-start}}',
    '@media (prefers-reduced-motion:reduce){.sn-switch,.sn-knob,.sn-mode{transition:none}}',
    ].join(String.fromCharCode(10))
    return {
      stylesheets: {
        'client.css': { text: function () { return css } },
      },
    }
  },
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      useEffect, useMemo, useRef, useState, useSyncExternalStore,
    } = React

    const SECTION_ID = 'system-notify'
    const ROUTE_PREFIX = '/api/system-notify'
    const LOCALE_NS = 'systemNotify'
    const ONBOARDING_KEY = 'dsh-system-notify:onboarding-dismissed'
    const MAX_PREVIEW = 80
    const GROUP_WINDOW_MS = 4000
    const ERROR_COOLDOWN_MS = 60000
    const GLOBAL_INTERVAL_MS = 1500
    const FOCUS_DEBOUNCE_MS = 250
    const BOOT_QUIET_MS = 1200

    const DEFAULTS = {
      enabled: true,
      mode: 'background',
      events: { complete: true, approval: true, authorization: true, error: true },
      content: { showTitle: true, replyPreview: false, sound: true },
    }

    const EN = {
      'settings.nav': 'System notifications',
      'settings.title': 'System notifications',
      'settings.intro': 'Choose when DSH should reach you, and what each notification includes.',
      'section.timing': 'When to notify',
      'section.timingDesc': 'Choose when DSH should get your attention.',
      'section.events': 'Events',
      'section.eventsDesc': 'Only these four moments can interrupt you.',
      'section.content': 'Notification content',
      'section.contentDesc': 'Quiet by default; opt in to more detail.',
      'section.permission': 'Permission and test',
      'section.permissionDesc': 'The system shows notifications; DSH only triggers them.',
      'master.enable': 'Enabled',
      'master.off': 'Paused',
      'mode.background': 'Only quiet while viewing',
      'mode.backgroundDesc': 'Stay quiet only while the conversation that needs you is on screen. Notify when you switch to another conversation, open another page, minimize, or leave DSH.',
      'mode.always': 'Always',
      'mode.alwaysDesc': 'Notify whenever a condition is met, even while DSH is in the foreground.',
      'mode.recommended': 'Recommended',
      'mode.live.foreground': 'DSH is in the foreground',
      'mode.live.background': 'DSH is in the background',
      'mode.live.hintForeground': 'Quiet only for the conversation on screen',
      'mode.live.hintBackground': 'Notifications are active now',
      'mode.live.always': 'Even while you are viewing',
      'event.complete': 'Conversation finished',
      'event.completeDesc': 'A turn ended normally and control returned to you. Subagent sessions and manual stops are excluded.',
      'event.approval': 'Approval needed',
      'event.approvalDesc': 'A tool asks for higher permission. The notification stays in Notification Center until you handle it.',
      'event.authorization': 'Authorization needed',
      'event.authorizationDesc': 'Computer Use app access, plan review, or an assistant question waiting for your answer.',
      'event.error': 'Error',
      'event.errorDesc': 'This turn failed, disconnected, or the model errored. Recoverable tool errors stay quiet.',
      'content.showTitle': 'Show conversation title',
      'content.showTitleDesc': 'Include which conversation this is, such as "Weekly report data check".',
      'content.replyPreview': 'Include reply preview',
      'content.replyPreviewDesc': 'Show the first 80 characters of the reply. Off: only the event and title.',
      'content.sound': 'Play sound',
      'content.soundDesc': 'Use the system notification sound. Silent, Focus, and Do Not Disturb still apply.',
      'permission.granted': 'System notifications are allowed',
      'permission.grantedDesc': 'Shown in the system notification center. Focus modes may suppress it.',
      'permission.default': 'System notifications are off',
      'permission.defaultDesc': 'The system will ask for permission the first time you enable them.',
      'permission.denied': 'System notifications are blocked',
      'permission.deniedDesc': 'Allow notifications for DSH in system settings, then check again.',
      'permission.unsupported': 'This browser does not support system notifications',
      'permission.unsupportedDesc': 'Use the desktop app, or allow notifications for this site in the browser.',
      'permission.allow': 'Allow notifications',
      'permission.retry': 'Check again',
      'permission.test': 'Send test notification',
      'permission.testing': 'Sending...',
      'permission.openSettings': 'Open system settings',
      'permission.testSent': 'Test notification sent',
      'permission.testFailed': 'Could not send a notification',
      'permission.grantedToast': 'System notifications are allowed',
      'permission.stillDenied': 'Notifications are still blocked',
      'banner.firstTitle': 'Allow system notifications',
      'banner.firstDesc': 'DSH needs permission to reach you when the conversation that needs you is not on screen.',
      'banner.later': 'Later',
      'banner.deniedTitle': 'System notifications are turned off',
      'banner.deniedDesc': 'Allow notifications for DSH in system settings, then check again.',
      'help.title': 'How to allow notifications',
      'help.mac': 'Open System Settings, then Notifications, then DeepSeek Harness, and turn on Allow Notifications.',
      'help.windows': 'Open Settings, then System, then Notifications, and allow notifications for DeepSeek Harness.',
      'help.web': 'Open this site settings from the browser address bar and allow notifications.',
      'help.close': 'Close',
      'error.status': 'Could not read plugin settings',
      'error.save': 'Could not save the change',
      'error.host': 'The plugin host is unavailable. Showing the last settings read.',
      'error.readOnly': 'Settings are read-only in this profile.',
      'footnote.save': 'Changes save immediately',
      'footnote.local': 'Notifications stay on this device',
      'footnote.focus': 'Focus modes can suppress them',
      'notify.done': 'Conversation finished · {title}',
      'notify.donePlain': 'Conversation finished',
      'notify.doneBody': 'Click to return to the conversation',
      'notify.doneGrouped': '{n} conversations finished',
      'notify.approval': 'Waiting for approval · {tool}',
      'notify.approvalPlain': 'Waiting for approval',
      'notify.approvalBody': '{title} · needs your permission to continue',
      'notify.approvalBodyPlain': 'Needs your permission to continue',
      'notify.authorization': 'Waiting for your authorization',
      'notify.authorizationBody': '{title} · {kind}',
      'notify.authorizationBodyPlain': 'Waiting for your decision',
      'notify.authorizationQuestion': 'the assistant is waiting for your answer',
      'notify.authorizationPlan': 'a plan is waiting for your confirmation',
      'notify.error': 'Conversation failed · {title}',
      'notify.errorPlain': 'Conversation failed',
      'notify.errorBody': 'This turn did not finish. Click for details.',
      'notify.untitled': 'Untitled conversation',
      'notify.testTitle': 'Test notification · System notifications',
      'notify.testBody': 'This is a test notification. Click to return to DSH.',
      'notify.open': 'Open conversation',
    }

    const ZH = {
      'settings.nav': 'System notifications',
      'settings.title': 'System notifications',
      'settings.intro': '选择 DSH 什么时候提醒你，以及每条通知里包含什么。',
      'section.timing': '提醒时机',
      'section.timingDesc': '选择什么时候把 DSH 叫回你的注意力。',
      'section.events': '提醒事件',
      'section.eventsDesc': '只在这四类情况发生时才打扰你。',
      'section.content': '通知内容',
      'section.contentDesc': '默认尽量少暴露内容，需要时再打开。',
      'section.permission': '权限与测试',
      'section.permissionDesc': '通知由系统显示，DSH 只负责在正确的时机触发。',
      'master.enable': '启用',
      'master.off': '已暂停',
      'mode.background': '仅查看时安静',
      'mode.backgroundDesc': '只有需要提醒的会话正好显示在屏幕上时才保持安静；切到其他会话、打开其他页面、最小化或离开 DSH 后都会提醒。',
      'mode.always': '始终提醒',
      'mode.alwaysDesc': '满足条件就提醒，即使 DSH 正在前台。适合录制、演示或多屏工作时不想错过状态的情况。',
      'mode.recommended': '推荐',
      'mode.live.foreground': 'DSH 当前处于前台',
      'mode.live.background': 'DSH 当前在后台',
      'mode.live.hintForeground': '只有当前屏幕上的会话不提醒',
      'mode.live.hintBackground': '现在满足条件就会提醒',
      'mode.live.always': '即使正在查看也会提醒',
      'event.complete': '对话完成',
      'event.completeDesc': '一轮回复正常结束，控制权回到你手里。子会话和主动中止不提醒。',
      'event.approval': '需要审批',
      'event.approvalDesc': '工具请求更高权限、等待你允许时提醒。通知会留在通知中心，直到你处理或关闭。',
      'event.authorization': '需要授权',
      'event.authorizationDesc': 'Computer Use 应用授权、计划确认，或助手向你提问、等你回答时。',
      'event.error': '出错',
      'event.errorDesc': '本轮失败、连接中断或模型报错时提醒。普通工具报错不打扰。',
      'content.showTitle': '显示会话标题',
      'content.showTitleDesc': '通知标题带上是哪一段对话，比如「周报数据核对」。',
      'content.replyPreview': '包含回复摘要',
      'content.replyPreviewDesc': '显示回复的前 80 个字符。关闭后，通知里只有事件类型和会话标题。',
      'content.sound': '播放提示音',
      'content.soundDesc': '使用系统默认通知声音。静音、专注模式和勿扰模式仍由系统控制。',
      'permission.granted': '系统通知已允许',
      'permission.grantedDesc': '通知会显示在系统通知中心，受专注模式影响。',
      'permission.default': '系统通知未开启',
      'permission.defaultDesc': '第一次开启时，系统会请求通知权限。',
      'permission.denied': '系统通知未授权',
      'permission.deniedDesc': '在系统设置里为 DSH 打开通知，然后回来重新检查。',
      'permission.unsupported': '当前浏览器不支持系统通知',
      'permission.unsupportedDesc': '请使用桌面端，或在浏览器站点设置中允许通知。',
      'permission.allow': '允许通知',
      'permission.retry': '重新检查',
      'permission.test': '发送测试通知',
      'permission.testing': '发送中…',
      'permission.openSettings': '打开系统设置',
      'permission.testSent': '测试通知已发送',
      'permission.testFailed': '无法发送通知',
      'permission.grantedToast': '系统通知已允许',
      'permission.stillDenied': '系统通知仍未允许',
      'banner.firstTitle': '允许系统通知',
      'banner.firstDesc': '允许后，DSH 才能在需要提醒的会话不在屏幕上时通知你。',
      'banner.later': '稍后',
      'banner.deniedTitle': '系统通知已被关闭',
      'banner.deniedDesc': '在系统设置里为 DSH 打开通知，再回来重新检查。',
      'help.title': '如何允许通知',
      'help.mac': '打开 系统设置 → 通知 → DeepSeek Harness，然后打开「允许通知」。',
      'help.windows': '打开 设置 → 系统 → 通知，然后允许 DeepSeek Harness 的通知。',
      'help.web': '从浏览器地址栏进入站点设置，允许通知。',
      'help.close': '关闭',
      'error.status': '无法读取插件设置',
      'error.save': '无法保存更改',
      'error.host': '插件宿主暂不可用，当前显示的是上次读取的设置。',
      'error.readOnly': '当前配置只读。',
      'footnote.save': '更改会立即保存',
      'footnote.local': '通知只在本机显示',
      'footnote.focus': '专注模式可能暂时屏蔽',
      'notify.done': '对话完成 · {title}',
      'notify.donePlain': '对话完成',
      'notify.doneBody': '点击回到对话',
      'notify.doneGrouped': '{n} 个对话已完成',
      'notify.approval': '等待审批 · {tool}',
      'notify.approvalPlain': '等待审批',
      'notify.approvalBody': '{title} · 需要你允许后继续',
      'notify.approvalBodyPlain': '需要你允许后继续',
      'notify.authorization': '等待你的授权',
      'notify.authorizationBody': '{title} · {kind}',
      'notify.authorizationBodyPlain': '等待你的决定',
      'notify.authorizationQuestion': '助手在等你回答',
      'notify.authorizationPlan': '计划等待你的确认',
      'notify.error': '对话出错 · {title}',
      'notify.errorPlain': '对话出错',
      'notify.errorBody': '本轮没有完成，点击查看详情。',
      'notify.untitled': '未命名对话',
      'notify.testTitle': '测试通知 · System notifications',
      'notify.testBody': '这是一条测试通知。点击回到 DSH。',
      'notify.open': '打开对话',
    }

    function makeT(active) {
      const dict = typeof active === 'string' && active.toLowerCase().indexOf('zh') === 0 ? ZH : EN
      return function t(key, params) {
        const raw = dict[key] ?? EN[key] ?? key
        if (params === undefined) return raw
        return raw.replace(new RegExp('[{]([A-Za-z0-9_]+)[}]', 'g'), function (_, name) {
          return String(params[name] ?? '')
        })
      }
    }

    function messageOf(error) {
      if (error instanceof Error) return error.message
      return typeof error === 'string' ? error : 'unknown error'
    }

    function cleanText(text, max) {
      const limit = max ?? MAX_PREVIEW
      let value = String(text ?? '')
      const fence = String.fromCharCode(96, 96, 96)
      const fenced = value.split(fence)
      if (fenced.length > 1) {
        value = fenced.filter(function (_, index) { return index % 2 === 0 }).join(' ')
      }
      let out = ''
      let space = false
      for (const ch of value) {
        const code = ch.charCodeAt(0)
        if (code === 32 || code === 9 || code === 10 || code === 13) {
          space = true
          continue
        }
        if ('#*_>~'.includes(ch) || code === 96) {
          space = true
          continue
        }
        if (space && out !== '') out += ' '
        space = false
        out += ch
      }
      return out.trim().slice(0, limit)
    }

    function isForeground() {
      try {
        return document.visibilityState === 'visible' && document.hasFocus()
      } catch {
        return true
      }
    }

    function isConversationOnScreen(sessionId) {
      if (typeof sessionId !== 'string') return false
      try {
        if (typeof document !== 'undefined' && document.querySelector('[data-shortcut-modal="settings"]') !== null) return false
        const layout = RUNTIME.ctx?.get?.('layout')
        const panel = layout?.panelInfo?.getSnapshot?.()
        if (panel !== undefined && panel !== null && panel.activePanelId !== null && panel.activePanelId !== undefined) return false
        const row = sessionRows.get(sessionId)
        return Number(row?.retainedBy?.mainView ?? 0) > 0
      } catch {
        return false
      }
    }

    function permissionState() {
      if (typeof Notification === 'undefined') return 'unsupported'
      try {
        return Notification.permission
      } catch {
        return 'unsupported'
      }
    }

    function readDismissed() {
      try {
        return window.localStorage.getItem(ONBOARDING_KEY) === '1'
      } catch {
        return false
      }
    }

    function writeDismissed() {
      try {
        window.localStorage.setItem(ONBOARDING_KEY, '1')
      } catch {
        // Dismissal is best effort.
      }
    }

    function mergeConfig(current, patch) {
      const base = current ?? DEFAULTS
      const next = patch ?? {}
      const result = {
        ...base,
        ...(typeof next.enabled === 'boolean' ? { enabled: next.enabled } : {}),
        ...(next.mode === 'background' || next.mode === 'always' ? { mode: next.mode } : {}),
      }
      if (next.events !== undefined) result.events = { ...base.events, ...next.events }
      if (next.content !== undefined) result.content = { ...base.content, ...next.content }
      return result
    }


    function createStore(initial) {
      let snapshot = initial
      const listeners = new Set()
      return {
        get: function () { return snapshot },
        set: function (patch) {
          const next = typeof patch === 'function' ? patch(snapshot) : patch
          snapshot = { ...snapshot, ...next }
          for (const listener of [...listeners]) listener()
        },
        subscribe: function (listener) {
          listeners.add(listener)
          return function () { listeners.delete(listener) }
        },
      }
    }

    const store = createStore({
      status: null,
      statusError: null,
      saving: false,
      savingKey: null,
      configError: null,
      permission: permissionState(),
      foreground: isForeground(),
      toast: null,
      onboardingDismissed: readDismissed(),
      showSettingsHelp: false,
    })

    function useStore() {
      return useSyncExternalStore(store.subscribe, store.get)
    }

    const RUNTIME = {
      ctx: null,
      t: function (key) { return key },
      refreshStatus: async function () {},
      saveConfig: async function () { return false },
      requestPermission: async function () { return permissionState() },
      sendTest: async function () {},
      openSystemSettings: function () {},
      dispose: function () {},
    }

    let toastTimer
    function toast(message) {
      store.set({ toast: message })
      clearTimeout(toastTimer)
      toastTimer = setTimeout(function () { store.set({ toast: null }) }, 3000)
    }

    function useT() {
      const ctx = RUNTIME.ctx
      const [active, setActive] = useState(function () {
        return ctx?.locale?.getSnapshot?.()?.active ?? 'en'
      })
      useEffect(function () {
        if (!ctx?.locale?.subscribe) return undefined
        return ctx.locale.subscribe(function () {
          setActive(ctx.locale.getSnapshot()?.active ?? 'en')
        })
      }, [ctx])
      const t = useMemo(function () { return makeT(active) }, [active])
      return [t]
    }

    let inflightStatus
    async function request(route, body) {
      const response = await fetch(ROUTE_PREFIX + route, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body ?? {}),
      })
      let payload
      try {
        payload = await response.json()
      } catch {
        throw new Error(response.ok ? 'Empty response' : 'HTTP ' + response.status)
      }
      if (payload === null || typeof payload !== 'object') throw new Error('Malformed response')
      if (payload.ok !== true) {
        const error = new Error(String(payload.message ?? payload.code ?? 'Request failed'))
        error.code = payload.code
        throw error
      }
      return payload.value
    }

    async function refreshStatus() {
      if (inflightStatus !== undefined) return inflightStatus
      inflightStatus = (async function () {
        try {
          const value = await request('/status')
          store.set({
            status: value,
            statusError: null,
            permission: permissionState(),
            foreground: isForeground(),
          })
          return value
        } catch (error) {
          store.set({ statusError: { message: messageOf(error), code: error?.code } })
          return undefined
        } finally {
          inflightStatus = undefined
        }
      })()
      return inflightStatus
    }

    async function saveConfig(patch, key) {
      const current = store.get().status
      if (current === null || current === undefined) return false
      const optimistic = { ...current, config: mergeConfig(current.config, patch) }
      store.set({ status: optimistic, saving: true, savingKey: key, configError: null })
      try {
        const value = await request('/config', { patch })
        store.set({
          status: { ...optimistic, config: value.config },
          saving: false,
          savingKey: null,
          configError: null,
        })
        if (patch.enabled === false) {
          for (const notice of activeBySession.values()) {
            try { notice.close() } catch {}
          }
          activeBySession.clear()
        }
        return true
      } catch (error) {
        store.set({
          saving: false,
          savingKey: null,
          configError: { message: messageOf(error), code: error?.code },
        })
        await refreshStatus()
        return false
      }
    }

    async function requestNotificationPermission() {
      if (typeof Notification === 'undefined') {
        store.set({ permission: 'unsupported' })
        return 'unsupported'
      }
      try {
        const result = await Notification.requestPermission()
        store.set({ permission: result })
        return result
      } catch (error) {
        console.warn('system-notify: permission request failed', error)
        return permissionState()
      }
    }

    async function sendTest() {
      if (typeof Notification === 'undefined') {
        store.set({ permission: 'unsupported', configError: { message: RUNTIME.t('permission.unsupported') } })
        return
      }
      let permission = permissionState()
      if (permission === 'default') permission = await requestNotificationPermission()
      store.set({ permission })
      if (permission !== 'granted') {
        store.set({ configError: { message: RUNTIME.t('permission.testFailed') } })
        return
      }
      const config = store.get().status?.config ?? DEFAULTS
      try {
        const notice = new Notification(RUNTIME.t('notify.testTitle'), {
          body: RUNTIME.t('notify.testBody'),
          tag: 'dsh:test',
          silent: !config.content.sound,
          timestamp: Date.now(),
        })
        notice.onclick = function () {
          try { window.focus() } catch {}
          notice.close()
        }
        toast(RUNTIME.t('permission.testSent'))
      } catch (error) {
        console.warn('system-notify: test notification failed', error)
        store.set({ configError: { message: RUNTIME.t('permission.testFailed') } })
      }
    }

    function helpText() {
      const desktop = typeof window !== 'undefined' && typeof window.dshDesktop !== 'undefined'
      if (!desktop) return RUNTIME.t('help.web')
      const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
      if (/Mac/i.test(ua)) return RUNTIME.t('help.mac')
      if (/Win/i.test(ua)) return RUNTIME.t('help.windows')
      return RUNTIME.t('help.web')
    }

    function openSystemSettings() {
      const desktop = typeof window !== 'undefined' && typeof window.dshDesktop !== 'undefined'
      if (!desktop) {
        store.set({ showSettingsHelp: true })
        return
      }
      const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
      const target = /Win/i.test(ua)
        ? 'ms-settings:notifications'
        : 'x-apple.systempreferences:com.apple.preference.notifications'
      let opened
      try { opened = window.open(target, '_blank') } catch { opened = null }
      if (!opened) store.set({ showSettingsHelp: true })
    }

    function Icon(props) {
      return h('svg', {
        width: props.size ?? 16,
        height: props.size ?? 16,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': props.stroke ?? 1.7,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
      }, props.children)
    }

    function SettingsNavIcon(props) {
      return h(Icon, { size: props?.size ?? 16, stroke: 1.6 }, [
        h('path', { key: 'body', d: 'M18 8.4a6 6 0 0 0-12 0c0 6-2.5 6.6-2.5 8.1h17C20.5 15 18 14.4 18 8.4Z' }),
        h('path', { key: 'clapper', d: 'M9.8 20.5a2.4 2.4 0 0 0 4.4 0' }),
      ])
    }

    function Switch(props) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': props.checked ? 'true' : 'false',
        'aria-label': props.label,
        disabled: props.disabled === true,
        className: 'sn-switch' + (props.checked ? ' sn-on' : ''),
        onClick: function () { props.onChange(!props.checked) },
      }, h('span', { className: 'sn-knob' }))
    }

    function Card(props) {
      return h('section', { className: 'sn-card' },
        h('div', { className: 'sn-card-head' },
          h('div', { className: 'sn-card-head-main' },
            h('h2', { className: 'sn-card-title' }, props.title),
            props.desc === undefined ? null : h('p', { className: 'sn-card-sub' }, props.desc),
          ),
          props.action ?? null,
        ),
        props.children,
      )
    }

    function ModeOption(props) {
      return h('button', {
        type: 'button',
        role: 'radio',
        'aria-checked': props.selected ? 'true' : 'false',
        className: 'sn-mode' + (props.selected ? ' sn-selected' : ''),
        disabled: props.disabled === true,
        ref: props.buttonRef,
        onClick: props.onSelect,
        onKeyDown: function (event) {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          props.onMove(event.key === 'ArrowDown' ? 1 : -1)
        },
      },
        h('div', { className: 'sn-mode-top' },
          h('span', { className: 'sn-radio', 'aria-hidden': 'true' }),
          h('span', { className: 'sn-mode-icon' }, props.icon),
          h('span', { className: 'sn-mode-name' }, props.title),
          props.badge === undefined ? null : h('span', { className: 'sn-badge' }, props.badge),
        ),
        h('p', { className: 'sn-mode-desc' }, props.desc),
        props.live === undefined ? null : h('div', { className: 'sn-live' }, props.live),
      )
    }

    function EventRow(props) {
      return h('div', { className: 'sn-row' },
        h('span', { className: 'sn-row-icon ' + props.tone }, props.icon),
        h('div', { className: 'sn-row-main' },
          h('div', { className: 'sn-row-title' }, props.title),
          h('div', { className: 'sn-row-desc' }, props.desc),
        ),
        h('div', { className: 'sn-row-action' },
          h(Switch, {
            checked: props.checked,
            disabled: props.disabled,
            label: props.title,
            onChange: props.onChange,
          }),
        ),
      )
    }

    function ContentRow(props) {
      return h('div', { className: 'sn-content-row' },
        h('div', { className: 'sn-row-main' },
          h('div', { className: 'sn-row-title' }, props.title),
          h('div', { className: 'sn-row-desc' }, props.desc),
        ),
        h(Switch, {
          checked: props.checked,
          disabled: props.disabled,
          label: props.title,
          onChange: props.onChange,
        }),
      )
    }

    function Banner(props) {
      return h('div', { className: 'sn-banner' + (props.info ? ' sn-info' : '') },
        h('span', { className: 'sn-banner-icon', 'aria-hidden': 'true' }, props.icon ?? '!'),
        h('div', { className: 'sn-banner-main' },
          h('div', { className: 'sn-banner-title' }, props.title),
          h('div', { className: 'sn-banner-desc' }, props.desc),
        ),
        props.actions === undefined ? null : h('div', { className: 'sn-banner-actions' }, props.actions),
      )
    }

    function SettingsPage() {
      const [t] = useT()
      const state = useStore()
      const status = state.status
      const config = status?.config ?? DEFAULTS
      const readOnly = status !== null && status?.caps?.configEditor === false
      const notLoaded = status === null
      const busy = state.saving || readOnly || notLoaded
      const disabled = busy || !config.enabled
      const permission = state.permission
      const showFirstRun = status !== null && status !== undefined && config.enabled
        && permission === 'default' && !state.onboardingDismissed
      const showDenied = status !== null && status !== undefined && config.enabled && permission === 'denied'

      useEffect(function () {
        void refreshStatus()
      }, [])

      const modeButtons = useRef([])
      const foreground = state.foreground
      const liveDot = h('span', { className: 'sn-live-dot' + (foreground ? '' : ' sn-bg'), 'aria-hidden': 'true' })
      const liveText = config.mode === 'always'
        ? t('mode.live.always')
        : foreground
          ? t('mode.live.foreground') + ' · ' + t('mode.live.hintForeground')
          : t('mode.live.background') + ' · ' + t('mode.live.hintBackground')

      const modeOptions = [
        {
          id: 'background',
          title: t('mode.background'),
          desc: t('mode.backgroundDesc'),
          icon: h(Icon, { size: 17 }, h('path', { d: 'M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5 8.5 8.5 0 1 0 20.5 14.6Z' })),
          badge: t('mode.recommended'),
        },
        {
          id: 'always',
          title: t('mode.always'),
          desc: t('mode.alwaysDesc'),
          icon: h(Icon, { size: 17 }, [
            h('path', { key: 'b', d: 'M18 8.4a6 6 0 0 0-12 0c0 6-2.5 6.6-2.5 8.1h17C20.5 15 18 14.4 18 8.4Z' }),
            h('path', { key: 'c', d: 'M9.8 20.5a2.4 2.4 0 0 0 4.4 0' }),
          ]),
        },
      ]

      const eventRows = [
        {
          id: 'complete',
          tone: 'sn-green',
          title: t('event.complete'),
          desc: t('event.completeDesc'),
          icon: h(Icon, { size: 16 }, h('path', { d: 'm5 12.5 4.2 4.2L19 7' })),
        },
        {
          id: 'approval',
          tone: 'sn-amber',
          title: t('event.approval'),
          desc: t('event.approvalDesc'),
          icon: h(Icon, { size: 16 }, [
            h('path', { key: 'a', d: 'M12 3.2 19.5 6v5.2c0 4.4-3 7.7-7.5 9.6-4.5-1.9-7.5-5.2-7.5-9.6V6L12 3.2Z' }),
            h('path', { key: 'b', d: 'M12 8.2v4.1' }),
            h('path', { key: 'c', d: 'M12 15.9h.01' }),
          ]),
        },
        {
          id: 'authorization',
          tone: 'sn-blue',
          title: t('event.authorization'),
          desc: t('event.authorizationDesc'),
          icon: h(Icon, { size: 16 }, [
            h('circle', { key: 'a', cx: 8.5, cy: 12, r: 3.4 }),
            h('path', { key: 'b', d: 'M12 12h8.2M17 12v2.6M19.9 12v2.1' }),
          ]),
        },
        {
          id: 'error',
          tone: 'sn-red',
          title: t('event.error'),
          desc: t('event.errorDesc'),
          icon: h(Icon, { size: 16 }, [
            h('path', { key: 'a', d: 'M10.3 4.5 2.9 17.2A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.8L13.7 4.5a2 2 0 0 0-3.4 0Z' }),
            h('path', { key: 'b', d: 'M12 9v4.2' }),
            h('path', { key: 'c', d: 'M12 16.6h.01' }),
          ]),
        },
      ]

      const contentRows = [
        { id: 'showTitle', title: t('content.showTitle'), desc: t('content.showTitleDesc') },
        { id: 'replyPreview', title: t('content.replyPreview'), desc: t('content.replyPreviewDesc') },
        { id: 'sound', title: t('content.sound'), desc: t('content.soundDesc') },
      ]

      function save(patch, key) {
        void saveConfig(patch, key)
      }

      function allow() {
        void requestNotificationPermission().then(function (result) {
          if (result === 'granted') toast(t('permission.grantedToast'))
          else if (result === 'denied') toast(t('permission.stillDenied'))
        })
      }

      function dismissFirstRun() {
        writeDismissed()
        store.set({ onboardingDismissed: true })
      }

      function retryPermission() {
        const next = permissionState()
        store.set({ permission: next })
        if (next === 'granted') toast(t('permission.grantedToast'))
        else if (next === 'denied') toast(t('permission.stillDenied'))
      }

      const permissionInfo = permission === 'granted'
        ? { title: t('permission.granted'), desc: t('permission.grantedDesc'), tone: '' }
        : permission === 'denied'
          ? { title: t('permission.denied'), desc: t('permission.deniedDesc'), tone: 'sn-warn' }
          : permission === 'unsupported'
            ? { title: t('permission.unsupported'), desc: t('permission.unsupportedDesc'), tone: 'sn-error' }
            : { title: t('permission.default'), desc: t('permission.defaultDesc'), tone: 'sn-warn' }

      let permissionAction = null
      if (!showFirstRun) {
        if (permission === 'granted') {
          permissionAction = h('button', {
            type: 'button',
            className: 'sn-btn',
            onClick: function () { void sendTest() },
          }, h(Icon, { size: 14 }, [
            h('path', { key: 'b', d: 'M18 8.4a6 6 0 0 0-12 0c0 6-2.5 6.6-2.5 8.1h17C20.5 15 18 14.4 18 8.4Z' }),
            h('path', { key: 'c', d: 'M9.8 20.5a2.4 2.4 0 0 0 4.4 0' }),
          ]), t('permission.test'))
        } else if (permission === 'default') {
          permissionAction = h('button', { type: 'button', className: 'sn-btn sn-primary', onClick: allow }, t('permission.allow'))
        } else if (permission === 'denied') {
          permissionAction = h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            showDenied ? null : h('button', { type: 'button', className: 'sn-btn', onClick: openSystemSettings }, t('permission.openSettings')),
            h('button', { type: 'button', className: 'sn-btn sn-text', onClick: retryPermission }, t('permission.retry')),
          )
        }
      }

      const cards = [
        h(Card, {
          key: 'timing',
          title: t('section.timing'),
          desc: t('section.timingDesc'),
          action: h('div', { className: 'sn-master' },
            h('span', { className: 'sn-master-label' }, config.enabled ? t('master.enable') : t('master.off')),
            h(Switch, {
              checked: config.enabled,
              disabled: busy,
              label: t('master.enable'),
              onChange: function (next) {
                if (next && permission === 'default') void requestNotificationPermission()
                save({ enabled: next }, 'enabled')
              },
            }),
          ),
        },
          h('div', { className: 'sn-modes', role: 'radiogroup', 'aria-label': t('section.timing') },
            modeOptions.map(function (option, index) {
              const selected = config.mode === option.id
              return h(ModeOption, {
                key: option.id,
                selected,
                disabled,
                title: option.title,
                desc: option.desc,
                icon: option.icon,
                badge: option.badge,
                buttonRef: function (node) { modeButtons.current[index] = node },
                onSelect: function () { if (!disabled) save({ mode: option.id }, 'mode') },
                onMove: function (delta) {
                  if (disabled) return
                  const next = (index + delta + modeOptions.length) % modeOptions.length
                  save({ mode: modeOptions[next].id }, 'mode')
                  setTimeout(function () { modeButtons.current[next]?.focus() }, 0)
                },
                live: selected ? [liveDot, h('span', { key: 't' }, liveText)] : undefined,
              })
            }),
          ),
        ),
        h(Card, {
          key: 'events',
          title: t('section.events'),
          desc: t('section.eventsDesc'),
        },
          h('div', { className: 'sn-rows' + (config.enabled ? '' : ' sn-muted') },
            eventRows.map(function (row) {
              return h(EventRow, {
                key: row.id,
                tone: row.tone,
                title: row.title,
                desc: row.desc,
                icon: row.icon,
                checked: config.events[row.id] !== false,
                disabled,
                onChange: function (next) {
                  const events = {}
                  events[row.id] = next
                  save({ events: events }, 'event.' + row.id)
                },
              })
            }),
          ),
        ),
        h(Card, {
          key: 'content',
          title: t('section.content'),
          desc: t('section.contentDesc'),
        },
          h('div', { className: config.enabled ? '' : 'sn-muted' },
            contentRows.map(function (row) {
              return h(ContentRow, {
                key: row.id,
                title: row.title,
                desc: row.desc,
                checked: config.content[row.id] !== false,
                disabled,
                onChange: function (next) {
                  const content = {}
                  content[row.id] = next
                  save({ content: content }, 'content.' + row.id)
                },
              })
            }),
          ),
        ),
        h(Card, {
          key: 'permission',
          title: t('section.permission'),
          desc: t('section.permissionDesc'),
        },
          h('div', { className: 'sn-permission' },
            h('div', { className: 'sn-perm-main' },
              h('span', { className: 'sn-dot ' + permissionInfo.tone, 'aria-hidden': 'true' }),
              h('div', null,
                h('div', { className: 'sn-perm-title' }, permissionInfo.title),
                h('div', { className: 'sn-perm-desc' }, permissionInfo.desc),
              ),
            ),
            permissionAction,
          ),
          state.showSettingsHelp ? h('div', { className: 'sn-help' },
            h('div', { className: 'sn-help-title' }, t('help.title')),
            h('p', null, helpText()),
            h('button', {
              type: 'button',
              className: 'sn-btn sn-text',
              onClick: function () { store.set({ showSettingsHelp: false }) },
            }, t('help.close')),
          ) : null,
        ),
      ]

      const banners = []
      if (state.statusError !== null) {
        banners.push(h(Banner, {
          key: 'host',
          title: t('error.host'),
          desc: state.statusError?.message ?? t('error.status'),
        }))
      }
      if (showFirstRun) {
        banners.push(h(Banner, {
          key: 'first',
          info: true,
          icon: h(Icon, { size: 14 }, [
            h('path', { key: 'b', d: 'M18 8.4a6 6 0 0 0-12 0c0 6-2.5 6.6-2.5 8.1h17C20.5 15 18 14.4 18 8.4Z' }),
            h('path', { key: 'c', d: 'M9.8 20.5a2.4 2.4 0 0 0 4.4 0' }),
          ]),
          title: t('banner.firstTitle'),
          desc: t('banner.firstDesc'),
          actions: [
            h('button', { key: 'a', type: 'button', className: 'sn-btn sn-primary', onClick: allow }, t('permission.allow')),
            h('button', { key: 'b', type: 'button', className: 'sn-btn sn-text', onClick: dismissFirstRun }, t('banner.later')),
          ],
        }))
      }
      if (showDenied) {
        banners.push(h(Banner, {
          key: 'denied',
          title: t('banner.deniedTitle'),
          desc: t('banner.deniedDesc'),
          actions: h('button', { type: 'button', className: 'sn-btn', onClick: openSystemSettings }, t('permission.openSettings')),
        }))
      }
      if (readOnly && state.statusError === null) {
        banners.push(h(Banner, {
          key: 'readonly',
          info: true,
          icon: 'i',
          title: t('error.readOnly'),
          desc: '',
        }))
      }
      if (state.configError !== null) {
        banners.push(h('p', { key: 'save-error', className: 'sn-error', role: 'alert' },
          t('error.save') + ': ' + state.configError.message))
      }

      return h('div', { className: 'sn-page' },
        h('div', { className: 'sn-head' },
          h('h2', { className: 'sn-title' }, t('settings.title')),
          h('p', { className: 'sn-intro' }, t('settings.intro')),
        ),
        banners,
        cards,
        h('p', { className: 'sn-footnote' },
          h('span', null, t('footnote.save')),
          h('span', { className: 'sn-sep' }, '·'),
          h('span', null, t('footnote.local')),
          h('span', { className: 'sn-sep' }, '·'),
          h('span', null, t('footnote.focus')),
        ),
        state.toast === null ? null : h('div', { className: 'sn-toast', role: 'status' }, state.toast),
      )
    }

    const activeBySession = new Map()

    function closeSessionNotifications(sessionId) {
      const notice = activeBySession.get(sessionId)
      if (notice === undefined) return
      try { notice.close() } catch {}
      activeBySession.delete(sessionId)
    }

    function showNotification(options) {
      if (store.get().status === null) return false
      if (typeof Notification === 'undefined') return false
      if (permissionState() !== 'granted') return false
      const config = store.get().status.config ?? DEFAULTS
      try {
        const notice = new Notification(options.title, {
          body: options.body,
          tag: options.tag,
          silent: !config.content.sound,
          requireInteraction: options.sticky === true,
          timestamp: Date.now(),
        })
        notice.onclick = function () {
          try { window.focus() } catch {}
          if (options.sessionId !== undefined) openSession(options.sessionId)
          notice.close()
        }
        if (options.sessionId !== undefined) {
          const previous = activeBySession.get(options.sessionId)
          if (previous !== undefined) {
            try { previous.close() } catch {}
          }
          activeBySession.set(options.sessionId, notice)
          notice.onclose = function () {
            if (activeBySession.get(options.sessionId) === notice) activeBySession.delete(options.sessionId)
          }
        }
        return true
      } catch (error) {
        console.warn('system-notify: could not show notification', error)
        return false
      }
    }

    function openSession(sessionId) {
      const navigation = RUNTIME.ctx?.get?.('uiWorkspace')
      if (navigation === undefined || navigation === null) return
      if (typeof navigation.openSession !== 'function') return
      try {
        navigation.openSession(sessionId)
      } catch (error) {
        console.warn('system-notify: could not open the conversation', error)
      }
    }

    function currentConfig() {
      return store.get().status?.config ?? DEFAULTS
    }

    function canNotify(mode, sessionId) {
      if (mode === 'always') return true
      if (!isForeground()) return true
      if (typeof sessionId !== 'string') return false
      return !isConversationOnScreen(sessionId)
    }

    function scheduleNotice(sessionId, action) {
      const config = currentConfig()
      if (!canNotify(config.mode, sessionId)) return false
      if (config.mode === 'always') {
        action()
        return true
      }
      setTimeout(function () {
        if (canNotify(currentConfig().mode, sessionId)) action()
      }, FOCUS_DEBOUNCE_MS)
      return true
    }

    let completionBatch = []
    let completionTimer
    let lastShownAt = 0
    const lastErrorNotified = new Map()
    const sessionRows = new Map()
    const runningState = new Map()
    const sessionErrors = new Map()
    const seenPending = new Map()
    let booted = false
    let bootTimer
    let seenList = false

    function sessionTitle(sessionId) {
      const row = sessionRows.get(sessionId)
      const display = typeof row?.displayTitle === 'string' ? row.displayTitle.trim() : ''
      const fallback = typeof row?.title === 'string' ? row.title.trim() : ''
      const title = display !== '' ? display : fallback
      return title === '' ? RUNTIME.t('notify.untitled') : title
    }

    function showThrottled(options) {
      const now = Date.now()
      const urgent = options.category === 'approval' || options.category === 'authorization'
      if (!urgent && now - lastShownAt < GLOBAL_INTERVAL_MS) {
        setTimeout(function () { showThrottled(options) }, GLOBAL_INTERVAL_MS - (now - lastShownAt))
        return
      }
      lastShownAt = now
      showNotification(options)
    }

    function flushCompletions() {
      completionTimer = undefined
      const batch = completionBatch
      completionBatch = []
      if (batch.length === 0) return
      const config = currentConfig()
      if (!config.enabled || !config.events.complete) return
      const eligible = batch.filter(function (item) {
        return canNotify(config.mode, item.sessionId)
      })
      if (eligible.length === 0) return
      if (eligible.length === 1) {
        showThrottled({
          title: eligible[0].title,
          body: eligible[0].body,
          tag: 'dsh:done:' + eligible[0].sessionId,
          sessionId: eligible[0].sessionId,
          category: 'complete',
        })
        return
      }
      const titles = eligible.slice(0, 2).map(function (item) { return sessionTitle(item.sessionId) }).join(' / ')
      const body = config.content.showTitle ? titles + (eligible.length > 2 ? ' ...' : '') : RUNTIME.t('notify.doneBody')
      showThrottled({
        title: RUNTIME.t('notify.doneGrouped', { n: eligible.length }),
        body,
        tag: 'dsh:done:group',
        sessionId: eligible[eligible.length - 1].sessionId,
        category: 'complete',
      })
    }

    function queueCompletion(sessionId, title, body) {
      const config = currentConfig()
      if (!config.enabled || !config.events.complete) return
      if (!canNotify(config.mode, sessionId)) return
      completionBatch.push({ sessionId, title, body })
      if (completionTimer !== undefined) clearTimeout(completionTimer)
      completionTimer = setTimeout(flushCompletions, GROUP_WINDOW_MS)
    }

    function notifyCompletion(sessionId, classification) {
      const config = currentConfig()
      if (!config.enabled || !config.events.complete) return
      if (!canNotify(config.mode, sessionId)) return
      const title = config.content.showTitle
        ? RUNTIME.t('notify.done', { title: sessionTitle(sessionId) })
        : RUNTIME.t('notify.donePlain')
      const body = config.content.replyPreview && classification?.preview
        ? cleanText(classification.preview, MAX_PREVIEW)
        : RUNTIME.t('notify.doneBody')
      queueCompletion(sessionId, title, body)
    }

    function notifyError(sessionId, message) {
      const config = currentConfig()
      if (!config.enabled || !config.events.error) return
      if (!canNotify(config.mode, sessionId)) return
      const now = Date.now()
      if (now - (lastErrorNotified.get(sessionId) ?? 0) < ERROR_COOLDOWN_MS) return
      lastErrorNotified.set(sessionId, now)
      scheduleNotice(sessionId, function () {
        const title = config.content.showTitle
          ? RUNTIME.t('notify.error', { title: sessionTitle(sessionId) })
          : RUNTIME.t('notify.errorPlain')
        const body = config.content.replyPreview && message
          ? cleanText(message, MAX_PREVIEW)
          : RUNTIME.t('notify.errorBody')
        showThrottled({
          title,
          body,
          tag: 'dsh:error:' + sessionId,
          sessionId,
          category: 'error',
        })
      })
    }

    function pendingKey(pending) {
      if (typeof pending?.key === 'string' && pending.key !== '') return pending.key
      return String(pending?.kind ?? 'pending') + ':' + String(pending?.callId ?? '')
    }

    function notifyApproval(sessionId, pending) {
      const config = currentConfig()
      if (!config.enabled || !config.events.approval) return
      if (!canNotify(config.mode, sessionId)) return
      const tool = typeof pending?.toolName === 'string' && pending.toolName !== '' ? pending.toolName : ''
      scheduleNotice(sessionId, function () {
        const title = tool !== '' && config.content.showTitle
          ? RUNTIME.t('notify.approval', { tool })
          : RUNTIME.t('notify.approvalPlain')
        const body = config.content.showTitle
          ? RUNTIME.t('notify.approvalBody', { title: sessionTitle(sessionId) })
          : RUNTIME.t('notify.approvalBodyPlain')
        showThrottled({
          title,
          body,
          tag: 'dsh:approval:' + sessionId + ':' + pendingKey(pending),
          sessionId,
          sticky: true,
          category: 'approval',
        })
      })
    }

    function notifyAuthorization(sessionId, pending) {
      const config = currentConfig()
      if (!config.enabled || !config.events.authorization) return
      if (!canNotify(config.mode, sessionId)) return
      const kind = pending?.kind === 'plan-review'
        ? RUNTIME.t('notify.authorizationPlan')
        : RUNTIME.t('notify.authorizationQuestion')
      scheduleNotice(sessionId, function () {
        const body = config.content.showTitle
          ? RUNTIME.t('notify.authorizationBody', { title: sessionTitle(sessionId), kind })
          : RUNTIME.t('notify.authorizationBodyPlain')
        showThrottled({
          title: RUNTIME.t('notify.authorization'),
          body,
          tag: 'dsh:auth:' + sessionId + ':' + pendingKey(pending),
          sessionId,
          sticky: true,
          category: 'authorization',
        })
      })
    }

    function isMainSession(sessionId) {
      const row = sessionRows.get(sessionId)
      if (row === undefined) return true
      return row.origin !== 'subagent' && row.parentId === undefined
    }

    function readRows(snapshot) {
      const byId = snapshot?.byId
      if (byId === null || typeof byId !== 'object') return
      if (!seenList && snapshot.phase !== undefined && snapshot.phase !== 'ready') return
      if (!seenList && Object.keys(byId).length === 0) return
      for (const [sessionId, row] of Object.entries(byId)) {
        if (row === null || typeof row !== 'object') continue
        sessionRows.set(sessionId, row)
        if (!seenList) {
          runningState.set(sessionId, {
            running: row.running === true,
            startedAt: row.running === true ? Date.now() : undefined,
            seeded: true,
          })
        }
      }
      for (const sessionId of [...sessionRows.keys()]) {
        if (Object.prototype.hasOwnProperty.call(byId, sessionId)) continue
        sessionRows.delete(sessionId)
        runningState.delete(sessionId)
        closeSessionNotifications(sessionId)
      }
      if (!seenList) seenList = true
    }

    async function classifyTurn(sessionId) {
      try {
        return await request('/turn-end', { sessionId })
      } catch (error) {
        console.warn('system-notify: turn classification failed', error)
        return null
      }
    }

    async function finishTurn(sessionId) {
      const classification = await classifyTurn(sessionId)
      const error = sessionErrors.get(sessionId)
      sessionErrors.delete(sessionId)
      if (!isMainSession(sessionId)) return
      if (classification !== null && classification !== undefined) {
        if (classification.reason === 'completed') {
          notifyCompletion(sessionId, classification)
          return
        }
        if (classification.reason === 'error') {
          notifyError(sessionId, classification.error ?? error?.message)
          return
        }
        return
      }
      if (error !== undefined && Date.now() - error.at < 30000) {
        notifyError(sessionId, error.message)
        return
      }
      notifyCompletion(sessionId, { reason: 'completed', preview: undefined })
    }

    function handleStatus(sessionId, running) {
      const previous = runningState.get(sessionId)
      if (previous === undefined) {
        runningState.set(sessionId, {
          running,
          startedAt: running ? Date.now() : undefined,
          seeded: false,
        })
        return
      }
      if (previous.running === running) return
      const next = {
        running,
        startedAt: running ? Date.now() : previous.startedAt,
        seeded: false,
      }
      runningState.set(sessionId, next)
      if (running) {
        sessionErrors.delete(sessionId)
        return
      }
      if (previous.running) void finishTurn(sessionId)
    }

    function handleError(sessionId, message) {
      sessionErrors.set(sessionId, { message, at: Date.now() })
    }

    /**
     * Publish one notification per newly effective pending interaction.
     * @param {object | undefined} interactions - uiSession.pendingInteractions source.
     */
    function scanPending(interactions) {
      if (interactions === undefined || interactions === null) return
      if (typeof interactions.getSnapshot !== 'function') return
      const snapshot = interactions.getSnapshot()
      if (snapshot === null || typeof snapshot !== 'object') return
      const current = new Map()
      const entries = snapshot instanceof Map ? snapshot.entries() : Object.entries(snapshot)
      for (const [sessionId, pending] of entries) {
        if (pending === null || pending === undefined || typeof pending !== 'object') continue
        current.set(String(sessionId), pending)
      }
      for (const [sessionId, pending] of current) {
        const key = pendingKey(pending)
        const previous = seenPending.get(sessionId)
        if (previous !== undefined && previous.key === key) continue
        seenPending.set(sessionId, { key, kind: pending.kind })
        if (!booted) continue
        if (!isMainSession(sessionId)) continue
        if (pending.kind === 'approval') notifyApproval(sessionId, pending)
        else if (pending.kind === 'question' || pending.kind === 'plan-review') notifyAuthorization(sessionId, pending)
      }
      for (const sessionId of [...seenPending.keys()]) {
        if (current.has(sessionId)) continue
        seenPending.delete(sessionId)
        closeSessionNotifications(sessionId)
      }
    }

    function installRuntime(ctx) {
      const disposers = []
      const sessions = ctx.sessions
      const remote = ctx.remote
      const interactions = ctx.uiSession?.pendingInteractions

      function scan() { scanPending(interactions) }

      if (sessions?.list?.subscribe) {
        const update = function () {
          readRows(sessions.list.getSnapshot())
          scan()
        }
        disposers.push(sessions.list.subscribe(update))
        update()
      }
      if (remote?.$on) {
        try {
          disposers.push(remote.$on('api-session/status', function (sessionId, running) {
            handleStatus(String(sessionId), Boolean(running))
          }))
          disposers.push(remote.$on('api-session/error', function (sessionId, message) {
            handleError(String(sessionId), String(message ?? ''))
          }))
        } catch (error) {
          console.warn('system-notify: remote events unavailable', error)
        }
      }
      if (interactions !== undefined && typeof interactions.subscribe === 'function') {
        disposers.push(interactions.subscribe(scan))
        scan()
      }

      const onFocus = function () { store.set({ foreground: isForeground() }) }
      window.addEventListener('focus', onFocus)
      window.addEventListener('blur', onFocus)
      document.addEventListener('visibilitychange', onFocus)

      bootTimer = setTimeout(function () {
        booted = true
        scan()
      }, BOOT_QUIET_MS)

      return function () {
        clearTimeout(bootTimer)
        clearTimeout(completionTimer)
        clearTimeout(toastTimer)
        window.removeEventListener('focus', onFocus)
        window.removeEventListener('blur', onFocus)
        document.removeEventListener('visibilitychange', onFocus)
        for (const dispose of disposers) {
          try { dispose() } catch {}
        }
        for (const notice of activeBySession.values()) {
          try { notice.close() } catch {}
        }
        activeBySession.clear()
      }
    }

    /**
     * Install the Browser half: dictionaries, runtime subscriptions, settings slot.
     * @param ctx - plugin context, already holding the injected services.
     */
    function apply(ctx) {
      RUNTIME.ctx = ctx
      ctx.effect(function () {
        return function () {
          if (RUNTIME.ctx === ctx) RUNTIME.ctx = null
        }
      }, 'system-notify: context')
      ctx.effect(function () {
        try {
          return ctx.locale.register(LOCALE_NS, { en: EN, zh: ZH })
        } catch (error) {
          console.warn('system-notify: locale registration failed', error)
          return function () {}
        }
      }, 'system-notify: dictionaries')
      RUNTIME.t = makeT(ctx.locale?.getSnapshot?.()?.active ?? 'en')
      ctx.effect(function () {
        return ctx.locale.subscribe(function () {
          RUNTIME.t = makeT(ctx.locale.getSnapshot()?.active ?? 'en')
        })
      }, 'system-notify: locale')
      ctx.effect(function () {
        return installRuntime(ctx)
      }, 'system-notify: runtime')
      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: SECTION_ID,
          order: 20,
          label: function () { return RUNTIME.t('settings.nav') },
          locale: LOCALE_NS,
        }, SettingsPage)
      })
      ctx.slots.inject('settings.section.icon', function () {
        return ctx.slots.register({
          name: 'settings.section.icon',
          id: SECTION_ID,
        }, SettingsNavIcon)
      })
      void refreshStatus()
    }

    return {
      // uiSession publishes pendingInteractions; remote carries running and error events.
      inject: ['slots', 'locale', 'sessions', 'remote', 'uiSession'],
      apply,
    }
  },
})

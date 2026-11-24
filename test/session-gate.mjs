import assert from 'node:assert/strict'
import test from 'node:test'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

test('background mode notifies for a conversation that is not on screen', { timeout: 15_000 }, async () => {
  const notifications = []
  class FakeNotification {
    static permission = 'granted'
    constructor(title, options) {
      notifications.push({ title, options })
      this.onclick = null
      this.close = function () {}
    }
  }

  const rows = {
    A: { id: 'A', displayTitle: 'Conversation A', running: false, retainedBy: { mainView: 1 } },
    B: { id: 'B', displayTitle: 'Conversation B', running: false, retainedBy: {} },
  }
  let activePanelId = null
  const sessionListeners = new Set()
  const remoteHandlers = {}
  const pendingListeners = new Set()
  let pendingSnapshot = new Map()
  const pendingInteractions = {
    getSnapshot: () => pendingSnapshot,
    subscribe(listener) {
      pendingListeners.add(listener)
      return function () { pendingListeners.delete(listener) }
    },
  }
  function publishPending(map) {
    pendingSnapshot = map
    for (const listener of [...pendingListeners]) listener()
  }
  const sessions = {
    list: {
      getSnapshot: () => ({ phase: 'ready', ids: Object.keys(rows), byId: rows }),
      subscribe(listener) {
        sessionListeners.add(listener)
        return function () { sessionListeners.delete(listener) }
      },
    },
  }
  const layout = { panelInfo: { getSnapshot: () => ({ activePanelId }) } }
  function pushRows() {
    for (const listener of [...sessionListeners]) listener()
  }

  let loaded
  let settingsOpen = false
  globalThis.Notification = FakeNotification
  globalThis.window = {
    __ModuleLoader__: { load(definition) { loaded = definition } },
    localStorage: { getItem() { return null } },
    addEventListener() {},
    removeEventListener() {},
    focus() {},
  }
  globalThis.document = {
    visibilityState: 'visible',
    hasFocus: () => true,
    addEventListener() {},
    removeEventListener() {},
    querySelector(selector) {
      return settingsOpen && selector.includes('data-shortcut-modal="settings"') ? {} : null
    },
    createElement() { return { dataset: {}, textContent: '' } },
    head: { appendChild() {} },
  }
  globalThis.fetch = async (url) => {
    const value = String(url).endsWith('/turn-end')
      ? { reason: 'completed' }
      : {
          enabled: true,
          mode: 'background',
          events: { complete: true, approval: true, authorization: true, error: true },
          content: { showTitle: true, replyPreview: false, sound: true },
        }
    return { ok: true, status: 200, json: async () => ({ ok: true, value }) }
  }

  const react = {
    createElement() { return null },
    useState(value) { return [typeof value === 'function' ? value() : value, function () {}] },
    useEffect() {},
    useMemo(factory) { return factory() },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot() },
  }
  const require = specifier => {
    if (specifier === 'react') return react
    throw new Error('unexpected require: ' + specifier)
  }

  const realSetTimeout = globalThis.setTimeout
  const realNow = Date.now
  let clock = realNow()
  globalThis.setTimeout = (fn, ms, ...args) => realSetTimeout(fn, Math.min(ms, 20), ...args)
  Date.now = () => clock

  try {
    await import(pathToFileURL(resolve('client.js')).href + '?gate=' + realNow())
    const plugin = loaded.factory(require)
    const ctx = {
      sessions,
      remote: {
        $on(event, callback) {
          remoteHandlers[event] = callback
          return function () {}
        },
      },
      uiSession: { pendingInteractions },
      get(name) {
        if (name === 'layout') return layout
        return undefined
      },
      locale: {
        getSnapshot: () => ({ active: 'en' }),
        register() {},
        subscribe() { return function () {} },
      },
      slots: { inject() {} },
      effect(fn) {
        const dispose = fn()
        return function () { if (typeof dispose === 'function') dispose() }
      },
    }
    plugin.apply(ctx)
    await new Promise(resolveWait => realSetTimeout(resolveWait, 100))

    const status = remoteHandlers['api-session/status']
    assert.equal(typeof status, 'function')

    async function finish(sessionId) {
      status(sessionId, true)
      status(sessionId, false)
      await new Promise(resolveWait => realSetTimeout(resolveWait, 100))
    }
    function advance(ms) { clock += ms }

    await finish('B')
    assert.equal(notifications.length, 1, 'foreground + viewing A notifies B')
    advance(2_000)

    await finish('A')
    assert.equal(notifications.length, 1, 'foreground + viewing A stays quiet for A')
    advance(2_000)

    rows.A.retainedBy = {}
    rows.B.retainedBy = { mainView: 1 }
    pushRows()
    await finish('A')
    assert.equal(notifications.length, 2, 'switching to B notifies A')
    advance(2_000)

    activePanelId = 'plugins'
    await finish('B')
    assert.equal(notifications.length, 3, 'a non-conversation page notifies B')
    advance(2_000)

    activePanelId = null
    settingsOpen = true
    await finish('B')
    assert.equal(notifications.length, 4, 'an open Settings dialog notifies the selected session')
    advance(2_000)

    settingsOpen = false
    document.hasFocus = () => false
    await finish('B')
    assert.equal(notifications.length, 5, 'a background app notifies the selected session')

    // Pending interactions arrive through ctx.uiSession.pendingInteractions.
    document.hasFocus = () => true
    activePanelId = null
    rows.A.retainedBy = { mainView: 1 }
    rows.B.retainedBy = {}
    pushRows()
    const before = notifications.length

    publishPending(new Map([['B', { key: 'approval-1', kind: 'approval', sessionId: 'B', toolName: 'bash' }]]))
    await new Promise(resolveWait => realSetTimeout(resolveWait, 40))
    assert.equal(notifications.length, before + 1, 'an approval in another conversation notifies')
    assert.match(notifications[before].title, /Waiting for approval/)
    assert.equal(notifications[before].options.requireInteraction, true)

    publishPending(new Map([['B', { key: 'approval-1', kind: 'approval', sessionId: 'B', toolName: 'bash' }]]))
    await new Promise(resolveWait => realSetTimeout(resolveWait, 40))
    assert.equal(notifications.length, before + 1, 'the same pending key does not notify twice')

    publishPending(new Map([['A', { key: 'approval-2', kind: 'approval', sessionId: 'A', toolName: 'bash' }]]))
    await new Promise(resolveWait => realSetTimeout(resolveWait, 40))
    assert.equal(notifications.length, before + 1, 'the conversation on screen stays quiet for its own approval')

    rows.C = { id: 'C', displayTitle: 'Subagent', running: false, origin: 'subagent', parentId: 'A', retainedBy: {} }
    pushRows()
    publishPending(new Map([['C', { key: 'question-1', kind: 'question', sessionId: 'C' }]]))
    await new Promise(resolveWait => realSetTimeout(resolveWait, 40))
    assert.equal(notifications.length, before + 1, 'subagent sessions stay quiet')

    publishPending(new Map([['B', { key: 'question-2', kind: 'plan-review', sessionId: 'B' }]]))
    await new Promise(resolveWait => realSetTimeout(resolveWait, 40))
    assert.equal(notifications.length, before + 2, 'a plan review in another conversation notifies')
    assert.match(notifications[before + 1].title, /Waiting for your authorization/)
  } finally {
    globalThis.setTimeout = realSetTimeout
    Date.now = realNow
  }
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

function browserGlobals() {
  globalThis.window = {
    __ModuleLoader__: { load(definition) { globalThis.window.loaded = definition } },
    addEventListener() {},
    removeEventListener() {},
    localStorage: { getItem() { return null }, setItem() {} },
  }
  globalThis.document = {
    visibilityState: 'visible',
    hasFocus: () => true,
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null },
  }
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ ok: true, value: null }) })
}

async function loadPlugin(tag) {
  browserGlobals()
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
  await import(pathToFileURL(resolve('client.js')).href + '?' + tag)
  const loaded = globalThis.window.loaded
  assert.ok(loaded, 'loader was called')
  return { loaded, plugin: loaded.factory(require) }
}

function context(overrides) {
  const registrations = []
  const listeners = { sessions: new Set(), pending: new Set(), locale: new Set() }
  const emptyPending = new Map()
  const ctx = {
    locale: {
      getSnapshot: () => ({ active: 'en', revision: 1 }),
      register() { return function () {} },
      subscribe(listener) { listeners.locale.add(listener); return function () { listeners.locale.delete(listener) } },
      bind() { return key => key },
    },
    slots: {
      inject(_name, factory) { factory() },
      register(options, component) {
        registrations.push({ options, component })
        return function () {}
      },
    },
    sessions: {
      list: {
        getSnapshot: () => ({ phase: 'ready', ids: [], byId: {} }),
        subscribe(listener) { listeners.sessions.add(listener); return function () { listeners.sessions.delete(listener) } },
      },
    },
    remote: { $on() { return function () {} } },
    uiSession: {
      pendingInteractions: {
        getSnapshot: () => emptyPending,
        subscribe(listener) { listeners.pending.add(listener); return function () { listeners.pending.delete(listener) } },
      },
    },
    effect(fn) {
      const dispose = fn()
      return function () { if (typeof dispose === 'function') dispose() }
    },
    get() { return undefined },
    ...overrides,
  }
  return { ctx, registrations, listeners }
}

test('client registers through the module loader and exports apply', async () => {
  const { loaded, plugin } = await loadPlugin('load-' + Date.now())
  assert.equal(loaded.id, 'dsh-system-notify')
  assert.deepEqual(plugin.inject, ['slots', 'locale', 'sessions', 'remote', 'uiSession'])
  assert.equal(typeof plugin.apply, 'function')
})

test('the Browser half reads pending requests without sessionStatus', async () => {
  const source = await readFile(resolve('client.js'), 'utf8')
  assert.equal(
    source.includes('sessionStatus'),
    false,
    'uiSession.sessionStatus is an injected service now; pendingInteractions replaces it',
  )
  assert.match(source, /uiSession\.pendingInteractions|pendingInteractions/)
})

test('the module carries its stylesheet in metadata', async () => {
  const { loaded } = await loadPlugin('meta-' + Date.now())
  assert.equal(typeof loaded.meta, 'function')
  const stylesheets = loaded.meta().stylesheets
  assert.ok(stylesheets['client.css'], 'client.css is described')
  const css = stylesheets['client.css'].text({ asset: reference => reference })
  assert.match(css, /\.sn-page\{/)
  assert.match(css, /var\(--dsw-alias-label-primary\)/)
})

test('client contributes a Settings section instead of a plugin-page form', async () => {
  const { plugin } = await loadPlugin('settings-' + Date.now())
  const { ctx, registrations } = context()
  plugin.apply(ctx)

  const section = registrations.find(entry => entry.options.name === 'settings.section')
  assert.ok(section, 'settings.section is registered')
  assert.equal(section.options.id, 'system-notify')
  assert.equal(section.options.order, 20)
  assert.equal(section.options.label(), 'System notifications')
  assert.equal(typeof section.component, 'function')

  const icon = registrations.find(entry => entry.options.name === 'settings.section.icon')
  assert.ok(icon, 'settings.section.icon is registered')
  assert.equal(icon.options.id, section.options.id)
  assert.equal(typeof icon.component, 'function')

  assert.equal(
    registrations.some(entry => entry.options.name === 'plugins.bundle.config'),
    false,
    'plugin manager no longer hosts the settings form',
  )
})

test('the settings label stays the English plugin name in every locale', async () => {
  const { plugin } = await loadPlugin('locale-' + Date.now())
  let active = 'zh'
  const { ctx, registrations } = context({
    locale: {
      getSnapshot: () => ({ active, revision: 1 }),
      register() { return function () {} },
      subscribe() { return function () {} },
      bind() { return key => key },
    },
  })
  plugin.apply(ctx)
  const section = registrations.find(entry => entry.options.name === 'settings.section')
  assert.equal(section.options.label(), 'System notifications')
  active = 'en'
  assert.equal(section.options.label(), 'System notifications')
})

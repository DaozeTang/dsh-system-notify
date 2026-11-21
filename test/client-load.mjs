import assert from 'node:assert/strict'
import test from 'node:test'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

test('client registers through the module loader and exports apply', async () => {
  let loaded
  globalThis.window = {
    __ModuleLoader__: {
      load(definition) { loaded = definition },
    },
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
  await import(pathToFileURL(resolve('client.js')).href + '?test=' + Date.now())
  assert.ok(loaded, 'loader was called')
  assert.equal(loaded.id, 'dsh-system-notify')
  const plugin = loaded.factory(require)
  assert.deepEqual(plugin.inject, ['slots', 'locale', 'sessions'])
  assert.equal(typeof plugin.apply, 'function')
})

test('client contributes a Settings section instead of a plugin-page form', async () => {
  let loaded
  globalThis.window = {
    __ModuleLoader__: {
      load(definition) { loaded = definition },
    },
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
  await import(pathToFileURL(resolve('client.js')).href + '?test=settings-' + Date.now())
  const plugin = loaded.factory(require)

  const registrations = []
  const locale = {
    getSnapshot: () => ({ active: 'zh', revision: 1 }),
    register() {},
    subscribe() { return function () {} },
    bind() { return key => key },
  }
  const slots = {
    inject(_name, factory) { factory() },
    register(options, component) {
      registrations.push({ options, component })
      return function () {}
    },
  }
  plugin.apply({ locale, slots, effect() { return function () {} } })

  const section = registrations.find(entry => entry.options.name === 'settings.section')
  assert.ok(section, 'settings.section is registered')
  assert.equal(section.options.id, 'system-notify')
  assert.equal(section.options.order, 20)
  assert.equal(section.options.label(), '系统提醒')
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

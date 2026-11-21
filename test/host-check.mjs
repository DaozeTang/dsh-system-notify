import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULTS, ROUTE_PREFIX, mergeConfig, normalizeConfig, validateConfigPatch,
} from '../index.js'

test('route prefix is stable', () => {
  assert.equal(ROUTE_PREFIX, '/api/system-notify')
})

test('normalizeConfig fills nested defaults and ignores unknown fields', () => {
  const value = normalizeConfig({
    enabled: false,
    mode: 'nope',
    events: { complete: false, approval: 'yes', extra: true },
    content: { replyPreview: true, sound: 'loud' },
    unknown: 1,
  })
  assert.deepEqual(value, {
    enabled: false,
    mode: 'background',
    events: { complete: false, approval: true, authorization: true, error: true },
    content: { showTitle: true, replyPreview: true, sound: true },
  })
})

test('normalizeConfig survives null and arrays', () => {
  assert.deepEqual(normalizeConfig(null), DEFAULTS)
  assert.deepEqual(normalizeConfig([]), DEFAULTS)
})

test('mergeConfig preserves siblings while changing one event', () => {
  const value = mergeConfig(DEFAULTS, { events: { approval: false } })
  assert.equal(value.events.approval, false)
  assert.equal(value.events.complete, true)
  assert.equal(value.mode, 'background')
})

test('mergeConfig changes one content field', () => {
  const value = mergeConfig(DEFAULTS, { content: { showTitle: false } })
  assert.equal(value.content.showTitle, false)
  assert.equal(value.content.replyPreview, false)
  assert.equal(value.content.sound, true)
})

test('validateConfigPatch accepts partial nested updates', () => {
  assert.deepEqual(validateConfigPatch({ mode: 'always' }), { mode: 'always' })
  assert.deepEqual(validateConfigPatch({ events: { error: false } }), { events: { error: false } })
  assert.deepEqual(validateConfigPatch({ content: { sound: false } }), { content: { sound: false } })
})

test('validateConfigPatch rejects unknown and wrong types', () => {
  assert.throws(() => validateConfigPatch({ nope: true }), /unknown field/)
  assert.throws(() => validateConfigPatch({ enabled: 'yes' }), /boolean/)
  assert.throws(() => validateConfigPatch({ mode: 'sometimes' }), /background or always/)
  assert.throws(() => validateConfigPatch({ events: { other: true } }), /unknown event/)
  assert.throws(() => validateConfigPatch({ events: { complete: 1 } }), /boolean/)
  assert.throws(() => validateConfigPatch({ content: { nope: true } }), /unknown content/)
  assert.throws(() => validateConfigPatch(null), /expected an object/)
})

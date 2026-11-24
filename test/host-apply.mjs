import assert from 'node:assert/strict'
import test from 'node:test'
import { Readable } from 'node:stream'
import { apply, DEFAULTS, ROUTE_PREFIX } from '../index.js'

const SESSION = 'session-11111111-1111-4111-8111-111111111111'

function response() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name] = value },
    end(value) { this.body = value ?? '' },
  }
}

function request(body) {
  const req = Readable.from([Buffer.from(JSON.stringify(body))])
  req.method = 'POST'
  req.headers = { 'content-type': 'application/json' }
  return req
}

function harness(config) {
  const routes = new Map()
  let listener
  let stored = { ...DEFAULTS, ...(config ?? {}) }
  const ctx = {
    fiber: { entry: {} },
    logger() { return { warn() {} } },
    get(name) {
      if (name === 'webServer') {
        return { register(definition) { routes.set(definition.path, definition); return () => {} } }
      }
      if (name === 'configEditor') {
        return {
          async edit(_entry, change) { stored = change(stored) },
        }
      }
      return undefined
    },
    on(_event, handler) { listener = handler; return () => {} },
    effect(fn) { fn(); return () => {} },
    inject(_names, callback) { callback(ctx) },
  }
  apply(ctx, config)
  return {
    routes,
    emit(session, event) { listener(session, event) },
    get stored() { return stored },
  }
}

async function call(harness, path, body) {
  const definition = harness.routes.get(ROUTE_PREFIX + path)
  assert.ok(definition, 'route ' + path + ' registered')
  assert.equal(definition.kind, 'exact')
  assert.equal(definition.auth, 'required', 'route ' + path + ' needs an authenticated page')
  const res = response()
  await definition.handler(request(body), res)
  return JSON.parse(res.body)
}

test('host routes are registered and status returns defaults', async () => {
  const h = harness()
  const status = await call(h, '/status', {})
  assert.equal(status.ok, true)
  assert.equal(status.value.config.mode, 'background')
  assert.equal(status.value.caps.events, true)
  assert.equal(status.value.caps.authenticatedRoutes, true)
  assert.equal(status.value.version, '0.4.0')
})

test('a non-POST request is rejected by the handler', async () => {
  const h = harness()
  const definition = h.routes.get(ROUTE_PREFIX + '/status')
  const req = request({})
  req.method = 'GET'
  const res = response()
  await definition.handler(req, res)
  assert.equal(res.statusCode, 405)
  assert.equal(res.headers.allow, 'POST')
})

test('turn/end completed carries the reply preview when enabled', async () => {
  const h = harness({ content: { ...DEFAULTS.content, replyPreview: true } })
  h.emit({ id: SESSION }, { type: 'turn/start', seq: 1, data: { turn: 1 } })
  h.emit({ id: SESSION }, {
    type: 'assistant/message',
    seq: 2,
    data: { turn: 1, step: 1, message: { content: [{ type: 'text', text: 'The report is ready.' }] }, stream: [] },
  })
  h.emit({ id: SESSION }, {
    type: 'turn/end',
    seq: 3,
    data: { turn: 1, reason: { kind: 'completed' } },
  })
  const result = await call(h, '/turn-end', { sessionId: SESSION })
  assert.equal(result.ok, true)
  assert.equal(result.value.reason, 'completed')
  assert.equal(result.value.preview, 'The report is ready.')
})

test('a legacy assistant/message shape still yields a preview', async () => {
  const h = harness({ content: { ...DEFAULTS.content, replyPreview: true } })
  h.emit({ id: SESSION }, { type: 'assistant/message', seq: 2, data: { content: [{ type: 'text', text: 'Older shape.' }] } })
  h.emit({ id: SESSION }, { type: 'turn/end', seq: 3, data: { turn: 1, reason: { kind: 'completed' } } })
  const result = await call(h, '/turn-end', { sessionId: SESSION })
  assert.equal(result.value.preview, 'Older shape.')
})

test('turn/end error carries a safe message', async () => {
  const h = harness({ content: { ...DEFAULTS.content, replyPreview: true } })
  h.emit({ id: SESSION }, {
    type: 'turn/end',
    seq: 4,
    data: { turn: 1, reason: { kind: 'error', error: { message: 'model disconnected' } } },
  })
  const result = await call(h, '/turn-end', { sessionId: SESSION })
  assert.equal(result.value.reason, 'error')
  assert.equal(result.value.error, 'model disconnected')
})

test('turn-end rejects an invalid session id', async () => {
  const h = harness()
  const result = await call(h, '/turn-end', { sessionId: '../etc/passwd' })
  assert.equal(result.ok, false)
  assert.equal(result.code, 'SESSION_INVALID')
})

test('config route merges one nested update and returns the effective value', async () => {
  const h = harness()
  const result = await call(h, '/config', { patch: { events: { approval: false } } })
  assert.equal(result.ok, true)
  assert.equal(result.value.config.events.approval, false)
  assert.equal(result.value.config.events.complete, true)
  assert.equal(h.stored.events.approval, false)
})

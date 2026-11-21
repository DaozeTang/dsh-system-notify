// SPDX-License-Identifier: MIT
/**
 * DSH system notifications — Host half.
 *
 * Keeps a tiny, memory-only record of the last turn end for every session, so
 * the browser can tell "finished normally" apart from "stopped", "blocked" and
 * "failed" without opening history. It also owns the plugin's config row and
 * the same-origin routes the settings section uses.
 *
 * No files are written, no network requests are made, and no session content
 * leaves this process beyond the optional 80-character reply preview.
 *
 * @module dsh-system-notify
 */

/** URL prefix shared by every route this plugin serves. */
export const ROUTE_PREFIX = '/api/system-notify'

/** Request bodies are tiny JSON objects; anything larger is hostile. */
const MAX_BODY_BYTES = 64 * 1024

/** Session ids are opaque, but always this shape. */
const SESSION_ID_PATTERN = /^session-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

/** Keep the last turn record for a bounded number of sessions. */
const MAX_SESSIONS = 200

/** Records older than this are treated as absent. */
const RECORD_TTL_MS = 24 * 60 * 60 * 1000

/** Documented defaults; a row config only needs to carry fields it changes. */
export const DEFAULTS = Object.freeze({
  enabled: true,
  mode: 'background',
  events: Object.freeze({
    complete: true,
    approval: true,
    authorization: true,
    error: true,
  }),
  content: Object.freeze({
    showTitle: true,
    replyPreview: false,
    sound: true,
  }),
})

/** Event names the settings section can toggle. */
const EVENT_KEYS = ['complete', 'approval', 'authorization', 'error']

/** Content names the settings section can toggle. */
const CONTENT_KEYS = ['showTitle', 'replyPreview', 'sound']

/** Notification modes. */
const MODES = ['background', 'always']

/**
 * Build one structured failure.
 * @param code - stable machine code the browser reports.
 * @param message - short message safe to show.
 * @returns the error with its code attached.
 */
function fail(code, message) {
  const error = new Error(message ?? code)
  error.code = code
  return error
}

/**
 * Read a message out of an unknown thrown value.
 * @param error - thrown value.
 * @returns a short message.
 */
function messageOf(error) {
  if (error instanceof Error) return error.message
  return typeof error === 'string' ? error : 'unknown error'
}

/**
 * Coerce a row config into the documented shape, ignoring unknown fields.
 * @param raw - the row's config value.
 * @returns the effective config.
 */
export function normalizeConfig(raw) {
  const source = raw !== null && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const bool = (value, fallback) => (typeof value === 'boolean' ? value : fallback)
  const events = source.events !== null && typeof source.events === 'object' ? source.events : {}
  const content = source.content !== null && typeof source.content === 'object' ? source.content : {}
  return {
    enabled: bool(source.enabled, DEFAULTS.enabled),
    mode: MODES.includes(source.mode) ? source.mode : DEFAULTS.mode,
    events: {
      complete: bool(events.complete, DEFAULTS.events.complete),
      approval: bool(events.approval, DEFAULTS.events.approval),
      authorization: bool(events.authorization, DEFAULTS.events.authorization),
      error: bool(events.error, DEFAULTS.events.error),
    },
    content: {
      showTitle: bool(content.showTitle, DEFAULTS.content.showTitle),
      replyPreview: bool(content.replyPreview, DEFAULTS.content.replyPreview),
      sound: bool(content.sound, DEFAULTS.content.sound),
    },
  }
}

/**
 * Merge one validated patch into a config.
 * @param current - current config, possibly partial.
 * @param patch - validated patch.
 * @returns the merged config.
 */
export function mergeConfig(current, patch) {
  const base = normalizeConfig(current)
  const next = patch !== null && typeof patch === 'object' ? patch : {}
  const result = {
    ...base,
    ...(typeof next.enabled === 'boolean' ? { enabled: next.enabled } : {}),
    ...(MODES.includes(next.mode) ? { mode: next.mode } : {}),
  }
  if (next.events !== undefined) result.events = { ...base.events, ...next.events }
  if (next.content !== undefined) result.content = { ...base.content, ...next.content }
  return normalizeConfig(result)
}

/**
 * Validate a config patch coming from the settings section.
 * @param patch - raw patch object.
 * @returns only known, well-typed fields.
 */
export function validateConfigPatch(patch) {
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) {
    throw fail('CONFIG_INVALID', 'expected an object')
  }
  const next = {}
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'enabled') {
      if (typeof value !== 'boolean') throw fail('CONFIG_INVALID', 'enabled must be a boolean')
      next.enabled = value
      continue
    }
    if (key === 'mode') {
      if (!MODES.includes(value)) throw fail('CONFIG_INVALID', 'mode must be background or always')
      next.mode = value
      continue
    }
    if (key === 'events') {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw fail('CONFIG_INVALID', 'events must be an object')
      }
      const events = {}
      for (const [eventKey, eventValue] of Object.entries(value)) {
        if (!EVENT_KEYS.includes(eventKey)) throw fail('CONFIG_INVALID', 'unknown event: ' + eventKey)
        if (typeof eventValue !== 'boolean') throw fail('CONFIG_INVALID', eventKey + ' must be a boolean')
        events[eventKey] = eventValue
      }
      next.events = events
      continue
    }
    if (key === 'content') {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw fail('CONFIG_INVALID', 'content must be an object')
      }
      const content = {}
      for (const [contentKey, contentValue] of Object.entries(value)) {
        if (!CONTENT_KEYS.includes(contentKey)) throw fail('CONFIG_INVALID', 'unknown content field: ' + contentKey)
        if (typeof contentValue !== 'boolean') throw fail('CONFIG_INVALID', contentKey + ' must be a boolean')
        content[contentKey] = contentValue
      }
      next.content = content
      continue
    }
    throw fail('CONFIG_INVALID', 'unknown field: ' + key)
  }
  return next
}

/**
 * Collect a bounded request body as UTF-8 text.
 * @param req - incoming request.
 * @returns the text, or null when the ceiling was exceeded.
 */
async function readBoundedBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > MAX_BODY_BYTES) {
      req.resume()
      return null
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks, size).toString('utf8')
}

/**
 * Write one JSON response.
 * @param res - server response.
 * @param status - HTTP status.
 * @param payload - JSON-serializable body.
 */
function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

/**
 * Ask the connection service whether this request may run at all.
 * @param connection - the composition's connection service.
 * @param req - incoming request (only headers are read).
 * @returns a rejection status, or undefined when admitted.
 */
function rejectionOf(connection, req) {
  if (connection === undefined || connection === null) return 503
  const admit = connection.admit
  if (typeof admit === 'function') {
    try {
      const admission = admit.call(connection, req)
      if (admission !== null && typeof admission === 'object') {
        if ('rejection' in admission) return admission.rejection
        if ('peer' in admission) return undefined
      }
      return 503
    } catch {
      return 503
    }
  }
  const reject = connection.requestRejection
  if (typeof reject !== 'function') return 503
  try {
    return reject.call(connection, req) ?? undefined
  } catch {
    return 503
  }
}

/**
 * Validate one session id from a request body.
 * @param value - candidate.
 * @returns the session id.
 */
function sessionIdOf(value) {
  const sessionId = typeof value === 'string' ? value : ''
  if (!SESSION_ID_PATTERN.test(sessionId)) throw fail('SESSION_INVALID', 'invalid session id')
  return sessionId
}

/**
 * Read text blocks out of an assistant message event.
 * @param event - session event.
 * @returns a short plain-text preview.
 */
function previewOfAssistantEvent(event) {
  const data = event?.data
  const content = Array.isArray(data?.content)
    ? data.content
    : Array.isArray(data?.message?.content)
      ? data.message.content
      : []
  const text = content
    .filter(part => part !== null && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string')
    .map(part => part.text)
    .join(' ')
  return text.slice(0, 400)
}

/**
 * Reduce an error-shaped turn reason to a short message.
 * @param value - turn/end reason.
 * @returns a safe message.
 */
function errorOfReason(value) {
  if (typeof value === 'string') return value.slice(0, 400)
  if (value === null || typeof value !== 'object') return 'the turn failed'
  const error = value.error
  if (typeof error === 'string') return error.slice(0, 400)
  if (error !== null && typeof error === 'object') {
    if (typeof error.message === 'string') return error.message.slice(0, 400)
    if (typeof error.code === 'string') return error.code
  }
  if (typeof value.message === 'string') return value.message.slice(0, 400)
  if (typeof value.code === 'string') return value.code
  return 'the turn failed'
}

/**
 * Register the Host half.
 * @param ctx - the plugin's Cordis context.
 * @param rawConfig - the row config from the bundle patch or the user's patch.
 */
export function apply(ctx, rawConfig) {
  let config = normalizeConfig(rawConfig)
  const log = typeof ctx.logger === 'function' ? ctx.logger('system-notify') : console
  /** sessionId -> last turn end record */
  const turns = new Map()
  /** sessionId -> first assistant text of the current turn */
  const previews = new Map()
  /** sessionId -> turn start timestamp */
  const starts = new Map()

  /**
   * Drop a session's turn record when it gets too old.
   * @param sessionId - session to inspect.
   */
  function prune(sessionId) {
    const record = turns.get(sessionId)
    if (record === undefined) return
    if (Date.now() - record.endedAt <= RECORD_TTL_MS) return
    turns.delete(sessionId)
    previews.delete(sessionId)
    starts.delete(sessionId)
  }

  /**
   * Keep the map bounded without a timer.
   */
  function trimTurns() {
    if (turns.size <= MAX_SESSIONS) return
    const oldest = [...turns.entries()].sort((left, right) => left[1].endedAt - right[1].endedAt)
    for (let index = 0; index < oldest.length - MAX_SESSIONS; index += 1) {
      turns.delete(oldest[index][0])
    }
  }

  /**
   * Record one durable session event.
   * @param session - session that emitted the event.
   * @param event - event body.
   */
  function observe(session, event) {
    const sessionId = typeof session?.id === 'string' ? session.id : ''
    if (sessionId === '' || event === null || typeof event !== 'object') return
    if (event.type === 'turn/start') {
      starts.set(sessionId, Date.now())
      previews.delete(sessionId)
      return
    }
    if (event.type === 'assistant/message') {
      const preview = previewOfAssistantEvent(event)
      if (preview !== '') previews.set(sessionId, preview)
      return
    }
    if (event.type === 'turn/end') {
      const reason = event.data?.reason
      const kind = typeof reason?.kind === 'string' ? reason.kind : 'unknown'
      const endedAt = Date.now()
      const startedAt = starts.get(sessionId)
      turns.set(sessionId, {
        reason: kind,
        error: kind === 'error' ? errorOfReason(reason) : undefined,
        preview: previews.get(sessionId),
        seq: Number.isSafeInteger(event.seq) ? event.seq : 0,
        endedAt,
        startedAt: Number.isFinite(startedAt) ? startedAt : undefined,
      })
      starts.delete(sessionId)
      previews.delete(sessionId)
      trimTurns()
    }
  }

  if (typeof ctx.on === 'function') {
    ctx.effect(() => ctx.on('session/event', observe), 'system-notify: turn records')
  }

  /**
   * Read the last turn record for a session.
   * @param sessionId - session to read.
   * @returns the record, or null.
   */
  function classification(sessionId) {
    prune(sessionId)
    const record = turns.get(sessionId)
    if (record === undefined) return null
    return {
      reason: record.reason,
      error: record.error,
      preview: config.content.replyPreview ? record.preview : undefined,
      seq: record.seq,
      endedAt: record.endedAt,
      durationMs: record.startedAt === undefined ? undefined : record.endedAt - record.startedAt,
    }
  }

  /**
   * Read model for the settings section.
   * @returns config, capabilities and a small version marker.
   */
  function status() {
    return {
      config,
      caps: {
        webServer: ctx.get('webServer') !== undefined,
        connection: ctx.get('connection') !== undefined,
        configEditor: ctx.get('configEditor') !== undefined,
        events: typeof ctx.on === 'function',
      },
      platform: process.platform,
      version: '0.3.0',
    }
  }

  /**
   * Write one config patch through the config editor.
   * @param request - { patch }.
   * @returns the effective config.
   */
  async function writeConfig(request) {
    const patch = validateConfigPatch(request?.patch)
    const editor = ctx.get('configEditor')
    const entry = ctx.fiber?.entry
    if (editor === undefined || entry === undefined) {
      throw fail('CONFIG_UNAVAILABLE', 'Configuration cannot be saved in this profile')
    }
    try {
      await editor.edit(entry, current => mergeConfig(current, patch))
    } catch (error) {
      throw fail('CONFIG_WRITE_FAILED', messageOf(error))
    }
    config = mergeConfig(config, patch)
    return { config }
  }

  /** Route table: every entry is a POST answering {ok, value} or {ok:false, code, message}. */
  const routeTable = [
    { path: '/status', run: async () => status() },
    { path: '/config', run: async body => writeConfig(body) },
    {
      path: '/turn-end',
      run: async body => {
        const sessionId = sessionIdOf(body?.sessionId)
        return classification(sessionId)
      },
    },
  ]

  ctx.inject(['webServer', 'connection'], (sctx) => {
    const server = sctx.get('webServer')
    for (const route of routeTable) {
      sctx.effect(() => server.register({
        kind: 'exact',
        path: ROUTE_PREFIX + route.path,
        handler: async (req, res) => {
          try {
            const rejection = rejectionOf(sctx.get('connection'), req)
            if (rejection !== undefined) {
              res.statusCode = rejection
              res.end()
              return
            }
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('allow', 'POST')
              res.end()
              return
            }
            const text = await readBoundedBody(req)
            if (text === null) {
              sendJson(res, 413, { ok: false, code: 'BODY_TOO_LARGE', message: 'request body too large' })
              return
            }
            let body = {}
            if (text.trim() !== '') {
              try {
                body = JSON.parse(text)
              } catch {
                sendJson(res, 400, { ok: false, code: 'BAD_REQUEST', message: 'invalid JSON body' })
                return
              }
            }
            if (body === null || typeof body !== 'object' || Array.isArray(body)) {
              sendJson(res, 400, { ok: false, code: 'BAD_REQUEST', message: 'expected a JSON object' })
              return
            }
            const value = await route.run(body)
            sendJson(res, 200, { ok: true, value })
          } catch (error) {
            log.warn?.('system-notify ' + route.path + ' failed: ' + messageOf(error))
            sendJson(res, 200, {
              ok: false,
              code: typeof error?.code === 'string' ? error.code : 'INTERNAL',
              message: messageOf(error),
            })
          }
        },
      }), 'system-notify: POST ' + route.path)
    }
  })
}

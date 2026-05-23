import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { request as undiciRequest } from 'undici'
import { promises as dns } from 'dns'
import { isIPv4, isIPv6 } from 'net'

const app  = express()
const PORT = process.env.PORT || 3001

// ── 1. SECURITY HEADERS (Helmet) ─────────────────────────────────────────
// Sets X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
// Content-Security-Policy, and removes X-Powered-By among others.
app.use(helmet())

// ── 2. CORS ───────────────────────────────────────────────────────────────
// In production set ALLOWED_ORIGIN env var to your actual frontend domain.
// Accepts a comma-separated list so you can allow multiple origins if needed.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl requests with no Origin header in dev
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: origin '${origin}' not allowed`))
  },
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
}))

// ── 3. BODY PARSING — size-limited ───────────────────────────────────────
// 50 KB is more than enough for 500 URLs. Rejects oversized bodies early.
app.use(express.json({ limit: '50kb' }))

// ── 4. GLOBAL REQUEST TIMEOUT ────────────────────────────────────────────
// Kills any request that hasn't finished in 40 s (slightly above max URL timeout).
app.use((req, _res, next) => {
  req.setTimeout(40_000)
  next()
})

// ── 5. RATE LIMITING ─────────────────────────────────────────────────────
// General limiter: 200 req / 15 min per IP — catches broad abuse.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

// Bulk check limiter: 10 req / min per IP — each request can carry many URLs.
const bulkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Bulk check rate limit exceeded. Max 10 checks per minute.' },
})

// Single re-check limiter: 60 req / min per IP.
const singleLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Re-check rate limit exceeded.' },
})

app.use(generalLimiter)

// ── 6. SSRF PROTECTION ───────────────────────────────────────────────────
// Private / reserved IPv4 ranges per RFC 1918, RFC 3927, RFC 5737, etc.
const PRIVATE_V4_RANGES = [
  ['10.0.0.0',      8 ],  // RFC 1918 private
  ['172.16.0.0',   12 ],  // RFC 1918 private
  ['192.168.0.0',  16 ],  // RFC 1918 private
  ['127.0.0.0',     8 ],  // Loopback
  ['169.254.0.0',  16 ],  // Link-local / AWS metadata (169.254.169.254)
  ['100.64.0.0',   10 ],  // CGNAT (RFC 6598)
  ['0.0.0.0',       8 ],  // "This" network
  ['192.0.0.0',    24 ],  // IETF Protocol Assignments
  ['192.0.2.0',    24 ],  // TEST-NET-1 (documentation)
  ['198.18.0.0',   15 ],  // Benchmarking
  ['198.51.100.0', 24 ],  // TEST-NET-2
  ['203.0.113.0',  24 ],  // TEST-NET-3
  ['240.0.0.0',     4 ],  // Reserved / future use
  ['255.255.255.255', 32], // Broadcast
]

function ipv4ToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc * 256) + parseInt(octet, 10), 0) >>> 0
}

function isPrivateV4(ip) {
  const n = ipv4ToInt(ip)
  return PRIVATE_V4_RANGES.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
    return (n & mask) === (ipv4ToInt(base) & mask)
  })
}

function isPrivateV6(ip) {
  const lower = ip.toLowerCase()
  return (
    lower === '::1'                    ||  // loopback
    lower === '0:0:0:0:0:0:0:1'       ||  // loopback (full form)
    lower.startsWith('fc')             ||  // Unique Local (RFC 4193)
    lower.startsWith('fd')             ||  // Unique Local
    lower.startsWith('fe80')           ||  // Link-local
    lower.startsWith('::ffff:')            // IPv4-mapped — checked below
  )
}

function isPrivateIP(ip) {
  if (!ip) return true
  if (isIPv4(ip)) return isPrivateV4(ip)
  if (isIPv6(ip)) {
    // Unwrap IPv4-mapped IPv6 (::ffff:192.168.1.1)
    const v4mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)
    if (v4mapped) return isPrivateV4(v4mapped[1])
    return isPrivateV6(ip)
  }
  return true // Unknown format — block by default
}

// Blocked hostnames regardless of DNS resolution
const BLOCKED_HOSTNAMES = new Set(['localhost', 'metadata.google.internal'])
const BLOCKED_HOSTNAME_SUFFIXES = ['.local', '.internal', '.localhost', '.test', '.example', '.invalid']

async function assertSafeUrl(rawUrl) {
  let parsed
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw Object.assign(new Error('Invalid URL'), { code: 'INVALID_URL' })
  }

  const { protocol, hostname } = parsed

  // ── Scheme allowlist ──
  if (!['http:', 'https:'].includes(protocol)) {
    throw Object.assign(new Error(`Scheme '${protocol}' not allowed`), { code: 'BAD_SCHEME' })
  }

  // ── Blocked hostname names ──
  const hostLower = hostname.toLowerCase()
  if (BLOCKED_HOSTNAMES.has(hostLower)) {
    throw Object.assign(new Error('Hostname not allowed'), { code: 'SSRF' })
  }
  if (BLOCKED_HOSTNAME_SUFFIXES.some(s => hostLower.endsWith(s))) {
    throw Object.assign(new Error('Hostname not allowed'), { code: 'SSRF' })
  }

  // ── If hostname is already a raw IP, check it directly ──
  if (isIPv4(hostname) || isIPv6(hostname.replace(/^\[|\]$/g, ''))) {
    const ip = hostname.replace(/^\[|\]$/g, '')
    if (isPrivateIP(ip)) {
      throw Object.assign(new Error('Private/reserved IP not allowed'), { code: 'SSRF' })
    }
    return // raw public IP — safe
  }

  // ── DNS resolution check (prevents redirect to private IP too) ──
  // We check both A (IPv4) and AAAA (IPv6) records.
  const checks = await Promise.allSettled([
    dns.resolve4(hostname).catch(() => []),
    dns.resolve6(hostname).catch(() => []),
  ])
  const allIPs = checks.flatMap(r => r.status === 'fulfilled' ? r.value : [])

  for (const ip of allIPs) {
    if (isPrivateIP(ip)) {
      throw Object.assign(
        new Error(`'${hostname}' resolves to a private/reserved address`),
        { code: 'SSRF' }
      )
    }
  }
}

// ── 7. INPUT VALIDATION ───────────────────────────────────────────────────
const MAX_URLS_PER_REQUEST = 500
const MAX_URL_LENGTH       = 2048

function validateUrlInput(raw) {
  if (typeof raw !== 'string') return { ok: false, reason: 'Not a string' }
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, reason: 'Empty' }
  if (trimmed.length > MAX_URL_LENGTH) return { ok: false, reason: 'URL exceeds 2048 characters' }

  // Block dangerous non-http schemes BEFORE normalisation.
  // Catches file://, ftp://, javascript:, data:, etc.
  // Regex matches any scheme-like prefix that is NOT http(s).
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):/)
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase()
    if (scheme !== 'http' && scheme !== 'https') {
      return { ok: false, reason: `Scheme '${scheme}:' not allowed` }
    }
  }

  // Normalise: prepend https:// if no scheme present
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed

  // Final parse to confirm it is a valid URL with an allowed protocol
  try {
    const { protocol } = new URL(withScheme)
    if (!['http:', 'https:'].includes(protocol)) return { ok: false, reason: 'Scheme not allowed' }
  } catch {
    return { ok: false, reason: 'Malformed URL' }
  }

  return { ok: true, url: withScheme }
}

// ── 8. CORE URL CHECKER ───────────────────────────────────────────────────
async function checkUrl(rawUrl, timeoutMs = 8000) {
  const original = rawUrl.trim()
  if (!original) return null

  const withScheme = /^https?:\/\//i.test(original) ? original : 'https://' + original
  const bare = withScheme.replace(/^https?:\/\//i, '')
  const schemes = ['https://', 'http://']

  for (const scheme of schemes) {
    const tryUrl = scheme + bare
    const t0 = Date.now()

    // SSRF check before every fetch attempt
    try {
      await assertSafeUrl(tryUrl)
    } catch (ssrfErr) {
      return {
        url: original,
        exists: false,
        status: null,
        label: 'DOWN',
        finalUrl: null,
        responseTime: 0,
        error: ssrfErr.code === 'SSRF' ? 'Blocked: private/internal address' : ssrfErr.message,
      }
    }

    try {
      let resp = await undiciRequest(tryUrl, {
        method: 'HEAD',
        maxRedirections: 5,
        headersTimeout: timeoutMs,
        bodyTimeout: timeoutMs,
        headers: { 'User-Agent': 'Mozilla/5.0 LinkChecker/2.0' },
        throwOnError: false,
      })

      // 405 Method Not Allowed — retry with GET
      if (resp.statusCode === 405) {
        // 8. RESPONSE SIZE CAP — drain only first 4 KB, we only need the status
        await resp.body.dump({ limit: 4096 })
        resp = await undiciRequest(tryUrl, {
          method: 'GET',
          maxRedirections: 5,
          headersTimeout: timeoutMs,
          bodyTimeout: timeoutMs,
          headers: { 'User-Agent': 'Mozilla/5.0 LinkChecker/2.0' },
          throwOnError: false,
        })
      }

      // 8. RESPONSE SIZE CAP — discard body, we only needed the status code
      await resp.body.dump({ limit: 4096 })

      const responseTime = Date.now() - t0
      const exists = resp.statusCode < 400

      return {
        url: original,
        exists,
        status: resp.statusCode,
        label: exists ? 'UP' : 'DOWN',
        finalUrl: resp.headers?.location ?? tryUrl,
        responseTime,
      }
    } catch (err) {
      const isSSL =
        err.message?.toLowerCase().includes('ssl') ||
        err.message?.toLowerCase().includes('certificate') ||
        err.code === 'ERR_TLS_CERT_ALTNAME_INVALID' ||
        err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
      if (isSSL) continue

      if (scheme === schemes[schemes.length - 1]) {
        return {
          url: original,
          exists: false,
          status: null,
          label: 'DOWN',
          finalUrl: null,
          responseTime: Date.now() - t0,
          error: err.code ?? 'Unreachable',
        }
      }
    }
  }

  return {
    url: original,
    exists: false,
    status: null,
    label: 'DOWN',
    finalUrl: null,
    responseTime: null,
    error: 'SSL Error',
  }
}

// ── ROUTES ────────────────────────────────────────────────────────────────

// POST /api/check — bulk, streaming NDJSON
app.post('/api/check', bulkLimiter, async (req, res) => {
  const { urls = [], timeout = 8, workers = 10 } = req.body

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'No URLs provided.' })
  }

  // 7. INPUT VALIDATION — hard cap on batch size
  if (urls.length > MAX_URLS_PER_REQUEST) {
    return res.status(400).json({
      error: `Too many URLs. Maximum is ${MAX_URLS_PER_REQUEST} per request.`,
    })
  }

  // Validate & normalise each URL up front; skip invalid ones
  const validated = urls.map(validateUrlInput)
  const valid = validated.filter(v => v.ok).map(v => v.url)
  const invalid = urls.filter((_, i) => !validated[i].ok)

  if (valid.length === 0) {
    return res.status(400).json({ error: 'No valid URLs found after validation.' })
  }

  const timeoutMs   = Math.min(Math.max(Number(timeout)  || 8,  1), 30) * 1000
  const concurrency = Math.min(Math.max(Number(workers)  || 10, 1), 50)

  res.setHeader('Content-Type', 'application/x-ndjson')
  res.setHeader('Transfer-Encoding', 'chunked')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  // Emit a synthetic DOWN result for each rejected URL immediately
  for (let i = 0; i < urls.length; i++) {
    if (!validated[i].ok) {
      res.write(JSON.stringify({
        url: urls[i],
        exists: false,
        status: null,
        label: 'DOWN',
        finalUrl: null,
        responseTime: 0,
        error: validated[i].reason,
      }) + '\n')
    }
  }

  // Process valid URLs with sliding concurrency window
  let i = 0
  const inFlight = new Set()

  async function processNext() {
    if (i >= valid.length) return
    const url = valid[i++]
    const p = checkUrl(url, timeoutMs).then(result => {
      if (result) res.write(JSON.stringify(result) + '\n')
      inFlight.delete(p)
    })
    inFlight.add(p)
  }

  for (let k = 0; k < Math.min(concurrency, valid.length); k++) await processNext()

  while (i < valid.length || inFlight.size > 0) {
    await Promise.race(inFlight)
    while (inFlight.size < concurrency && i < valid.length) await processNext()
  }

  res.end()
})

// POST /api/check-single — re-check one URL
app.post('/api/check-single', singleLimiter, async (req, res) => {
  const { url, timeout = 8 } = req.body
  if (!url) return res.status(400).json({ error: 'No URL provided.' })

  const v = validateUrlInput(url)
  if (!v.ok) {
    return res.status(400).json({
      url,
      exists: false,
      status: null,
      label: 'DOWN',
      finalUrl: null,
      responseTime: 0,
      error: v.reason,
    })
  }

  const timeoutMs = Math.min(Math.max(Number(timeout) || 8, 1), 30) * 1000
  const result = await checkUrl(v.url, timeoutMs)
  res.json(result ?? { url, exists: false, status: null, label: 'DOWN', error: 'Empty result' })
})

// ── Error handler ─────────────────────────────────────────────────────────
// Catches CORS errors and any other unhandled Express errors
app.use((err, _req, res, _next) => {
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`LinkChecker backend  http://localhost:${PORT}`)
  console.log(`Allowed origins:     ${ALLOWED_ORIGINS.join(', ')}`)
})

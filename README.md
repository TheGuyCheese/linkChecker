# LinkChecker

Bulk URL checker — paste links or upload a file, get instant online/offline results with response times and visual stats.

Built with React + Vite (frontend) and Node.js + Express (backend).

---

## Features

- **Paste or upload** — enter URLs directly or drop a `.txt` file (one URL per line)
- **Parallel checking** — configurable workers (1–20) and per-URL timeout (3–20s)
- **Live streaming** — results appear as they complete, not all at once
- **Response time** — shows how long each URL took to respond in ms
- **Stats dashboard** — online/offline donut chart, response time histogram, avg/min/max cards
- **Filter** — view All / Online / Offline results
- **Virtual scroll** — handles 1000+ URLs without performance issues
- **Re-check** — re-ping any individual URL without re-running the full batch
- **Stop mid-run** — cancel a check and keep the partial results
- **CSV export** — download results with URL, status, HTTP code, response time, and final URL
- **HTTP + HTTPS** — auto-tries both schemes; falls back from HEAD to GET if needed

---

## Security

All security is implemented in the backend:

- **SSRF protection** — every URL is DNS-resolved before fetch; private/reserved IPs are blocked (RFC 1918, loopback, link-local `169.254.x.x`, CGNAT, IPv6 ULA). Direct private IPs and internal hostnames (`.local`, `.internal`, `localhost`) are also blocked.
- **Scheme allowlist** — only `http://` and `https://` are accepted. `file://`, `ftp://`, `javascript:`, `data:` and any other scheme are rejected before normalisation.
- **Rate limiting** — 200 req / 15 min general; 10 bulk checks / min; 60 single rechecks / min per IP.
- **Input validation** — max 500 URLs per request, max 2048 chars per URL, non-string inputs rejected.
- **CORS** — locked to the configured frontend origin via `ALLOWED_ORIGIN` env var.
- **Security headers** — Helmet sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, CSP, and removes `X-Powered-By`.
- **Body size limit** — requests over 50 KB are rejected before parsing.
- **Global timeout** — requests exceeding 40s are killed server-side.
- **Response size cap** — only the first 4 KB of each URL response is read; large response bodies are never fully downloaded.

---

## Running locally

**Backend**
```bash
cd backend
npm install
npm run dev        # runs on http://localhost:3001
```

**Frontend**
```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:5173
```

Vite proxies `/api` requests to the backend in dev — no extra config needed.

---

## Environment variables

**Backend** (copy `backend/.env.example` → `backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port the server listens on |
| `ALLOWED_ORIGIN` | `http://localhost:5173` | Comma-separated allowed frontend origins |
| `NODE_ENV` | — | Set to `production` to enable strict CORS |

**Frontend** (copy `frontend/.env.example` → `frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | *(empty)* | Backend base URL in production (e.g. `https://your-backend.up.railway.app`) |

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, react-window |
| Backend | Node.js, Express, undici |
| Security | Helmet, express-rate-limit, custom SSRF guard |

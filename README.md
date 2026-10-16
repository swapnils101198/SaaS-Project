# APIPulse — Developer Service & API Resource Manager

**Project Name:** `APIPulse` (`sample-fullstack-app`)  
**Version:** `1.0.0`  
**License:** MIT  
**Tech Stack:** React 18, TypeScript, Vite 6, Node.js (>= 18), Express 4  
**Zero-JavaScript Policy:** 100% strict TypeScript (`.ts` and `.tsx`). No `.js` source or configuration files.

---

## 1. Port Configuration

| Service | Port | Local URL | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | `5300` | [http://localhost:5300](http://localhost:5300) | Vite dev server configured with `strictPort: true` |
| **Backend** | `3000` | [http://localhost:3000](http://localhost:3000) | Express REST API with CORS and security headers |

The React frontend communicates with the backend via the Vite environment variable:
```env
VITE_API_URL=http://localhost:3000
```

---

## 2. Running Commands

### Run Both Frontend & Backend Concurrently (Recommended)
Starts the backend on port `3000` and the frontend on port `5300` simultaneously:
```bash
npm run dev
```

### Run Backend Only (`http://localhost:3000`)
```bash
# From project root:
npm run dev:backend

# Or from backend workspace:
cd backend && npm run dev
```

### Run Frontend Only (`http://localhost:5300`)
```bash
# From project root:
npm run dev:frontend

# Or from frontend workspace:
cd frontend && npm run dev
```

---

## 3. Build Commands

### Build Entire Project (Both Frontend & Backend)
Compiles backend TypeScript into `backend/dist` and bundles frontend production assets into `frontend/dist`:
```bash
npm run build
```

### Build Workspaces Separately
```bash
# Build frontend only:
npm run build:frontend

# Build backend only:
npm run build:backend
```

---

## 4. Type Checking & Testing

```bash
# Type-check both workspaces (strict TypeScript compiler check):
npm run typecheck

# Type-check frontend only:
npm run typecheck:frontend

# Type-check backend only:
npm run typecheck:backend

# Run automated integration test suite (19 Vitest tests):
npm run test
```

---

## 5. Git Repository Operations

**Repository Name:** `sample-fullstack-app`  
**Default Branch:** `main`

### Initialize and Connect Remote
```bash
# Initialize local repository (if not already done)
git init
git branch -m main

# Add remote repository URL (replace with your git remote URL)
git remote add origin https://github.com/<your-username>/sample-fullstack-app.git
```

### Pulling Changes (`git pull`)
```bash
# Pull latest changes from remote main branch:
git pull origin main

# Pull with rebase to keep commit history clean:
git pull --rebase origin main
```

### Staging, Committing & Pushing (`git push`)
```bash
# Check working directory status
git status

# Stage all tracked and new files (node_modules and dist are ignored by root .gitignore)
git add .

# Create a commit
git commit -m "feat: complete APIPulse production-ready fullstack app"

# Push to remote main branch (first push sets upstream):
git push -u origin main

# Subsequent pushes:
git push origin main

# If pushing a new feature branch:
git checkout -b feature/your-feature-name
git push -u origin feature/your-feature-name
```

---

## 6. Project Architecture & Working Domain

### Domain Overview
**APIPulse** is a developer-focused **Service & API Resource Manager** that provides centralized visibility, operational status tracking, and latency diagnostics for microservices and internal API endpoints.

### How It Works (End-to-End Flow):
1. **In-Memory Thread-Safe Service Layer (`backend/src/services/resource.service.ts`)**:
   - Manages an enterprise microservice catalog (pre-seeded with Auth API, Billing Webhook, Notification Worker, Vector Search, Telemetry Collector, and CRM Gateway).
   - Computes live operational telemetry: total services, fleet health ratio percentage, mean latency, process uptime, and memory consumption.
   - Provides an interactive ping testing mechanism that simulates real network jitter and triggers dynamic health degradation / recovery.
2. **Security & Reliability Layer (`backend/src/middleware/`)**:
   - `securityHeaders`: Injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0`, `Referrer-Policy: strict-origin-when-cross-origin`, CSP, and `Cache-Control: no-store`.
   - `rateLimiter`: Protects against brute-force request flooding using a sliding-window tracker (120 req/min) returning `HTTP 429 Too Many Requests`.
   - `validation`: Strictly enforces string lengths, valid endpoint paths (`/` or `https://`), HTTP method enums, and character sanitization.
   - `errorHandler`: Returns consistent structured JSON error responses.
3. **Reactive Frontend Dashboard (`frontend/src/`)**:
   - **Real-Time Telemetry Bar (`MetricsBar.tsx`)**: Displays live health percentages and uptime.
   - **Filter & Search Panel (`ResourceFilters.tsx`)**: Debounced search across service names, endpoints, descriptions, and tags; filtering by environment (`production`, `staging`, `development`) and status (`healthy`, `degraded`, `offline`); multi-field sorting.
   - **Resource Catalog (`ResourceCard.tsx`)**: Displays HTTP method badges, copyable endpoint paths, health dots, latency badges, and actions (Ping Test, Edit, Delete).
   - **Accessible Modals (`ResourceModal.tsx`, `DeleteModal.tsx`)**: Complete keyboard navigation (Escape to dismiss, focus trap), field-level error feedback, and deletion confirmation.
   - **Interactive API Sandbox (`QuickTester.tsx`)**: Built-in playground testing `GET /api/health`, `GET /api/message`, and `POST /api/greeting` with response inspection and latency timings.
   - **Network Awareness**: Listens to browser `online`/`offline` events and presents an accessible banner when disconnected.

---

## 7. API Reference

| Method | Endpoint | Description | Request Body / Query Params | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health-check endpoint | None | `200 OK` |
| `GET` | `/api/message` | Sample message payload | None | `200 OK` |
| `POST` | `/api/greeting` | Input-validated greeting | `{ "name": "Alice" }` | `200 OK` / `400 Bad Request` |
| `GET` | `/api/metrics` | Real-time system telemetry | None | `200 OK` |
| `GET` | `/api/resources` | List paginated services | `?search=auth&status=healthy&page=1&limit=6` | `200 OK` |
| `GET` | `/api/resources/:id` | Get single service | None | `200 OK` / `404 Not Found` |
| `POST` | `/api/resources` | Register new service | `{ "name": "...", "endpoint": "...", "method": "GET", ... }` | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/resources/:id` | Update service | `{ "status": "degraded", ... }` | `200 OK` / `400` / `404` |
| `DELETE`| `/api/resources/:id` | Delete service | None | `200 OK` / `404 Not Found` |
| `POST` | `/api/resources/:id/ping`| Ping test service | None | `200 OK` / `404 Not Found` |

---

### CORS Errors
Ensure `FRONTEND_ORIGIN` in `backend/.env` is set to `http://localhost:5300` and `VITE_API_URL` in `frontend/.env` points to `http://localhost:3000`.

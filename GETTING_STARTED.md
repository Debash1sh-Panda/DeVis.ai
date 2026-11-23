# 🚀 DeVis.ai — Getting Started Guide

## Quick Start (Run Both Apps)

### Step 1 — Set Up Environment
```bash
# Copy the example env file
copy .env.example .env
```
Then open `.env` and fill in these required values:
```
DATABASE_URL="postgresql://devis:devis_pass@localhost:5432/devis_db"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this"
GEMINI_API_KEY="your-gemini-api-key-from-aistudio.google.com"
```

---

### Step 2 — Start Databases (PostgreSQL + Redis)
```bash
docker-compose up -d
```
This starts:
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`

Verify they're running:
```bash
docker-compose ps
```

---

### Step 3 — Run Database Migration (First Time Only)
```bash
cd apps\api
node_modules\.bin\prisma migrate dev --schema=..\..\packages\database\prisma\schema.prisma --name init
cd ..\..
```

---

### Step 4 — Start the Backend (NestJS API)
Open a terminal and run:
```bash
pnpm --filter api start:dev
```
Or:
```bash
cd apps\api
pnpm start:dev
```
**Backend runs on:** http://localhost:3001
**Swagger API Docs:** http://localhost:3001/api/docs

---

### Step 5 — Start the Frontend (Next.js)
Open a **second terminal** and run:
```bash
pnpm --filter web dev
```
Or:
```bash
cd apps\web
pnpm dev
```
**Frontend runs on:** http://localhost:3000

---

## Run Both at Once (Single Command)
```bash
pnpm --parallel dev
```
> Note: Requires `pnpm` v7+ and dev scripts in root `package.json`

---

## Build for Production
```bash
# Build backend
pnpm --filter api build

# Build frontend
pnpm --filter web build

# Start backend in production
pnpm --filter api start:prod

# Start frontend in production
pnpm --filter web start
```

---

## Other Useful Commands

### Prisma Commands
```bash
# Open Prisma Studio (visual DB editor)
cd apps\api
node_modules\.bin\prisma studio --schema=..\..\packages\database\prisma\schema.prisma

# Create a new migration
node_modules\.bin\prisma migrate dev --schema=..\..\packages\database\prisma\schema.prisma --name your_migration_name

# Reset database (WARNING: deletes all data)
node_modules\.bin\prisma migrate reset --schema=..\..\packages\database\prisma\schema.prisma
```

### Install Dependencies
```bash
# Install all packages (run from root)
pnpm install
```

### Stop Databases
```bash
docker-compose down
```

---

## 📁 Folder Structure

```
DeVis.ai/
│
├── 📁 apps/
│   ├── 📁 web/                    ← FRONTEND (Next.js 16)
│   │   ├── src/
│   │   │   ├── app/               ← Pages (App Router)
│   │   │   │   ├── page.tsx           → Landing page (/)
│   │   │   │   ├── layout.tsx         → Root layout
│   │   │   │   ├── dashboard/         → Dashboard (/dashboard)
│   │   │   │   ├── tasks/             → Task list (/tasks)
│   │   │   │   ├── approvals/         → Approval queue (/approvals)
│   │   │   │   ├── memory/            → Agent memory (/memory)
│   │   │   │   └── settings/          → Settings (/settings)
│   │   │   ├── components/        ← Reusable UI components (add here)
│   │   │   ├── hooks/             ← Custom React hooks
│   │   │   │   ├── use-tasks.ts       → Fetch all tasks
│   │   │   │   ├── use-task.ts        → Fetch single task (with polling)
│   │   │   │   └── use-realtime.ts    → WebSocket events hook
│   │   │   ├── lib/               ← Utilities
│   │   │   │   ├── api.ts             → Axios client + API endpoints
│   │   │   │   └── websocket.ts       → Socket.io client
│   │   │   ├── providers/         ← React context providers
│   │   │   │   └── query-provider.tsx → TanStack Query provider
│   │   │   └── types/             ← TypeScript types (add here)
│   │   ├── next.config.ts         ← Next.js config
│   │   └── package.json
│   │
│   ├── 📁 api/                    ← BACKEND (NestJS)
│   │   ├── src/
│   │   │   ├── main.ts                → Entry point (port 3001)
│   │   │   ├── app.module.ts          → Root module (imports all features)
│   │   │   │
│   │   │   ├── config/                → Environment configuration
│   │   │   │   ├── configuration.ts   → Config factory (maps env vars)
│   │   │   │   └── validation.ts      → Joi env validation schema
│   │   │   │
│   │   │   ├── database/              → Prisma database connection
│   │   │   │   ├── database.module.ts
│   │   │   │   └── prisma.service.ts  → PrismaClient wrapper
│   │   │   │
│   │   │   ├── auth/                  → Authentication (JWT)
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.service.ts    → register, login, token generation
│   │   │   │   ├── auth.controller.ts → POST /api/v1/auth/register, /login
│   │   │   │   ├── dto/               → LoginDto, RegisterDto
│   │   │   │   ├── strategies/        → JwtStrategy (Passport)
│   │   │   │   └── guards/            → JwtAuthGuard
│   │   │   │
│   │   │   ├── users/                 → User management
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.repository.ts
│   │   │   │   └── users.controller.ts → GET /api/v1/users/me
│   │   │   │
│   │   │   ├── tasks/                 → Task CRUD
│   │   │   │   ├── tasks.module.ts
│   │   │   │   ├── tasks.service.ts
│   │   │   │   ├── tasks.repository.ts
│   │   │   │   ├── tasks.controller.ts → POST /tasks, GET /tasks/:id, POST /tasks/:id/cancel
│   │   │   │   └── dto/create-task.dto.ts
│   │   │   │
│   │   │   ├── agent/                 → AI Agent orchestration loop
│   │   │   │   ├── agent.module.ts
│   │   │   │   ├── agent.service.ts   → Main loop: context → plan → execute
│   │   │   │   ├── context.service.ts → Build AgentContext from DB state
│   │   │   │   ├── planner.service.ts → Call AI, enforce max steps
│   │   │   │   └── executor.service.ts→ Run tool after permission check
│   │   │   │
│   │   │   ├── ai/                    → AI provider abstraction
│   │   │   │   ├── ai.module.ts
│   │   │   │   ├── ai.service.ts      → Routes to correct provider
│   │   │   │   ├── interfaces/        → AIProvider interface
│   │   │   │   └── providers/
│   │   │   │       ├── gemini.provider.ts  → Google Gemini 1.5 Pro
│   │   │   │       └── openai.provider.ts  → OpenAI GPT-4o
│   │   │   │
│   │   │   ├── tools/                 → Tool registry
│   │   │   │   ├── tools.module.ts
│   │   │   │   └── registry/
│   │   │   │       ├── tool-registry.service.ts → Register/get tools
│   │   │   │       └── tool.types.ts            → AgentTool interface
│   │   │   │
│   │   │   ├── permissions/           → Risk-level access control
│   │   │   │   ├── permissions.module.ts
│   │   │   │   ├── permission.service.ts → SAFE/CONFIRM/CRITICAL evaluation
│   │   │   │   ├── policy.service.ts     → Per-tool approval policy
│   │   │   │   └── risk.types.ts         → RiskLevel, PermissionDecision
│   │   │   │
│   │   │   ├── approvals/             → Human approval flow
│   │   │   │   ├── approvals.module.ts
│   │   │   │   ├── approvals.service.ts  → create, approve, reject, expiry
│   │   │   │   └── approvals.controller.ts → POST /approvals/:id/approve
│   │   │   │
│   │   │   ├── memory/                → Agent memory store
│   │   │   │   ├── memory.module.ts
│   │   │   │   └── memory.service.ts  → store, search, delete
│   │   │   │
│   │   │   ├── queues/                → BullMQ job queues
│   │   │   │   └── queues.module.ts   → 5 queues: agent, browser, desktop, email, notif
│   │   │   │
│   │   │   ├── realtime/              → WebSocket real-time events
│   │   │   │   ├── realtime.module.ts
│   │   │   │   ├── realtime.gateway.ts → Socket.io gateway (/realtime)
│   │   │   │   └── realtime.service.ts → Typed event emitters
│   │   │   │
│   │   │   ├── audit/                 → Audit logging
│   │   │   │   └── audit.service.ts
│   │   │   │
│   │   │   ├── integrations/          → External integrations (stub)
│   │   │   │   └── integrations.module.ts
│   │   │   │
│   │   │   └── health/                → Health check endpoint
│   │   │       ├── health.module.ts
│   │   │       └── health.controller.ts → GET /health
│   │   │
│   │   ├── tsconfig.json              ← CommonJS, paths for @devis/shared
│   │   ├── tsconfig.build.json        ← Includes shared package sources
│   │   ├── nest-cli.json
│   │   └── package.json
│   │
│   └── 📁 worker/                 ← BACKGROUND WORKER (BullMQ)
│       ├── src/
│       │   ├── main.ts
│       │   ├── worker.module.ts       → Registers all processors
│       │   └── processors/
│       │       ├── agent.processor.ts     → Runs AI agent jobs
│       │       ├── browser.processor.ts   → Playwright browser automation
│       │       ├── email.processor.ts     → Gmail integration
│       │       ├── desktop.processor.ts   → Desktop control
│       │       └── notification.processor.ts → Telegram alerts
│       └── package.json
│
├── 📁 packages/
│   ├── shared/                    ← SHARED TYPES (used by both api + web)
│   │   └── src/
│   │       ├── index.ts               → Barrel export
│   │       ├── enums/
│   │       │   ├── task-status.ts     → TaskStatus, TaskInputType, TaskPriority
│   │       │   ├── risk-level.ts      → RiskLevel (SAFE/CONFIRM/CRITICAL)
│   │       │   └── approval-status.ts → ApprovalStatus
│   │       ├── types/
│   │       │   ├── task.ts            → Task, TaskStep, ToolExecution interfaces
│   │       │   ├── user.ts            → User, UserProfile interfaces
│   │       │   ├── agent.ts           → AgentContext, AgentDecision, AgentToolCall
│   │       │   └── approval.ts        → Approval, ApprovalPayload interfaces
│   │       ├── constants/
│   │       │   └── index.ts           → Queue names, Redis keys, WS_EVENTS
│   │       └── schemas/
│   │           ├── task.schema.ts     → Zod schemas (stubs, fill in Phase 2)
│   │           └── tool.schema.ts     → Zod schemas (stubs, fill in Phase 6)
│   │
│   └── database/                  ← DATABASE PACKAGE (Prisma)
│       ├── prisma/
│       │   └── schema.prisma          → All 8 models + enums
│       └── src/index.ts               → Re-exports PrismaClient
│
├── 📁 infrastructure/
│   ├── docker/
│   │   ├── web.Dockerfile         ← Next.js production image
│   │   └── api.Dockerfile         ← NestJS production image
│   ├── nginx/
│   │   └── nginx.conf             ← Reverse proxy (/ → web, /api → api)
│   └── postgres/
│       └── init.sql               ← DB initialization
│
├── docker-compose.yml             ← PostgreSQL + Redis for local dev
├── pnpm-workspace.yaml            ← Declares apps/* and packages/*
├── package.json                   ← Root scripts
├── .env.example                   ← All required environment variables
└── GETTING_STARTED.md             ← This file 📄
```

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Create new account |
| POST | `/api/v1/auth/login` | No | Login → get JWT tokens |
| GET | `/api/v1/users/me` | JWT | Get current user |
| POST | `/api/v1/tasks` | JWT | Create a new task |
| GET | `/api/v1/tasks` | JWT | List all my tasks |
| GET | `/api/v1/tasks/:id` | JWT | Get task details + steps |
| POST | `/api/v1/tasks/:id/cancel` | JWT | Cancel a task |
| GET | `/api/v1/approvals/:id` | JWT | Get approval details |
| POST | `/api/v1/approvals/:id/approve` | JWT | Approve an action |
| POST | `/api/v1/approvals/:id/reject` | JWT | Reject an action |
| GET | `/health` | No | Health check (DB ping) |

Full interactive docs: **http://localhost:3001/api/docs**

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| `User` | Account with email + hashed password |
| `Task` | A user's AI request (text or voice) |
| `TaskStep` | Individual step in task execution |
| `ToolExecution` | Record of each tool call |
| `Approval` | Pending/approved/rejected action |
| `Memory` | Agent's persistent memory per user |
| `Integration` | OAuth tokens (Gmail, Calendar, etc.) |
| `AuditLog` | Full audit trail of all actions |

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_HOST` | No | Redis host (default: localhost) |
| `REDIS_PORT` | No | Redis port (default: 6379) |
| `JWT_SECRET` | ✅ | JWT access token secret |
| `JWT_REFRESH_SECRET` | ✅ | JWT refresh token secret |
| `JWT_EXPIRES_IN` | No | Access token TTL (default: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token TTL (default: 7d) |
| `AI_PROVIDER` | No | `gemini` or `openai` (default: gemini) |
| `GEMINI_API_KEY` | If using Gemini | Get from aistudio.google.com |
| `OPENAI_API_KEY` | If using OpenAI | Get from platform.openai.com |
| `TELEGRAM_BOT_TOKEN` | No | For approval notifications |
| `FRONTEND_URL` | No | CORS allowed origin (default: http://localhost:3000) |
| `PORT` | No | API port (default: 3001) |

---

## 🚦 Development Workflow

1. Create a task via `POST /api/v1/tasks` → get `taskId`
2. Agent runs in background (BullMQ worker processes the job)
3. Real-time updates via **WebSocket** at `ws://localhost:3001/realtime`
4. If a tool needs approval → status becomes `WAITING_APPROVAL`
5. Call `POST /api/v1/approvals/:id/approve` to unblock
6. Task completes → status becomes `COMPLETED`

---

## 🧠 AI Provider Setup

### Google Gemini (default)
1. Go to https://aistudio.google.com
2. Create an API key
3. Set `GEMINI_API_KEY=your-key` in `.env`
4. Set `AI_PROVIDER=gemini`

### OpenAI GPT-4o
1. Go to https://platform.openai.com
2. Create an API key
3. Set `OPENAI_API_KEY=your-key` in `.env`
4. Set `AI_PROVIDER=openai`

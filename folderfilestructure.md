# DEVIS AI — Folder & File Structure

> Production-oriented monorepo structure for DEVIS AI  
> Backend: NestJS + TypeScript  
> Frontend: Next.js + TypeScript  
> Database: PostgreSQL + Prisma  
> Cache/Queue: Redis + BullMQ  
> AI: Provider-based AI architecture  
> Browser Automation: Playwright  
> Realtime: SSE/WebSocket  
> Infrastructure: Docker + AWS

---

# 1. Root Structure

```text
devis-ai/
│
├── apps/
│   ├── web/                         # Next.js frontend
│   ├── api/                         # NestJS REST API
│   └── worker/                      # Background job workers
│
├── packages/
│   ├── shared/                      # Shared types, enums, schemas
│   ├── database/                    # Prisma + PostgreSQL
│   └── config/                      # Shared configuration
│
├── infrastructure/
│   ├── docker/                      # Dockerfiles
│   ├── nginx/                       # Reverse proxy
│   └── postgres/                    # PostgreSQL configuration
│
├── docs/
│   ├── architecture.md
│   ├── sd.md
│   ├── api.md
│   ├── database.md
│   └── development.md
│
├── scripts/
│   ├── setup.ts
│   └── seed.ts
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── README.md
```

---

# 2. Applications

```text
apps/
│
├── web/
├── api/
└── worker/
```

The three applications have different responsibilities.

```text
Web
 ↓
User Interface

API
 ↓
Business Logic + REST API

Worker
 ↓
Long-running / asynchronous tasks
```

---

# 3. Frontend — Next.js

```text
apps/web/
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [taskId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── approvals/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── memory/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── integrations/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   │
│   │   ├── ui/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── task-summary.tsx
│   │   │   └── activity-feed.tsx
│   │   │
│   │   ├── tasks/
│   │   │   ├── task-card.tsx
│   │   │   ├── task-status.tsx
│   │   │   ├── task-step.tsx
│   │   │   └── task-timeline.tsx
│   │   │
│   │   ├── approvals/
│   │   │   ├── approval-card.tsx
│   │   │   └── approval-dialog.tsx
│   │   │
│   │   ├── voice/
│   │   │   ├── voice-button.tsx
│   │   │   ├── voice-recorder.tsx
│   │   │   └── waveform.tsx
│   │   │
│   │   └── integrations/
│   │       ├── integration-card.tsx
│   │       └── integration-form.tsx
│   │
│   ├── hooks/
│   │   ├── use-task.ts
│   │   ├── use-tasks.ts
│   │   ├── use-approval.ts
│   │   ├── use-voice.ts
│   │   └── use-realtime.ts
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── websocket.ts
│   │   └── utils.ts
│   │
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   └── auth-provider.tsx
│   │
│   ├── types/
│   │   ├── task.ts
│   │   ├── user.ts
│   │   ├── approval.ts
│   │   └── api.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── icons/
│   └── images/
│
├── .env.local
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

# 4. Frontend Responsibilities

## `app/`

Next.js routes and pages.

Example:

```text
/dashboard
/tasks
/tasks/:taskId
/approvals
/memory
/integrations
/settings
```

---

## `components/`

Reusable UI components.

Example:

```text
TaskCard
TaskTimeline
ApprovalCard
VoiceButton
DashboardHeader
```

---

## `hooks/`

Frontend business hooks.

Example:

```typescript
useTasks()
useTask()
useApproval()
useRealtime()
useVoice()
```

---

## `lib/api.ts`

Central API client.

```text
Frontend
   ↓
lib/api.ts
   ↓
NestJS API
```

---

# 5. Backend — NestJS

```text
apps/api/
│
├── src/
│   │
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── pipes/
│   │   ├── constants/
│   │   ├── enums/
│   │   └── logger/
│   │
│   ├── config/
│   │   ├── configuration.ts
│   │   └── validation.ts
│   │
│   ├── database/
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   └── dto/
│   │
│   ├── tasks/
│   │   ├── tasks.module.ts
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── tasks.repository.ts
│   │   ├── dto/
│   │   │   ├── create-task.dto.ts
│   │   │   └── update-task.dto.ts
│   │   └── types/
│   │
│   ├── agent/
│   │   ├── agent.module.ts
│   │   ├── agent.service.ts
│   │   ├── planner.service.ts
│   │   ├── executor.service.ts
│   │   ├── context.service.ts
│   │   └── types/
│   │
│   ├── ai/
│   │   ├── ai.module.ts
│   │   ├── ai.service.ts
│   │   ├── interfaces/
│   │   │   └── ai-provider.interface.ts
│   │   ├── providers/
│   │   │   ├── gemini.provider.ts
│   │   │   ├── openai.provider.ts
│   │   │   └── local.provider.ts
│   │   └── schemas/
│   │       ├── agent-plan.schema.ts
│   │       └── tool-call.schema.ts
│   │
│   ├── tools/
│   │   ├── tools.module.ts
│   │   │
│   │   ├── registry/
│   │   │   ├── tool-registry.service.ts
│   │   │   └── tool.types.ts
│   │   │
│   │   ├── browser/
│   │   │   ├── browser.tool.ts
│   │   │   ├── browser.service.ts
│   │   │   └── playwright.service.ts
│   │   │
│   │   ├── youtube/
│   │   │   └── youtube.tool.ts
│   │   │
│   │   ├── web-search/
│   │   │   └── web-search.tool.ts
│   │   │
│   │   ├── files/
│   │   │   ├── file.tool.ts
│   │   │   └── file.service.ts
│   │   │
│   │   ├── email/
│   │   │   ├── email.tool.ts
│   │   │   └── email.service.ts
│   │   │
│   │   ├── calendar/
│   │   │   ├── calendar.tool.ts
│   │   │   └── calendar.service.ts
│   │   │
│   │   └── desktop/
│   │       ├── desktop.tool.ts
│   │       └── desktop.service.ts
│   │
│   ├── permissions/
│   │   ├── permissions.module.ts
│   │   ├── permission.service.ts
│   │   ├── policy.service.ts
│   │   └── risk.types.ts
│   │
│   ├── approvals/
│   │   ├── approvals.module.ts
│   │   ├── approvals.controller.ts
│   │   ├── approvals.service.ts
│   │   └── telegram/
│   │       └── telegram.service.ts
│   │
│   ├── memory/
│   │   ├── memory.module.ts
│   │   ├── memory.service.ts
│   │   ├── embedding.service.ts
│   │   └── retrieval.service.ts
│   │
│   ├── integrations/
│   │   ├── integrations.module.ts
│   │   ├── gmail/
│   │   ├── telegram/
│   │   └── google/
│   │
│   ├── queues/
│   │   ├── queues.module.ts
│   │   ├── agent.queue.ts
│   │   ├── browser.queue.ts
│   │   └── notification.queue.ts
│   │
│   ├── realtime/
│   │   ├── realtime.module.ts
│   │   ├── realtime.gateway.ts
│   │   └── realtime.service.ts
│   │
│   ├── audit/
│   │   ├── audit.module.ts
│   │   └── audit.service.ts
│   │
│   └── health/
│       ├── health.module.ts
│       └── health.controller.ts
│
├── test/
│   ├── auth.e2e-spec.ts
│   ├── tasks.e2e-spec.ts
│   └── agent.e2e-spec.ts
│
├── package.json
└── tsconfig.json
```

---

# 6. Backend Module Responsibilities

## Auth

```text
auth/
```

Responsible for:

```text
Registration
Login
JWT
Refresh token
Password hashing
Authentication guards
```

---

## Users

```text
users/
```

Responsible for:

```text
User profile
User preferences
User settings
User permissions
```

---

## Tasks

```text
tasks/
```

Core DEVIS task management.

Example:

```text
Create Task
Get Task
Update Task
Cancel Task
Task History
Task Steps
```

---

# 7. Agent Module

```text
agent/
```

This is the brain orchestration layer.

```text
AgentService
      │
      ├── ContextService
      │
      ├── PlannerService
      │
      └── ExecutorService
```

Flow:

```text
User Request
      ↓
AgentService
      ↓
Context
      ↓
Planner
      ↓
AI
      ↓
Plan
      ↓
Executor
      ↓
Tool
```

---

# 8. AI Module

```text
ai/
```

Never call an AI provider directly from the Agent.

Use:

```typescript
interface AIProvider {
  generatePlan(): Promise<AgentPlan>;
  executeToolCall(): Promise<ToolCall>;
}
```

Architecture:

```text
Agent
  ↓
AIService
  ↓
AIProvider
  ↓
Gemini/OpenAI/Local Model
```

This makes the AI provider replaceable.

---

# 9. Tools Module

```text
tools/
```

Every external capability should be a tool.

Example:

```text
open_browser
search_youtube
search_web
read_file
send_email
create_calendar_event
```

Architecture:

```text
AI
 ↓
Tool Registry
 ↓
Tool
 ↓
Permission Engine
 ↓
Execution
```

---

# 10. Tool Registry

```text
tools/registry/
```

The registry maintains available tools.

Example:

```typescript
ToolDefinition {
  name
  description
  inputSchema
  riskLevel
  execute()
}
```

Example:

```text
search_youtube
     ↓
SAFE
     ↓
Execute
```

But:

```text
send_email
     ↓
HIGH RISK
     ↓
Approval Required
```

---

# 11. Permission Module

```text
permissions/
```

Responsibilities:

```text
Risk classification
User permissions
Tool policies
Approval requirements
Execution authorization
```

Flow:

```text
Tool Request
     ↓
PermissionService
     ↓
┌───────────────┐
│ Risk Level    │
└───────────────┘
     ↓
 SAFE ───────────→ Execute
     │
 HIGH/CRITICAL
     ↓
 Approval
```

---

# 12. Approval Module

```text
approvals/
```

Responsible for:

```text
Create approval
Approve
Reject
Expire
Cancel
Notify user
```

Flow:

```text
Agent
 ↓
Tool Request
 ↓
Approval Required
 ↓
Approval DB
 ↓
Telegram
 ↓
User
 ↓
Approve / Reject
```

---

# 13. Memory Module

```text
memory/
```

Responsibilities:

```text
Store memories
Generate embeddings
Search memories
Retrieve context
Delete memories
```

Architecture:

```text
User
 ↓
Conversation
 ↓
MemoryService
 ↓
PostgreSQL
 ↓
pgvector
```

Start with normal PostgreSQL storage.

Add vector search later.

---

# 14. Queue Module

```text
queues/
```

Queues:

```text
agent.queue.ts
browser.queue.ts
notification.queue.ts
```

Architecture:

```text
NestJS API
     ↓
 BullMQ
     ↓
   Redis
     ↓
 Worker
```

---

# 15. Worker Structure

```text
apps/worker/
│
├── src/
│   ├── main.ts
│   ├── worker.module.ts
│   │
│   ├── processors/
│   │   ├── agent.processor.ts
│   │   ├── browser.processor.ts
│   │   ├── email.processor.ts
│   │   ├── desktop.processor.ts
│   │   └── notification.processor.ts
│   │
│   └── config/
│
├── package.json
└── tsconfig.json
```

Workers handle operations that may take seconds/minutes.

---

# 16. Worker Flow

```text
API
 ↓
Create Task
 ↓
Queue Job
 ↓
Redis
 ↓
Worker
 ↓
Processor
 ↓
Service
 ↓
External System
```

Example:

```text
Browser Queue
     ↓
Browser Processor
     ↓
Playwright Service
     ↓
Chromium
```

---

# 17. Shared Package

```text
packages/shared/
│
├── src/
│   ├── types/
│   │   ├── task.ts
│   │   ├── user.ts
│   │   ├── agent.ts
│   │   └── approval.ts
│   │
│   ├── enums/
│   │   ├── task-status.ts
│   │   ├── risk-level.ts
│   │   └── approval-status.ts
│   │
│   ├── schemas/
│   │   ├── task.schema.ts
│   │   └── tool.schema.ts
│   │
│   └── constants/
│
└── package.json
```

Used by:

```text
Next.js
NestJS
Worker
```

---

# 18. Database Package

```text
packages/database/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   └── index.ts
│
└── package.json
```

Main database:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

---

# 19. Main Database Entities

```text
User
 │
 ├── Task
 │     │
 │     ├── TaskStep
 │     │       │
 │     │       └── ToolExecution
 │     │
 │     └── Approval
 │
 ├── Memory
 │
 ├── Integration
 │
 └── AuditLog
```

---

# 20. Infrastructure

```text
infrastructure/
│
├── docker/
│   ├── web.Dockerfile
│   ├── api.Dockerfile
│   └── worker.Dockerfile
│
├── nginx/
│   └── nginx.conf
│
└── postgres/
    └── init.sql
```

---

# 21. Docker Services

Development:

```text
docker-compose.yml
```

Services:

```text
postgres
redis
```

Later:

```text
postgres
redis
rabbitmq
api
worker
web
nginx
```

Architecture:

```text
                    Nginx
                      │
             ┌────────┴────────┐
             ↓                 ↓
          Next.js           NestJS
                               │
                  ┌────────────┼─────────────┐
                  ↓            ↓             ↓
              PostgreSQL     Redis        External APIs
                               │
                               ↓
                            Workers
```

---

# 22. Documentation

```text
docs/
│
├── architecture.md
├── sd.md
├── api.md
├── database.md
└── development.md
```

### `architecture.md`

Contains:

```text
High-level architecture
Component architecture
Agent architecture
Tool architecture
Queue architecture
Approval architecture
Deployment architecture
Flow diagrams
```

### `sd.md`

Contains:

```text
Functional requirements
Non-functional requirements
Scalability
Availability
Reliability
Security
Database design
Caching
Queues
Rate limiting
Observability
Failure handling
System-design decisions
```

### `api.md`

Contains:

```text
Authentication APIs
Task APIs
Approval APIs
Memory APIs
Integration APIs
Realtime events
```

### `database.md`

Contains:

```text
ER diagram
Tables
Indexes
Relationships
Constraints
Transactions
Migration strategy
```

---

# 23. Complete Runtime Architecture

```text
                         USER
                           │
                           ▼
                    ┌─────────────┐
                    │  Next.js    │
                    │     Web     │
                    └──────┬──────┘
                           │
                    REST / SSE
                           │
                           ▼
                    ┌─────────────┐
                    │   NestJS    │
                    │     API     │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
        PostgreSQL       Redis         AI Service
            │              │              │
            │              │              ▼
            │              │          AI Provider
            │              │
            │              ▼
            │           BullMQ
            │              │
            │              ▼
            │          ┌────────┐
            │          │ Worker │
            │          └───┬────┘
            │              │
            │       ┌──────┼───────┐
            │       │      │       │
            │       ▼      ▼       ▼
            │   Playwright Email Calendar
            │
            ▼
        Task State
```

---

# 24. Agent Execution Flow

```text
User Request
     │
     ▼
Create Task
     │
     ▼
Task Queue
     │
     ▼
Agent Worker
     │
     ▼
Load Context
     │
     ▼
Retrieve Memory
     │
     ▼
AI Planner
     │
     ▼
Generate Plan
     │
     ▼
Tool Selection
     │
     ▼
Permission Check
     │
     ├──────────── SAFE ──────────────┐
     │                                ▼
     │                            Execute Tool
     │                                │
     │                                ▼
     │                            Next Step
     │
     └────── APPROVAL REQUIRED
                      │
                      ▼
                 Create Approval
                      │
                      ▼
                   Telegram
                      │
                ┌─────┴─────┐
                ▼           ▼
             Approve      Reject
                │           │
                ▼           ▼
             Execute      Stop
```

---

# 25. Recommended API Structure

```text
/api/v1
```

Routes:

```text
/api/v1/auth
/api/v1/users
/api/v1/tasks
/api/v1/tasks/:id
/api/v1/tasks/:id/cancel

/api/v1/approvals
/api/v1/approvals/:id/approve
/api/v1/approvals/:id/reject

/api/v1/memory
/api/v1/integrations

/api/v1/health
```

---

# 26. Realtime Events

Use REST for normal request/response operations.

Use SSE/WebSocket for task progress.

```text
REST
 ↓
Create task

SSE/WebSocket
 ↓
task.created
task.started
task.step.started
tool.started
tool.completed
approval.required
task.completed
task.failed
```

---

# 27. Development Architecture

Start simple:

```text
Next.js
   ↓
NestJS Modular Monolith
   ↓
PostgreSQL
   +
Redis
```

Then evolve:

```text
Next.js
   ↓
NestJS API
   ↓
BullMQ
   ↓
Workers
```

Then:

```text
API
 │
 ├── Agent Worker
 ├── Browser Worker
 ├── Email Worker
 ├── Notification Worker
 └── Desktop Worker
```

Only introduce RabbitMQ/microservices when there is an actual scaling or isolation requirement.

---

# 28. Recommended Build Order

```text
01. Repository setup
02. pnpm monorepo
03. Next.js
04. NestJS
05. Docker
06. PostgreSQL
07. Prisma
08. Redis
09. Authentication
10. User module
11. Task module
12. BullMQ
13. Worker
14. AI provider abstraction
15. Gemini/OpenAI integration
16. Agent module
17. Tool registry
18. First browser tool
19. Playwright
20. Permission engine
21. Approval system
22. Telegram approval
23. Realtime events
24. Next.js dashboard
25. Email integration
26. Calendar integration
27. Voice/STT
28. Memory
29. pgvector
30. Desktop agent
31. Docker production setup
32. CI/CD
33. AWS deployment
34. Monitoring
35. Load testing
```

---

# 29. Final Principle

The architecture should evolve like this:

```text
                PHASE 1
                   │
                   ▼
        Modular Monolith
                   │
          ┌────────┴────────┐
          │                 │
       NestJS            PostgreSQL
          │
        Redis
          │
        Worker
                   │
                   ▼
                PHASE 2
                   │
                   ▼
          Specialized Workers
                   │
          ┌────────┼─────────┐
          ▼        ▼         ▼
       Agent    Browser    Email
                   │
                   ▼
                PHASE 3
                   │
                   ▼
       Independently scalable
            services/workers
                   │
                   ▼
                PHASE 4
                   │
                   ▼
        Production distributed
             architecture
```

**Do not start with microservices.**

Start with a well-designed NestJS modular monolith, Redis/BullMQ workers, PostgreSQL, and clean interfaces. Then split components only when the system actually needs independent scaling or deployment.
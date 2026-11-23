# DEVIS AI — Architecture

## 1. Architecture Style

DEVIS should begin as a **modular monolith + workers**.

```text
                    ┌─────────────────────┐
                    │      Next.js        │
                    │ Dashboard + Voice   │
                    └──────────┬──────────┘
                               │ HTTPS/REST
                               ▼
                    ┌─────────────────────┐
                    │     NestJS API      │
                    │   Modular Monolith  │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼─────────────────────┐
          ▼                    ▼                     ▼
    Agent Module         Task Module          Approval Module
          │                    │                     │
          ▼                    ▼                     ▼
     AI Provider          PostgreSQL            Telegram
          │
          ▼
    Tool Registry
          │
   ┌──────┼─────────┬─────────┬──────────┐
   ▼      ▼         ▼         ▼          ▼
Browser  Files    Email     Desktop    Calendar
Worker   Worker   Worker     Worker      Worker
   │
   └───────────────┬─────────────────────┘
                   ▼
             Redis + BullMQ
```

---

# 2. Request Flow

## Text Command

```text
Browser
  │
  │ POST /api/v1/tasks
  ▼
NestJS
  │
  ├── AuthGuard
  ├── ValidationPipe
  ├── TaskService
  └── Queue task
          │
          ▼
      Agent Worker
          │
          ▼
      AgentService
          │
          ▼
       AIProvider
          │
          ▼
   Structured Tool Call
          │
          ▼
     Tool Registry
          │
          ▼
   Permission Engine
          │
      ┌───┴────┐
      │        │
     SAFE    APPROVAL
      │        │
      │      Telegram
      │        │
      │    APPROVE/REJECT
      │        │
      └───┬────┘
          ▼
     Tool Worker
          │
          ▼
     Tool Result
          │
          ▼
     Agent Loop
          │
      ┌───┴────┐
      │        │
   Continue   Finish
      │        │
      └──→     ▼
          Final Result
```

---

# 3. Voice Flow

```text
Microphone
   ↓
Audio capture
   ↓
STT Provider
   ↓
Transcript
   ↓
POST /tasks
   ↓
Agent
   ↓
Tool execution
   ↓
Final response
   ↓
TTS
   ↓
Speaker
```

MVP should use push-to-talk.

---

# 4. Agent Loop

```text
                 ┌──────────────────┐
                 │ User instruction │
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │ Context Builder  │
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │   LLM Planner    │
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │ Validate output  │
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │ Select tool      │
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │ Permission check │
                 └────────┬─────────┘
                          ▼
                    Approval?
                    /       \
                  YES        NO
                   │          │
                   ▼          ▼
              Wait for      Execute
              approval        │
                   │          │
              approved?       │
               /    \         │
             YES    NO        │
              │      │        │
              └──┐   └─→ End │
                 │            │
                 └─────┬──────┘
                       ▼
                 Tool execution
                       │
                       ▼
                 Save result
                       │
                       ▼
               More work needed?
                  /          \
                YES           NO
                 │             │
                 └────→ LLM    ▼
                       Final answer
```

---

# 5. NestJS Module Architecture

```text
apps/api/src/
├── main.ts
├── app.module.ts
│
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── decorators/
│   ├── pipes/
│   └── logger/
│
├── config/
│
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── guards/
│
├── users/
│
├── tasks/
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── tasks.repository.ts
│   ├── dto/
│   └── entities/
│
├── agent/
│   ├── agent.module.ts
│   ├── agent.service.ts
│   ├── planner.service.ts
│   ├── executor.service.ts
│   ├── context.service.ts
│   └── agent.types.ts
│
├── ai/
│   ├── ai.module.ts
│   ├── ai.service.ts
│   ├── interfaces/
│   ├── providers/
│   └── schemas/
│
├── tools/
│   ├── tools.module.ts
│   ├── registry/
│   ├── browser/
│   ├── files/
│   ├── email/
│   ├── calendar/
│   └── desktop/
│
├── permissions/
│   ├── permission.module.ts
│   ├── permission.service.ts
│   ├── policy.service.ts
│   └── risk.types.ts
│
├── approvals/
│   ├── approvals.controller.ts
│   ├── approvals.service.ts
│   └── telegram/
│
├── memory/
│
├── integrations/
│
├── queues/
│
└── audit/
```

---

# 6. Next.js Architecture

```text
apps/web/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── tasks/
│   ├── approvals/
│   ├── memory/
│   ├── integrations/
│   └── settings/
│
├── components/
│   ├── voice/
│   ├── tasks/
│   ├── approvals/
│   └── ui/
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── websocket.ts
│
├── hooks/
└── types/
```

---

# 7. Shared Package

Use shared TypeScript types:

```text
packages/shared/
├── types/
│   ├── task.ts
│   ├── agent.ts
│   ├── tool.ts
│   └── approval.ts
├── schemas/
│   ├── task.schema.ts
│   └── tool.schema.ts
└── constants/
```

This prevents the frontend and backend from inventing different representations.

---

# 8. Tool Architecture

Every tool follows:

```text
Tool Definition
       ↓
Schema
       ↓
Permission metadata
       ↓
Executor
       ↓
Result
```

Example conceptual interface:

```ts
interface AgentTool<TInput, TResult> {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  inputSchema: unknown;

  execute(
    input: TInput,
    context: ToolContext
  ): Promise<TResult>;
}
```

---

# 9. Tool Registry

```text
ToolRegistry
   │
   ├── open_browser
   ├── open_app
   ├── search_web
   ├── search_youtube
   ├── search_files
   ├── open_file
   ├── create_email_draft
   ├── send_email
   ├── create_calendar_event
   └── search_products
```

The LLM only receives tools that are available to the current user/task.

---

# 10. Permission Architecture

```text
Tool Call
   ↓
PermissionService
   ↓
Tool risk level
   ↓
User policy
   ↓
Decision
 ┌─┼──────────────┐
 ▼ ▼              ▼
ALLOW CONFIRM   DENY
 │     │          │
 │     ▼          └→ Audit
 │  Approval
 │     │
 │  Telegram/Web
 │     │
 │  Approve
 │     │
 └─────┴────→ Execute
```

Important:

**Approval is not just a UI button.**

The backend must verify:

```text
approval belongs to task
task belongs to current user
approval is not expired
approval is for exact tool + exact payload
approval has not already been consumed
```

---

# 11. Exact Approval Payload

When requesting approval, create a snapshot:

```json
{
  "tool": "send_email",
  "arguments": {
    "to": "example@example.com",
    "subject": "Project Update",
    "body": "..."
  }
}
```

If the payload changes after approval, the old approval becomes invalid.

This prevents:

```text
Approve Email A
      ↓
Server secretly executes Email B
```

---

# 12. Task State Machine

```text
CREATED
   ↓
QUEUED
   ↓
PLANNING
   ↓
WAITING_APPROVAL ─────→ REJECTED
   ↓
EXECUTING
   ↓
┌──┴─────────────┐
▼                ▼
COMPLETED       FAILED
                   │
                   ▼
                 RETRY
                   │
                   ▼
                EXECUTING
```

Cancellation:

```text
CREATED
QUEUED
PLANNING
WAITING_APPROVAL
EXECUTING
```

can transition to:

```text
CANCELLED
```

subject to the worker's ability to safely stop.

---

# 13. Idempotency

Critical actions must be idempotent.

Example:

```text
send_email
purchase_product
create_calendar_event
```

Use:

```text
idempotency_key
```

Example:

```text
taskId + stepId
```

Before executing:

```text
Does this execution already exist as SUCCESS?
        │
       YES → return stored result
        │
       NO  → execute
```

---

# 14. Redis Architecture

```text
                    Redis
                      │
       ┌──────────────┼───────────────┐
       ▼              ▼               ▼
    BullMQ          Cache          Locks
       │
       ├── agent
       ├── browser
       ├── desktop
       ├── email
       └── notification
```

---

# 15. Worker Architecture

```text
NestJS API
   │
   ▼
BullMQ
   │
   ├─────────────┬──────────────┬──────────────┐
   ▼             ▼              ▼              ▼
Agent Worker Browser Worker Email Worker Desktop Worker
```

Start with one worker application if desired:

```text
apps/worker
```

Split into multiple deployable workers only later.

---

# 16. RabbitMQ Future Architecture

When multiple independent services are needed:

```text
                   RabbitMQ
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
Agent Service   Browser Service   Notification Service
      │               │                │
      ▼               ▼                ▼
 PostgreSQL         Browser         Telegram
```

Events:

```text
task.created
task.started
tool.requested
tool.completed
approval.required
approval.approved
approval.rejected
task.completed
task.failed
```

---

# 17. Database Relationship

```text
User
 │
 ├───────────────┐
 ▼               ▼
Tasks          Memories
 │
 ├───────┐
 ▼       ▼
Steps   Approvals
 │
 ▼
Tool Executions
 │
 ▼
Audit Logs
```

---

# 18. AI Context

Context should be assembled from:

```text
System policy
+
Current user request
+
Current task state
+
Previous tool results
+
Relevant memory
+
Available tools
```

Do not send the entire database history to the LLM.

Use:

```text
short-term context
+
relevant retrieved memory
```

---

# 19. Memory Pipeline

```text
Task completed
      ↓
Extract useful memory
      ↓
Classify
      ↓
Should store?
   /       \
 YES       NO
  │         │
  ▼         └→ discard
Embedding
  ↓
PostgreSQL + pgvector
```

Retrieval:

```text
New task
  ↓
Create embedding
  ↓
Vector similarity search
  ↓
Top relevant memories
  ↓
Context Builder
  ↓
LLM
```

---

# 20. Browser Safety

Use browser context isolation.

```text
Task
 ↓
BrowserContext
 ↓
Allowed domains
 ↓
Playwright
```

Avoid giving the agent unrestricted access to all logged-in websites.

Sensitive domains should have stricter policies.

---

# 21. Desktop Safety

Never expose:

```text
run_any_command(command)
```

Instead expose:

```text
open_application("vscode")
open_file(fileId)
search_files(query)
take_screenshot()
```

If shell access is ever introduced:

```text
allowlist
+
sandbox
+
approval
+
timeout
+
audit
```

---

# 22. Deployment Architecture

MVP:

```text
Internet
   ↓
Nginx
   ↓
Next.js
   ↓
NestJS API
   │
   ├── PostgreSQL
   ├── Redis
   └── Worker
```

Production evolution:

```text
                    Load Balancer
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          Next.js CDN           API Instances
                                    │
                         ┌──────────┼─────────┐
                         ▼          ▼         ▼
                       Redis    PostgreSQL  RabbitMQ
                         │
                  ┌──────┼──────┐
                  ▼      ▼      ▼
                Agent Browser Desktop
                Workers Workers Workers
```

---

# 23. Failure Handling

Every external integration can fail.

```text
LLM timeout
Browser crash
Telegram unavailable
Gmail API error
Redis unavailable
PostgreSQL unavailable
Network failure
```

Use:

```text
timeout
retry with backoff
dead-letter queue
circuit breaker where appropriate
idempotency
audit logs
```

Never blindly retry a non-idempotent critical action.

---

# 24. Architecture Evolution

### Stage 1

```text
Next.js
   ↓
NestJS
   ↓
PostgreSQL + Redis
```

### Stage 2

```text
NestJS
 ↓
BullMQ
 ↓
Worker
```

### Stage 3

```text
API
 ↓
Agent Worker
 ↓
Tool Workers
```

### Stage 4

```text
API Gateway
 ↓
Microservices
 ↓
RabbitMQ
```

Do not skip directly to Stage 4.

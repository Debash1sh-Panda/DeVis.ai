# DEVIS AI — Personal Voice & Computer Agent

> A personal AI agent that listens to natural-language/voice commands, plans tasks with an LLM, executes only approved tools, automates the browser/desktop, and asks for confirmation before sensitive actions.

This project is based on the original DEVIS concept: voice input → AI planner → controlled tools → browser/computer/email integrations → approval → execution. The original design specifically identifies capabilities such as opening YouTube, searching products, drafting email, finding files, planning schedules, and later adding approval, memory, wake-word and autonomous execution. fileciteturn0file0L9-L15

---

## 1. Project Vision

DEVIS should eventually feel like a small personal version of Siri/Google Assistant, but with a much stronger **task/agent architecture**.

Example:

> "Hey Devis, find me a mechanical keyboard under ₹3,000, compare the best options and send the top 3 to Telegram."

The system should:

1. Convert speech to text.
2. Understand the user's goal.
3. Create a structured execution plan.
4. Select safe tools.
5. Execute browser/API/desktop actions.
6. Collect results.
7. Ask for approval if the action is sensitive.
8. Execute the approved action.
9. Store useful task history/memory.
10. Return a human-friendly result.

The important architectural principle is:

> **The LLM never gets unrestricted control of the computer. It can only request registered tools with validated arguments.**

The original design also recommends controlled tools such as `openBrowser`, `searchWeb`, `searchFiles`, `openFile`, `openApplication`, `createEmail`, and `askApproval`. fileciteturn0file0L434-L477

---

# 2. Recommended Production-Learning Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- WebSocket/SSE for live task updates

The frontend is primarily a **dashboard/control center**, not the actual desktop automation engine.

## Backend

- Node.js
- TypeScript
- NestJS
- REST API
- WebSocket gateway
- Prisma ORM

## Database

- PostgreSQL
- Prisma
- pgvector later for semantic memory

## Cache / Coordination

- Redis
- BullMQ for background jobs

## Messaging

- RabbitMQ later, when the system grows into multiple services.

For the first version, **BullMQ + Redis is enough**. Do not introduce RabbitMQ before you actually need service-to-service messaging.

## AI

Use an LLM provider behind an internal `AIProvider` interface.

Recommended abstraction:

```text
AIProvider
 ├── GeminiProvider
 ├── OpenAIProvider
 └── LocalProvider (future)
```

This prevents your business logic from depending directly on one model provider.

The original prototype recommendation was Gemini because it was intended to be easy to test from Node.js and suitable for structured tool-calling workflows. fileciteturn0file0L714-L730

## Browser Automation

- Playwright
- Chromium

## Desktop Automation

Create a separate `DesktopAgent`/worker layer.

Potential responsibilities:

- Open applications
- Open files
- Keyboard actions
- Mouse actions
- Screenshots
- Screen inspection

Do **not** allow arbitrary shell execution from an LLM-generated command.

## Voice

MVP:

```text
Microphone
   ↓
Speech-to-Text
   ↓
NestJS
   ↓
AI Agent
```

Later:

```text
Wake word
   ↓
Streaming STT
   ↓
Agent
   ↓
TTS
```

Start with push-to-talk instead of wake-word detection. This matches the original MVP recommendation. fileciteturn0file0L856-L883

## Approval

- Telegram Bot initially
- Web approval UI later
- WhatsApp can be considered later

Approval should be treated as a security boundary.

---

# 3. REST vs GraphQL — Decision

## Use REST for this project.

### Why REST?

DEVIS is fundamentally an **action/task execution system**, not a highly relational content graph.

Typical operations are:

```text
POST /api/v1/tasks
GET  /api/v1/tasks/:id
POST /api/v1/tasks/:id/cancel
POST /api/v1/approvals/:id/approve
POST /api/v1/approvals/:id/reject
GET  /api/v1/tasks/:id/events
POST /api/v1/voice/transcriptions
GET  /api/v1/memory
```

REST gives you:

- Simple NestJS implementation
- Easy authentication/authorization
- Easy API testing
- Clear HTTP semantics
- Easier background-job integration
- Easier mobile/desktop integration later
- Better fit for commands and state transitions

### Where GraphQL could help

GraphQL is useful if the dashboard later needs highly flexible queries over:

```text
tasks
agents
tools
memories
executions
approvals
analytics
```

But GraphQL would add complexity without solving your primary problem.

### Final decision

```text
DEVIS API       → REST
Live updates    → WebSocket/SSE
Internal events → RabbitMQ (later)
Background jobs → BullMQ + Redis
```

---

# 4. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │       USER          │
                         │ Voice / Text        │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   Next.js Dashboard │
                         │ Voice / Tasks /     │
                         │ Approvals / Memory  │
                         └──────────┬──────────┘
                                    │ REST
                                    ▼
                         ┌─────────────────────┐
                         │     API Gateway     │
                         │       NestJS        │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │    Agent Service    │
                         │ Planner + Executor  │
                         └───────┬───────┬─────┘
                                 │       │
                         ┌───────▼─┐   ┌─▼──────────┐
                         │AI Model │   │ Permission │
                         │Provider │   │   Engine   │
                         └───────┬─┘   └─────┬──────┘
                                 │           │
                         ┌───────▼───────────▼─────┐
                         │       Tool Registry     │
                         └────┬────┬────┬────┬─────┘
                              │    │    │    │
                    ┌─────────▼┐ ┌─▼──┐ ┌─▼────┐ ┌─────────▼──┐
                    │Playwright│ │File│ │Email │ │Desktop     │
                    │Browser   │ │Tool│ │Tool  │ │Controller  │
                    └──────────┘ └────┘ └──────┘ └────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Job / Event Layer │
                    │ Redis + BullMQ    │
                    │ RabbitMQ later    │
                    └─────────┬─────────┘
                              │
             ┌────────────────▼────────────────┐
             │ PostgreSQL + pgvector (later) │
             └─────────────────────────────────┘

                    Approval boundary
                           │
                    ┌──────▼───────┐
                    │ Telegram Bot │
                    └──────────────┘
```

---

# 5. Core Modules

## 5.1 API Module

Responsible for:

- Authentication
- Task creation
- Task status
- Approval endpoints
- Voice upload/transcription requests
- Task history
- Memory APIs

## 5.2 Agent Module

Responsible for:

- Intent understanding
- Planning
- Tool selection
- Agent loop
- Context management
- Maximum-step enforcement
- Failure/retry handling

## 5.3 AI Module

Expose:

```ts
interface AIProvider {
  generatePlan(input: AgentInput): Promise<AgentPlan>;
  decideNextAction(context: AgentContext): Promise<ToolCall | AgentFinal>;
}
```

Do not put provider-specific SDK calls inside the agent service.

## 5.4 Tool Registry

Every tool should have:

```ts
{
  name: "search_youtube",
  description: "Search YouTube for a query",
  riskLevel: "SAFE",
  inputSchema: ...,
  execute: async (...) => ...
}
```

The model sees tool descriptions, but the server validates every call again.

## 5.5 Permission Engine

Three levels:

### SAFE

No confirmation.

Examples:

```text
open_browser
open_youtube
search_web
search_files
read_webpage
open_application
```

### CONFIRM

Confirmation required depending on policy.

Examples:

```text
download_file
create_calendar_event
delete_file
change_settings
```

### CRITICAL

Always require explicit confirmation.

Examples:

```text
send_email
send_message
purchase_product
make_payment
delete_important_file
publish_social_post
```

The original concept explicitly divides actions into no-approval, approval-required and always-approval categories. fileciteturn0file0L264-L324

---

# 6. Agent Execution Model

The agent should operate as a bounded loop:

```text
User request
    ↓
Normalize input
    ↓
Create task
    ↓
Load user context
    ↓
LLM planner
    ↓
Structured plan
    ↓
Validate plan
    ↓
Select tool
    ↓
Permission check
    ↓
 ┌───────────────┐
 │ Approval needed? │
 └───────┬───────┘
       YES│NO
          │
    Telegram/Web
          │
    Approved?
      │       │
     YES     NO
      │       └──→ Cancel task
      ↓
Execute tool
      ↓
Store result
      ↓
Need another step?
   │          │
  YES         NO
   │           │
   └──→ LLM    ↓
           Final response
```

This is the actual agent loop described in the source concept: understand intent → select tool → execute → return result → decide the next action. fileciteturn0file0L889-L912

---

# 7. Database Design

Main PostgreSQL tables:

```text
users
sessions
tasks
task_steps
tool_executions
approvals
approval_actions
memories
agent_runs
audit_logs
integrations
```

## Task

```text
tasks
-----
id
user_id
input_text
input_type
status
priority
created_at
started_at
completed_at
error
```

## Task Step

```text
task_steps
----------
id
task_id
step_number
tool_name
input_json
output_json
status
started_at
completed_at
error
```

## Approval

```text
approvals
---------
id
task_id
tool_execution_id
risk_level
payload_json
status
expires_at
approved_at
rejected_at
```

## Memory

```text
memories
--------
id
user_id
type
content
metadata_json
embedding
importance
created_at
expires_at
```

Use pgvector later for semantic search.

---

# 8. Redis Usage

Do not use Redis as your primary database.

Use Redis for:

```text
cache
rate limiting
distributed locks
BullMQ queues
temporary agent state
approval expiration
session state
task progress
```

Example:

```text
agent:task:{taskId}
approval:{approvalId}
rate:user:{userId}
lock:task:{taskId}
```

---

# 9. Queue Architecture

MVP:

```text
NestJS
  ↓
BullMQ
  ↓
Redis
  ↓
Worker
```

Queues:

```text
agent-planning
browser-jobs
desktop-jobs
email-jobs
voice-jobs
notification-jobs
```

Later:

```text
Service A
   ↓
RabbitMQ
   ↓
Service B
```

Do not introduce microservices just to make the architecture look impressive.

Start as a modular monolith. Split services when there is an actual scaling/security/deployment reason.

---

# 10. AI Implementation Strategy

The AI layer should not be:

```text
User → LLM → execute arbitrary code
```

It should be:

```text
User
 ↓
LLM
 ↓
Structured tool call
 ↓
Server validation
 ↓
Permission engine
 ↓
Tool executor
```

Example:

```json
{
  "tool": "search_youtube",
  "arguments": {
    "query": "Node.js streams tutorial"
  }
}
```

The server then validates:

```text
Does tool exist?
Is argument schema valid?
Is user authorized?
Is tool allowed?
Does this action require approval?
```

Only then:

```text
Tool.execute()
```

---

# 11. AI Provider Abstraction

Recommended:

```text
src/modules/ai/
├── ai.module.ts
├── ai.service.ts
├── interfaces/
│   └── ai-provider.interface.ts
├── providers/
│   ├── gemini.provider.ts
│   ├── openai.provider.ts
│   └── local.provider.ts
└── schemas/
    ├── agent-plan.schema.ts
    └── tool-call.schema.ts
```

Use structured output / tool calling.

Important protections:

- Zod/class-validator schema validation
- Maximum tool calls per task
- Maximum execution time
- Maximum token/context budget
- Tool allowlist
- URL/domain allowlist where appropriate
- Human approval for risky actions
- Audit log for every tool call

---

# 12. Browser Agent

Use Playwright.

```text
BrowserService
 ├── launch()
 ├── createContext()
 ├── openPage()
 ├── navigate()
 ├── click()
 ├── type()
 ├── select()
 ├── screenshot()
 ├── extractText()
 └── close()
```

The LLM should request semantic tools such as:

```text
search_youtube
search_products
open_product
```

rather than directly generating arbitrary Playwright code.

This keeps your system safer and more deterministic.

---

# 13. Email Architecture

For an email reply:

```text
User voice
 ↓
STT
 ↓
Agent
 ↓
Email search
 ↓
Read thread
 ↓
LLM drafts reply
 ↓
Permission Engine
 ↓
Approval
 ↓
Gmail API
 ↓
Send
```

Never allow:

```text
LLM → Gmail send
```

without the permission layer.

The original DEVIS example specifically requires approval before sending an email. fileciteturn0file0L384-L430

---

# 14. Security Model

## Authentication

Use:

```text
JWT access token
+
refresh token
```

For browser sessions, prefer secure HTTP-only cookies.

## Authorization

Every request should resolve:

```text
user → task → tool execution → permission
```

A user must never be able to approve another user's task.

## Secrets

Never store API keys in PostgreSQL plaintext.

Use:

```text
.env
AWS Secrets Manager
or another secret manager
```

## Tool sandbox

Never allow arbitrary:

```text
exec(command)
shell(command)
powershell(command)
```

from model output.

If operating-system commands become necessary, expose specific allowlisted commands through dedicated server-side functions.

---

# 15. Observability

Implement:

- Structured logs
- Correlation ID
- Task ID
- Agent run ID
- Tool execution ID
- Error tracking
- Metrics
- Audit logs

Every task should be traceable:

```text
request
 ↓
taskId
 ↓
agentRunId
 ↓
stepId
 ↓
toolExecutionId
 ↓
approvalId
```

---

# 16. Testing Strategy

## Unit

Test:

```text
PermissionEngine
AgentPlanner
ToolRegistry
schemas
TaskService
ApprovalService
```

## Integration

Test:

```text
PostgreSQL
Redis
BullMQ
AI provider mock
Telegram mock
```

## E2E

Test:

```text
voice/text request
 → task
 → plan
 → tool
 → approval
 → execution
 → final result
```

## AI tests

Create fixed scenarios:

```text
"Open YouTube"
"Find my resume"
"Draft email"
"Send email"
"Buy keyboard"
"Delete file"
```

Verify that the model chooses the correct tool and risk level.

---

# 17. Development Phases

## Phase 0 — Repository

Create:

```text
devis-ai/
├── apps/
│   ├── api/
│   ├── web/
│   └── worker/
├── packages/
│   ├── shared/
│   ├── ai/
│   ├── tools/
│   └── config/
├── infrastructure/
│   ├── docker/
│   └── nginx/
├── docs/
├── docker-compose.yml
├── README.md
└── package.json
```

Use pnpm workspaces.

---

## Phase 1 — NestJS Foundation

Build:

```text
health
config
logger
database
auth
users
tasks
```

Goal:

```text
POST /api/v1/tasks
GET /api/v1/tasks/:id
```

---

## Phase 2 — PostgreSQL + Prisma

Create schema for:

```text
User
Task
TaskStep
Approval
ToolExecution
AuditLog
```

Run migrations.

---

## Phase 3 — Redis + BullMQ

Create:

```text
agent-planning
tool-execution
notification
```

Build workers.

---

## Phase 4 — AI Provider

Implement:

```text
AIProvider
GeminiProvider
AgentService
```

First task:

```text
"Open YouTube"
```

Expected:

```json
{
  "tool": "open_youtube",
  "arguments": {}
}
```

---

## Phase 5 — Tool Registry

Build first five tools:

```text
open_browser
open_app
web_search
search_files
create_email_draft
```

The original MVP recommends beginning with five controlled tools before expanding the system. fileciteturn0file0L627-L635

---

## Phase 6 — Playwright

Implement:

```text
open_browser
open_website
search_youtube
extract_page
```

---

## Phase 7 — Desktop Agent

Start with:

```text
open_application
open_file
search_files
```

Do not start with unrestricted mouse/keyboard control.

---

## Phase 8 — Approval Engine

Implement:

```text
Approval
ApprovalPolicy
ApprovalService
TelegramNotifier
```

Flow:

```text
Tool requested
 ↓
Risk evaluation
 ↓
Approval required
 ↓
Create approval
 ↓
Telegram notification
 ↓
Approve/Reject
 ↓
Continue/Cancel
```

---

## Phase 9 — Next.js Dashboard

Pages:

```text
/login
/dashboard
/tasks
/tasks/[id]
/approvals
/memory
/integrations
/settings
```

Dashboard should show:

```text
Task
Status
Current step
Tool
Approval
Result
Execution time
Errors
```

---

## Phase 10 — Voice

Start:

```text
Push-to-talk
 ↓
Audio upload
 ↓
STT
 ↓
Text
 ↓
Agent
```

Only after this works:

```text
Wake word
Streaming audio
TTS
Voice conversation
```

---

## Phase 11 — Memory

Start with:

```text
conversation/task history
```

Then:

```text
PostgreSQL
+
pgvector
```

Memory categories:

```text
preferences
people
projects
frequent actions
important facts
task history
```

Do not automatically store everything.

---

## Phase 12 — Multi-Step Agent

Example:

> "Find a laptop under ₹50,000 and open the best one."

Agent:

```text
search_products()
      ↓
read_results()
      ↓
compare()
      ↓
select_best()
      ↓
open_product()
```

This is where DEVIS becomes a real agent instead of a command router.

---

# 18. Version Roadmap

## v0.1

```text
Text input
AI planner
5 tools
PostgreSQL
Redis
REST API
```

## v0.2

```text
Playwright
YouTube
Web search
File search
```

## v0.3

```text
Email
Telegram
Approval engine
```

## v0.4

```text
Voice
Background jobs
Task history
```

## v0.5

```text
Desktop controller
Calendar
Product research
```

## v0.6

```text
Memory
pgvector
Multi-step agent
```

## v1.0

```text
Wake word
Voice conversation
Desktop UI
Advanced permissions
Observability
Reliable task recovery
```

The original roadmap similarly recommends postponing wake-word detection, full autonomous control, many integrations, complex memory and mobile apps until the core agent works. fileciteturn0file0L592-L671

---

# 19. What Makes This a Strong Backend Portfolio Project

This project demonstrates:

### Backend

- NestJS
- TypeScript
- REST API
- WebSockets
- PostgreSQL
- Prisma
- Redis
- BullMQ
- RabbitMQ concepts
- Authentication
- Authorization
- RBAC
- Rate limiting
- Background workers
- Distributed locks
- Idempotency
- Retry mechanisms

### AI

- LLM integration
- Structured output
- Tool calling
- Agent loops
- Context management
- Memory
- RAG/vector search
- AI safety/guardrails
- Model abstraction

### System Design

- Modular monolith
- Async processing
- Event-driven architecture
- Queue architecture
- Caching
- Database indexing
- Horizontal scaling
- Failure recovery
- Observability

### Automation

- Playwright
- Browser automation
- Desktop automation
- Email APIs
- Telegram integration

This is substantially stronger as a portfolio project than another CRUD SaaS application.

---

# 20. Golden Architecture Rule

Do not build everything as microservices from day one.

Start:

```text
Next.js
   ↓
NestJS Modular Monolith
   ↓
PostgreSQL
Redis
BullMQ
```

Then split when required:

```text
API Gateway
     ↓
 ┌───┼────────┬──────────┐
 ↓   ↓        ↓          ↓
Agent Browser Desktop  Notification
Service Service  Service   Service
     ↓
 RabbitMQ
```

This lets you demonstrate that you understand **why** a system should be distributed rather than simply using microservices everywhere.

---

# 21. First Milestone

Your first working milestone should be:

> Type: "Open YouTube and search Node.js streams"

System:

```text
Next.js
 ↓
POST /tasks
 ↓
NestJS
 ↓
AgentService
 ↓
AI Provider
 ↓
search_youtube tool
 ↓
Permission = SAFE
 ↓
Playwright
 ↓
YouTube opened
 ↓
Search executed
 ↓
Task completed
 ↓
Dashboard updated
```

Once this works reliably, add email + approval.

Do not start with voice, wake word, desktop control, memory and 20 integrations simultaneously.

---

# 22. Definition of Done

DEVIS v1.0 is complete when:

- [ ] User can authenticate
- [ ] User can submit text/voice commands
- [ ] Agent creates structured plans
- [ ] Tool calls are schema validated
- [ ] Tool permissions are enforced
- [ ] Sensitive actions require approval
- [ ] Telegram approval works
- [ ] Browser automation works
- [ ] Email integration works
- [ ] Desktop basic actions work
- [ ] Tasks are persisted
- [ ] Background jobs are reliable
- [ ] Failed tasks can retry safely
- [ ] Audit logs exist
- [ ] Rate limiting exists
- [ ] Secrets are protected
- [ ] Agent has maximum execution limits
- [ ] Dashboard displays live task state
- [ ] Memory can be searched
- [ ] E2E tests cover critical flows
- [ ] Docker deployment works
- [ ] Production logs/metrics are available

---

# 23. Documentation

This repository should contain:

```text
docs/
├── architecture.md
└── sd.md
```

- `architecture.md` = technical architecture, modules, folder structure and execution flows.
- `sd.md` = system design requirements, APIs, data model, scalability, reliability, security and interview-level design decisions.


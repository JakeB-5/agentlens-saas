# AgentLens

**Multi-Agent Observability & Control Plane** — Datadog for AI Agent Systems

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

## Overview

AgentLens는 멀티 에이전트 AI 시스템을 위한 실시간 관찰 및 제어 플랫폼입니다. AI 에이전트 시장이 2025년 $7.84B에서 2030년 $52B+로 성장하는 가운데, 에이전트 간 상호작용을 추적하고 디버깅하는 전문 도구가 부재한 상황에서 탄생했습니다.

### Why AgentLens?

기존 LLM 관찰 도구(LangSmith, Helicone, AgentOps)는 **단일 LLM 호출** 추적에 최적화되어 있습니다. 하지만 프로덕션 멀티 에이전트 시스템에서는:

- 에이전트 간 **핸드오프 실패**를 추적할 수 없음
- **에이전트 토폴로지**와 통신 흐름을 시각화할 수 없음
- 복합 워크플로우의 **비용과 지연 시간**을 에이전트 단위로 분석할 수 없음
- **실시간 알림**과 서킷 브레이커가 없음

AgentLens는 이 격차를 해소합니다.

## Features

### Dashboard
멀티 에이전트 시스템의 전체 상태를 한눈에 파악합니다.
- 총 트레이스, 활성 에이전트, 에러율, 총 비용, 평균 지연시간
- 최근 트레이스 목록과 에이전트 상태 개요

### Trace Explorer
에이전트 워크플로우와 개별 스팬을 상세히 검사합니다.
- 필터링 가능한 트레이스 목록 (상태, 에이전트별)
- 스팬 워터폴 뷰 (LLM 호출, 도구 실행, 에이전트 핸드오프, 메시지, RAG 검색)
- 각 스팬의 모델, 토큰, 비용, 지연시간 표시

### Agent Topology
에이전트 간 연결과 통신 흐름을 인터랙티브 그래프로 시각화합니다.
- 노드 = 에이전트, 엣지 = 통신 채널
- 메시지 수, 에러 수, 평균 지연시간 표시
- React Flow 기반 드래그 & 줌

### Alerts & Circuit Breakers
장애를 사전에 감지하고 대응합니다.
- 에러율, 지연시간, 비용, 토큰 사용량 기반 알림
- 커스텀 임계값 및 윈도우 설정
- 알림 이벤트 히스토리

### SDK
경량 TypeScript SDK로 에이전트 애플리케이션을 계측합니다.

```typescript
import { AgentLens } from '@agentlens/sdk';

const lens = new AgentLens({
  apiKey: 'al_sk_...',
  endpoint: 'http://localhost:3000',
});

const trace = await lens.startTrace('my-workflow');
const span = trace.startSpan('llm_call', { model: 'gpt-4o', agent: 'researcher' });
span.end({ tokens: 1500, cost: 0.045 });
await trace.end();
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4, class-variance-authority |
| Database | Prisma 6 + SQLite (swappable to PostgreSQL) |
| Charts | Recharts |
| Graph | React Flow |
| Icons | Lucide React |

## Quick Start

```bash
# Clone
git clone https://github.com/anylabs/agentlens.git
cd agentlens

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **"Seed Demo Data"** to populate with sample multi-agent data.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/        # Dashboard pages (layout group)
│   │   ├── page.tsx        # Overview dashboard
│   │   ├── traces/         # Trace explorer
│   │   ├── topology/       # Agent topology graph
│   │   ├── alerts/         # Alert management
│   │   └── settings/       # Project settings & SDK docs
│   ├── api/                # REST API routes
│   │   ├── dashboard/      # Aggregated dashboard data
│   │   ├── traces/         # Trace CRUD + detail
│   │   ├── agents/         # Agent registry & connections
│   │   ├── alerts/         # Alert CRUD
│   │   └── seed/           # Demo data seeder
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Base UI (Card, Badge)
│   ├── dashboard/          # Dashboard widgets
│   ├── layout/             # Sidebar navigation
│   └── traces/             # Trace viewer components
├── lib/                    # Utilities (db, formatting)
└── sdk/                    # AgentLens TypeScript SDK
prisma/
└── schema.prisma           # Database schema (6 models)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Dashboard overview data |
| GET | `/api/traces` | List traces (filterable) |
| POST | `/api/traces` | Create new trace |
| GET | `/api/traces/:id` | Get trace with spans |
| GET | `/api/agents` | List agents & connections |
| GET | `/api/alerts` | List alerts & events |
| POST | `/api/alerts` | Create new alert |
| POST | `/api/seed` | Seed demo data |

## Database Models

- **Project** — Multi-tenant project container with API key
- **Agent** — Registered agents (orchestrator, worker, tool, router)
- **Trace** — End-to-end workflow execution
- **Span** — Individual operation within a trace (LLM call, tool call, handoff, message, retrieval)
- **AgentConnection** — Communication channel between two agents (message count, error count, latency)
- **Alert / AlertEvent** — Configurable alerts with event history

## Market Context

이 프로젝트는 다음 시장 리서치를 기반으로 설계되었습니다:

- AI 에이전트 시장: 2025년 ~$7.84B → 2030년 $52.62B (CAGR 46.3%)
- 벤치마크에서 75%의 에이전트 실패율 — 관찰성 도구의 필요성 대두
- 기존 도구(LangSmith, Helicone, AgentOps, Portkey, Arize)는 단일 LLM 호출 추적에 초점
- **미충족 영역**: 멀티 에이전트 워크플로우 관찰, 에이전트 간 통신 디버깅, 실시간 개입

## License

MIT

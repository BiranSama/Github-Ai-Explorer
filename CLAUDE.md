# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm run test:unit   # Vitest unit/integration tests
npm run test:e2e   # Playwright E2E tests (run dev server first)
```

Database setup:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Architecture

### LLM Provider Abstraction (src/lib/llm.ts)
The `LLM_PROVIDER` env var switches between two modes:
- `openai` (default): Uses OpenAI-compatible `/chat/completions` endpoint
- `anthropic`: Uses Anthropic `/messages` endpoint with `anthropic-version` and `anthropic-dangerous-direct-browser-access` headers

Model, API key, and base URL are configured via `LLM_MODEL`, `LLM_API_KEY`, `LLM_BASE_URL`.

### GitHub Integration (src/lib/github.ts)
- `fetchTrending(language?, since?)` - Fetches trending repos (daily/weekly/monthly)
- `fetchGitHubSearch(query)` - Searches repos via GitHub Search API
- Supports optional `GITHUB_TOKEN` for higher rate limits

### Data Layer (src/lib/db.ts + prisma/schema.prisma)
- Prisma ORM with SQLite (`DATABASE_URL=file:./dev.db`)
- Models: `Project`, `UserPreference`, `PushLog`
- AI summaries are stored on `Project.aiSummary` with `aiSummaryGeneratedAt` timestamp

### API Routes (src/app/api/)
- `/api/trending` - GET trending projects
- `/api/search` - Search GitHub repos
- `/api/recommend` - AI-powered recommendations based on user preferences
- `/api/projects/[id]` - Project details + summarize
- `/api/preferences` - User language preferences
- `/api/push/subscribe` - Web Push subscription
- `/api/push/send` - Trigger push notification

### Frontend Patterns
- Custom hooks in `src/hooks/`: `useTrending`, `useSearch`, `useRecommend`, `usePreferences`, `useProject`
- Components use shadcn/ui pattern with `class-variance-authority`
- Theme support via `ThemeProvider` (light/dark auto-detect)

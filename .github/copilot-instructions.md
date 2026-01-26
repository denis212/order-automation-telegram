# Lunch Order Bot - AI Coding Instructions

## Project Overview

A Telegram bot for managing lunch orders with date/range support. Architecture: Telegraf bot → Command handlers → Order service → Drizzle ORM → SQLite database.

**Key Stack**: TypeScript, Telegraf (Telegram API), Drizzle ORM, better-sqlite3, dayjs for date parsing.

## Architecture & Data Flow

### Core Components

1. **Bot Entry** (`src/bot.ts`): Telegraf instance with command routing, middleware for auth/errors
2. **Commands** (`src/commands/`): Handlers for `/order`, `/today`, `/week`, `/delete`, `/update`
3. **Order Service** (`src/services/order.service.ts`): Database operations (addOrder, getOrdersByDate, getOrdersByDateRange)
4. **Database** (`src/db/`): Drizzle schema with single `orders` table, initialized at startup
5. **Utils** (`src/utils/`): Date parser (handles "tomorrow", "mon-fri", "25-01" formats) and formatters (Markdown responses)

### Data Model

- **Orders table**: `id`, `customerName`, `quantity`, `orderDate` (ISO string: "2026-01-23"), `createdAt`, `updatedAt`
- All dates stored as ISO strings for consistency; dayjs handles locale-aware parsing
- Upsert logic in `addOrder()`: updates quantity if customer+date exists, inserts otherwise (case-insensitive name matching)

### Command Flow Pattern

Commands follow: Parse args → Validate input → Parse date → Call service → Format response → Reply. See `src/commands/order.ts` for template.

## Developer Workflows

### Building & Running

```bash
npm run dev              # Hot reload (tsx watch)
npm run build          # TypeScript compile to dist/
npm start              # Run compiled JavaScript
npm run db:generate   # Drizzle migration generation
npm run db:push       # Apply migrations to SQLite
npm test              # Vitest runner
```

**Multi-Machine Sync**: `./start.sh` (pull latest DB) and `./stop.sh` (backup DB) for syncing between machines.

### Database Management

- SQLite: `./data/orders.db` (created automatically)
- Migrations managed via Drizzle; schema changes → `npm run db:generate` → `npm run db:push`
- No migrations directory; Drizzle handles incremental updates

## Project Conventions

### Date Handling

- **Input formats**: "today", "tomorrow", "mon", "25-01", "mon-fri" (case-insensitive)
- **Storage**: ISO strings (YYYY-MM-DD) only in database
- **Parsing**: `parseDate()` in `src/utils/date-parser.ts` normalizes all inputs
- Always use dayjs for date math; never hardcode dates

### Error Handling

- Command handlers catch errors and reply with formatted error messages
- Bot middleware catches unhandled errors and logs them
- Graceful shutdown on SIGINT/SIGTERM (process.once listeners in `src/index.ts`)

### Formatting & UI

- Use `src/utils/formatter.ts` for all Telegram responses (consistent Markdown formatting)
- Error messages start with ❌; success with ✅; dates/summaries with 🍱
- Always set `{ parse_mode: 'Markdown' }` for formatted replies

### Auth & Config

- `ADMIN_USER_ID` env variable for optional access control
- `BOT_TOKEN` required; validated on startup
- `DATABASE_PATH` configurable (defaults to `./data/orders.db`)
- Config centralized in `src/config.ts` (loaded from `.env`)

## Critical Integration Points

1. **Telegraf Context**: All handlers receive `Context` from Telegraf; access user/message via `ctx.from`, `ctx.message`
2. **Drizzle ORM**: Use `.get()` for single results, `.all()` for arrays; `.returning()` to get affected rows
3. **Date Service**: Always call `parseDate()` before querying; it returns `{ type: 'single'|'range', dates: string[] }`
4. **Bulk Operations**: `addBulkOrders()` loops `addOrder()` per date (N+1 writes, consider optimizing if performance critical)

## When Adding Features

- **New command?** Create handler in `src/commands/`, export from `src/commands/index.ts`, register in `src/bot.ts` with `bot.command()`
- **New DB field?** Update schema in `src/db/schema.ts`, run `npm run db:generate && npm run db:push`
- **Date parsing edge case?** Add to `DAY_MAP` or range logic in `src/utils/date-parser.ts`
- **New response format?** Add formatter in `src/utils/formatter.ts`

All command handlers are async; use `await` for service calls and `ctx.reply()` responses.

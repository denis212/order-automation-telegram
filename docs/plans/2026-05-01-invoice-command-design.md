# Invoice Command Design

## Overview

Add a new `/invoice` command to the Lunch Order Bot that generates invoices grouped by person with daily breakdowns and payment details.

## Architecture

Add a new `/invoice` command to the existing commands structure:

```
src/
  commands/
    invoice.ts  ← new file
  config.ts     ← add INVOICE_ACCOUNT_NUMBER and INVOICE_PRICE_PER_PORTION
```

The command will:
- Parse optional date argument using the existing `date-parser` utility
- Default to current week if no date specified
- Fetch orders from SQLite via existing database service
- Transform/group data by person for invoice format
- Format output with IDR currency and transfer account
- Support configurable account number and price per portion via environment variables

## Components

### New Command Handler (`src/commands/invoice.ts`)

**Main function:**
- `formatInvoice(orderData: Order[], dateRange: DateRange): string`

**Config additions** (`src/config.ts`):
```typescript
INVOICE_ACCOUNT_NUMBER: string (default: "101998545237")
INVOICE_PRICE_PER_PORTION: number (default: 22000)
```

### Invoice Format Output

```
💰 Invoice

Amal (4 portions)
  • Tue: 1
  • Wed: 1
  • Thu: 1
  • Fri: 1
  Total: IDR 88,000

Imel (4 portions)
  • Wed: 1
  • Thu: 1
  • Fri: 1
  • Sat: 1
  Total: IDR 88,000

Grand Total: IDR 528,000

Transfer to: 101998545237
```

## Data Flow

1. User sends `/invoice` or `/invoice mon-fri` or `/invoice 25-01`
2. Command handler receives context and optional date argument
3. Parse date(s) using existing `date-parser.parseDateRange()` utility
4. Query database: `SELECT * FROM orders WHERE date BETWEEN start AND end ORDER BY date, name`
5. Transform/group in-memory:
   - Map: `name → { orders: [{date, portions}], total: number }`
   - Sort by person name alphabetically
6. Format each person's section with day names (Mon, Tue, etc.)
7. Calculate individual totals and grand total
8. Append config values (account number, price)
9. Return formatted string to Telegram

## Error Handling

- **Invalid date format** - Return helpful error: `Invalid date format. Use /invoice, /invoice mon-fri, /invoice 25-01`
- **No orders found** - Return message: `No orders found for this period`
- **Database errors** - Re-throw to existing error handler in bot.ts
- **Missing config values** - Use defaults (no error if env vars not set)

### Edge Cases
- Empty date range (e.g., `/invoice mon-mon`) - show "No orders found"
- Weekend-only range - work normally, just show weekend orders

## Testing

### Manual Testing Checklist
1. `/invoice` - Shows current week invoice
2. `/invoice mon-fri` - Shows date range invoice
3. `/invoice 25-01` - Shows single day invoice
4. `/invoice invalid` - Shows error message
5. Empty week - Shows "No orders found"
6. Different account number in `.env` - Reflects in output
7. Different price in `.env` - Calculates correctly

No automated tests required for this feature.

## Configuration

Add to `.env`:
```bash
# Invoice settings (optional, defaults provided)
INVOICE_ACCOUNT_NUMBER=101998545237
INVOICE_PRICE_PER_PORTION=22000
```

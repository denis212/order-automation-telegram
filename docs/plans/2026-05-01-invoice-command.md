# Invoice Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `/invoice` command that generates invoices grouped by person with daily breakdowns, supporting date range arguments.

**Architecture:** New command handler that reuses existing date parser and order service, formats data by person rather than by date, includes configurable payment details.

**Tech Stack:** TypeScript, Telegraf, Day.js, Drizzle ORM, SQLite

---

## Task 1: Add Invoice Configuration Values

**Files:**
- Modify: `src/config.ts`

**Step 1: Add invoice config values**

Add these lines after line 7 in `src/config.ts`:

```typescript
export const INVOICE_ACCOUNT_NUMBER = process.env.INVOICE_ACCOUNT_NUMBER || '101998545237';
export const INVOICE_PRICE_PER_PORTION = Number(process.env.INVOICE_PRICE_PER_PORTION) || 22000;
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/config.ts
git commit -m "feat: add invoice configuration values

- Add INVOICE_ACCOUNT_NUMBER config (default: 101998545237)
- Add INVOICE_PRICE_PER_PORTION config (default: 22000)"
```

---

## Task 2: Create Invoice Command Handler

**Files:**
- Create: `src/commands/invoice.ts`

**Step 1: Create invoice.ts file with handler function**

Create `src/commands/invoice.ts` with:

```typescript
import { Context } from 'telegraf';
import dayjs from 'dayjs';
import { parseDate, getThisWeekDates, formatShortDate } from '../utils/date-parser.js';
import { getOrdersByDateRange, type Order } from '../services/order.service.js';
import { INVOICE_ACCOUNT_NUMBER, INVOICE_PRICE_PER_PORTION } from '../config.js';
import { formatError } from '../utils/formatter.js';

/**
 * Handle /invoice command
 * Usage: /invoice [date-range]
 * Examples:
 *   /invoice          - Show current week invoice
 *   /invoice mon-fri  - Show Mon-Fri invoice
 *   /invoice 25-01    - Show single day invoice
 */
export async function handleInvoice(ctx: Context): Promise<void> {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const args = text.split(/\s+/).slice(1);
    const dateInput = args.join(' ') || undefined;

    try {
        // Parse dates - default to current week if no input
        const parsed = dateInput ? parseDate(dateInput) : { type: 'range' as const, dates: getThisWeekDates() };
        
        if (parsed.dates.length === 0) {
            await ctx.reply('No orders found for this period');
            return;
        }

        // Get orders for the date range
        const startDate = parsed.dates[0];
        const endDate = parsed.dates[parsed.dates.length - 1];
        const orders = await getOrdersByDateRange(startDate, endDate);

        if (orders.length === 0) {
            await ctx.reply('No orders found for this period');
            return;
        }

        // Group orders by person
        const grouped = groupOrdersByPerson(orders);
        
        // Format invoice
        const invoiceText = formatInvoice(grouped, parsed.dates);
        
        await ctx.reply(invoiceText, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error generating invoice:', error);
        await ctx.reply(
            formatError('Failed to generate invoice. Please try again.'),
            { parse_mode: 'Markdown' }
        );
    }
}

/**
 * Group orders by customer name
 */
interface PersonOrders {
    orders: { date: string; quantity: number }[];
    totalQuantity: number;
}

function groupOrdersByPerson(orders: Order[]): Map<string, PersonOrders> {
    const grouped = new Map<string, PersonOrders>();

    for (const order of orders) {
        const existing = grouped.get(order.customerName);
        if (existing) {
            existing.orders.push({ date: order.orderDate, quantity: order.quantity });
            existing.totalQuantity += order.quantity;
        } else {
            grouped.set(order.customerName, {
                orders: [{ date: order.orderDate, quantity: order.quantity }],
                totalQuantity: order.quantity,
            });
        }
    }

    return grouped;
}

/**
 * Format invoice text grouped by person
 */
function formatInvoice(grouped: Map<string, PersonOrders>, dateRange: string[]): string {
    let grandTotal = 0;
    const sections: string[] = [];

    // Sort people alphabetically
    const sortedNames = Array.from(grouped.keys()).sort();

    for (const name of sortedNames) {
        const person = grouped.get(name)!;
        grandTotal += person.totalQuantity;

        // Get day abbreviations for each order (e.g., "Mon", "Tue")
        const orderLines = person.orders.map(o => {
            const dayName = dayjs(o.date).format('ddd');
            return `  • ${dayName}: ${o.quantity}`;
        }).join('\n');

        const totalAmount = person.totalQuantity * INVOICE_PRICE_PER_PORTION;
        sections.push(`**${name}** (${person.totalQuantity} portions)\n${orderLines}\n  Total: IDR ${totalAmount.toLocaleString('id-ID')}`);
    }

    const grandTotalAmount = grandTotal * INVOICE_PRICE_PER_PORTION;

    return `💰 Invoice\n\n${sections.join('\n\n')}\n\n📊 Grand Total: IDR ${grandTotalAmount.toLocaleString('id-ID')}\n\n💳 Transfer to: ${INVOICE_ACCOUNT_NUMBER}`;
}
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/commands/invoice.ts
git commit -m "feat: add invoice command handler

- Add handleInvoice function to generate invoices grouped by person
- Support date range arguments (default to current week)
- Format output with daily breakdowns and payment details
- Include groupOrdersByPerson and formatInvoice helper functions"
```

---

## Task 3: Export Invoice Command

**Files:**
- Modify: `src/commands/index.ts`

**Step 1: Add invoice export**

Add this line at the end of `src/commands/index.ts`:

```typescript
export { handleInvoice } from './invoice.js';
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/commands/index.ts
git commit -m "feat: export invoice command"
```

---

## Task 4: Register Invoice Command

**Files:**
- Modify: `src/bot.ts`

**Step 1: Import handleInvoice**

Add `handleInvoice` to the import from './commands/index.js' in `src/bot.ts`:

Change line 3-13 to:

```typescript
import {
    handleStart,
    handleHelp,
    handleOrder,
    handleToday,
    handleTomorrow,
    handleCheck,
    handleWeek,
    handleDelete,
    handleUpdate,
    handleInvoice,
} from './commands/index.js';
```

**Step 2: Register invoice command**

Add this line after line 45 in `src/bot.ts`:

```typescript
bot.command('invoice', handleInvoice);
```

**Step 3: Run build to verify**

Run: `npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add src/bot.ts
git commit -m "feat: register /invoice command"
```

---

## Task 5: Update Help Text

**Files:**
- Modify: `src/utils/formatter.ts`

**Step 1: Add invoice to help text**

Add invoice command after line 106 in `src/utils/formatter.ts` (after the /week line):

```typescript
\`/invoice\` - Generate invoice for this week
\`/invoice <range>\` - Generate invoice for date range
```

**Step 2: Add invoice example to examples section**

Add this line after line 116 in `src/utils/formatter.ts`:

```typescript
\`/invoice\`
\`/invoice mon-fri\`
```

**Step 3: Run build to verify**

Run: `npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add src/utils/formatter.ts
git commit -m "docs: add invoice command to help text"
```

---

## Task 6: Update .env.example

**Files:**
- Modify: `.env.example`

**Step 1: Add invoice config to example**

Add these lines at the end of `.env.example`:

```bash
# Invoice settings (optional)
INVOICE_ACCOUNT_NUMBER=101998545237
INVOICE_PRICE_PER_PORTION=22000
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add invoice config to .env.example"
```

---

## Task 7: Manual Testing

**Files:**
- No files created/modified

**Step 1: Start the bot**

Run: `npm run dev`

**Step 2: Test basic invoice command**

Send to bot: `/invoice`
Expected: Shows invoice for current week or "No orders found for this period"

**Step 3: Test date range invoice**

Send to bot: `/invoice mon-fri`
Expected: Shows invoice for Monday to Friday with proper breakdown

**Step 4: Test specific date invoice**

Send to bot: `/invoice 25-01`
Expected: Shows invoice for that specific date

**Step 5: Test error handling**

Send to bot: `/invoice invalid-date-format`
Expected: Shows "No orders found for this period" (falls back to today)

**Step 6: Verify help command**

Send to bot: `/help`
Expected: Shows `/invoice` command in the output

**Step 7: Stop the bot**

Press: `Ctrl+C`

**Step 8: Final commit**

```bash
git add .
git commit -m "chore: complete invoice command implementation

- All manual testing completed
- Feature ready for use"
```

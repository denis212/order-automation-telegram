import { Context } from 'telegraf';
import dayjs from 'dayjs';
import { parseDate, getThisWeekDates } from '../utils/date-parser.js';
import { getOrdersByDateRange } from '../services/order.service.js';
import { type Order } from '../db/schema.js';
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

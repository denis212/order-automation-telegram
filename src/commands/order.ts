import { Context } from 'telegraf';
import { parseDate } from '../utils/date-parser.js';
import {
    formatOrderAdded,
    formatBulkOrdersAdded,
    formatError
} from '../utils/formatter.js';
import { addOrder, addBulkOrders } from '../services/order.service.js';

/**
 * Handle /order command
 * Usage: /order <name> <quantity> [date]
 * Examples:
 *   /order Budi 2
 *   /order Siti 1 tomorrow
 *   /order Andi 1 mon-fri
 */
export async function handleOrder(ctx: Context): Promise<void> {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const args = text.split(/\s+/).slice(1); // Remove /order

    if (args.length < 2) {
        await ctx.reply(
            formatError('Usage: `/order <name> <quantity> [date]`\nExample: `/order Budi 2 tomorrow`'),
            { parse_mode: 'Markdown' }
        );
        return;
    }

    const name = args[0];
    const quantity = parseInt(args[1], 10);
    const dateInput = args.slice(2).join(' ') || undefined;

    // Validate quantity
    if (isNaN(quantity) || quantity <= 0) {
        await ctx.reply(
            formatError('Quantity must be a positive number.'),
            { parse_mode: 'Markdown' }
        );
        return;
    }

    // Parse date
    const parsedDate = parseDate(dateInput);

    try {
        if (parsedDate.type === 'single') {
            const order = await addOrder(name, quantity, parsedDate.dates[0]);
            await ctx.reply(
                formatOrderAdded(order.customerName, order.quantity, order.orderDate),
                { parse_mode: 'Markdown' }
            );
        } else {
            // Range - create multiple orders
            const ordersList = await addBulkOrders(name, quantity, parsedDate.dates);
            await ctx.reply(
                formatBulkOrdersAdded(name, quantity, parsedDate.dates),
                { parse_mode: 'Markdown' }
            );
        }
    } catch (error) {
        console.error('Error adding order:', error);
        await ctx.reply(
            formatError('Failed to add order. Please try again.'),
            { parse_mode: 'Markdown' }
        );
    }
}

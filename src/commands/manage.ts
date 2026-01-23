import { Context } from 'telegraf';
import { parseDate } from '../utils/date-parser.js';
import {
    formatOrderDeleted,
    formatOrderUpdated,
    formatError
} from '../utils/formatter.js';
import { deleteOrder, updateOrder } from '../services/order.service.js';

/**
 * Handle /delete command
 * Usage: /delete <name> [date]
 * Examples:
 *   /delete Budi
 *   /delete Siti tomorrow
 */
export async function handleDelete(ctx: Context): Promise<void> {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const args = text.split(/\s+/).slice(1); // Remove /delete

    if (args.length < 1) {
        await ctx.reply(
            formatError('Usage: `/delete <name> [date]`\nExample: `/delete Budi tomorrow`'),
            { parse_mode: 'Markdown' }
        );
        return;
    }

    const name = args[0];
    const dateInput = args.slice(1).join(' ') || undefined;

    const parsedDate = parseDate(dateInput);
    const date = parsedDate.dates[0];

    try {
        const deleted = await deleteOrder(name, date);

        if (deleted) {
            await ctx.reply(
                formatOrderDeleted(name, date),
                { parse_mode: 'Markdown' }
            );
        } else {
            await ctx.reply(
                formatError(`No order found for **${name}** on that date.`),
                { parse_mode: 'Markdown' }
            );
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        await ctx.reply(
            formatError('Failed to delete order. Please try again.'),
            { parse_mode: 'Markdown' }
        );
    }
}

/**
 * Handle /update command
 * Usage: /update <name> <quantity> [date]
 * Examples:
 *   /update Budi 3
 *   /update Siti 2 tomorrow
 */
export async function handleUpdate(ctx: Context): Promise<void> {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const args = text.split(/\s+/).slice(1); // Remove /update

    if (args.length < 2) {
        await ctx.reply(
            formatError('Usage: `/update <name> <quantity> [date]`\nExample: `/update Budi 3 tomorrow`'),
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

    const parsedDate = parseDate(dateInput);
    const date = parsedDate.dates[0];

    try {
        const updated = await updateOrder(name, quantity, date);

        if (updated) {
            await ctx.reply(
                formatOrderUpdated(updated.customerName, updated.quantity, updated.orderDate),
                { parse_mode: 'Markdown' }
            );
        } else {
            await ctx.reply(
                formatError(`No order found for **${name}** on that date. Use \`/order\` to add a new order.`),
                { parse_mode: 'Markdown' }
            );
        }
    } catch (error) {
        console.error('Error updating order:', error);
        await ctx.reply(
            formatError('Failed to update order. Please try again.'),
            { parse_mode: 'Markdown' }
        );
    }
}

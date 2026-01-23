import { Context } from 'telegraf';
import dayjs from 'dayjs';
import { parseDate, getThisWeekDates } from '../utils/date-parser.js';
import {
    formatOrdersList,
    formatWeeklyOrders,
    formatError
} from '../utils/formatter.js';
import {
    getOrdersByDate,
    getOrdersByDateRange,
    groupOrdersByDate
} from '../services/order.service.js';

/**
 * Handle /today command
 */
export async function handleToday(ctx: Context): Promise<void> {
    const today = dayjs().format('YYYY-MM-DD');

    try {
        const ordersList = await getOrdersByDate(today);
        await ctx.reply(
            formatOrdersList(ordersList, today),
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Error fetching today orders:', error);
        await ctx.reply(
            formatError('Failed to fetch orders. Please try again.'),
            { parse_mode: 'Markdown' }
        );
    }
}

/**
 * Handle /tomorrow command
 */
export async function handleTomorrow(ctx: Context): Promise<void> {
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

    try {
        const ordersList = await getOrdersByDate(tomorrow);
        await ctx.reply(
            formatOrdersList(ordersList, tomorrow),
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Error fetching tomorrow orders:', error);
        await ctx.reply(
            formatError('Failed to fetch orders. Please try again.'),
            { parse_mode: 'Markdown' }
        );
    }
}

/**
 * Handle /check command
 * Usage: /check [date]
 * Examples:
 *   /check
 *   /check tomorrow
 *   /check 25-01
 *   /check monday
 */
export async function handleCheck(ctx: Context): Promise<void> {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const args = text.split(/\s+/).slice(1); // Remove /check
    const dateInput = args.join(' ') || undefined;

    const parsedDate = parseDate(dateInput);
    const date = parsedDate.dates[0];

    try {
        const ordersList = await getOrdersByDate(date);
        await ctx.reply(
            formatOrdersList(ordersList, date),
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Error fetching orders:', error);
        await ctx.reply(
            formatError('Failed to fetch orders. Please try again.'),
            { parse_mode: 'Markdown' }
        );
    }
}

/**
 * Handle /week command
 * Shows orders for the current week (Monday to Sunday)
 */
export async function handleWeek(ctx: Context): Promise<void> {
    const weekDates = getThisWeekDates();
    const startDate = weekDates[0];
    const endDate = weekDates[weekDates.length - 1];

    try {
        const ordersList = await getOrdersByDateRange(startDate, endDate);
        const grouped = groupOrdersByDate(ordersList);

        await ctx.reply(
            formatWeeklyOrders(grouped),
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Error fetching weekly orders:', error);
        await ctx.reply(
            formatError('Failed to fetch orders. Please try again.'),
            { parse_mode: 'Markdown' }
        );
    }
}

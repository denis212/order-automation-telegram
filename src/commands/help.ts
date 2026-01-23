import { Context } from 'telegraf';
import { formatWelcome, formatHelp } from '../utils/formatter.js';

/**
 * Handle /start command
 */
export async function handleStart(ctx: Context): Promise<void> {
    await ctx.reply(formatWelcome(), { parse_mode: 'Markdown' });
}

/**
 * Handle /help command
 */
export async function handleHelp(ctx: Context): Promise<void> {
    await ctx.reply(formatHelp(), { parse_mode: 'Markdown' });
}

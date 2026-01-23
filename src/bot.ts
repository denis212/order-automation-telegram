import { Telegraf } from 'telegraf';
import { BOT_TOKEN, ADMIN_USER_ID } from './config.js';
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
} from './commands/index.js';

// Create bot instance
export const bot = new Telegraf(BOT_TOKEN);

// Admin-only middleware (optional - only if ADMIN_USER_ID is set)
if (ADMIN_USER_ID) {
    bot.use(async (ctx, next) => {
        if (ctx.from?.id !== ADMIN_USER_ID) {
            console.log(`Unauthorized access attempt from user ${ctx.from?.id}`);
            await ctx.reply('⛔ Unauthorized. This bot is private.');
            return;
        }
        return next();
    });
}

// Error handling middleware
bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
    ctx.reply('❌ An error occurred. Please try again.');
});

// Register command handlers
bot.command('start', handleStart);
bot.command('help', handleHelp);
bot.command('order', handleOrder);
bot.command('today', handleToday);
bot.command('tomorrow', handleTomorrow);
bot.command('check', handleCheck);
bot.command('week', handleWeek);
bot.command('delete', handleDelete);
bot.command('update', handleUpdate);

// Handle unknown commands
bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    if (text.startsWith('/')) {
        await ctx.reply(
            '❓ Unknown command. Type `/help` to see available commands.',
            { parse_mode: 'Markdown' }
        );
    }
});

console.log('✅ Bot configured');

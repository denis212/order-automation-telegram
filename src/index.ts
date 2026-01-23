import { bot } from './bot.js';
import './db/index.js'; // Initialize database

// Graceful shutdown
process.once('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    console.log('\n👋 Shutting down...');
    bot.stop('SIGTERM');
});

// Start the bot
async function main() {
    console.log('🚀 Starting Lunch Order Bot...');

    try {
        // Get bot info first
        const botInfo = await bot.telegram.getMe();
        console.log(`🤖 Bot: @${botInfo.username}`);

        // Delete any existing webhook
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        console.log('✅ Webhook cleared');

        // Start polling (don't await - it runs forever)
        bot.launch({ dropPendingUpdates: true });
        console.log('✅ Bot is running! Send /start to @' + botInfo.username);

    } catch (err) {
        console.error('❌ Failed to start bot:', err);
        process.exit(1);
    }
}

main();

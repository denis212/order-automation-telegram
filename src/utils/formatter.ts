import { Order } from '../db/schema.js';
import { formatDate, formatShortDate } from './date-parser.js';

/**
 * Format a success message for adding an order
 */
export function formatOrderAdded(name: string, quantity: number, date: string): string {
    return `✅ Added: **${name}** - ${quantity} portion(s) for ${formatDate(date)}`;
}

/**
 * Format a success message for adding multiple orders
 */
export function formatBulkOrdersAdded(name: string, quantity: number, dates: string[]): string {
    const dateList = dates.map(d => `  • ${formatShortDate(d)}: ${quantity} portion(s)`).join('\n');
    return `✅ Added ${dates.length} orders for **${name}**:\n${dateList}`;
}

/**
 * Format orders list for a specific date
 */
export function formatOrdersList(orders: Order[], date: string): string {
    if (orders.length === 0) {
        return `📋 **Orders for ${formatDate(date)}**\n\n_No orders yet_`;
    }

    const totalQuantity = orders.reduce((sum, o) => sum + o.quantity, 0);

    const orderLines = orders
        .map((o, i) => `${i + 1}. ${o.customerName} - ${o.quantity} portion(s)`)
        .join('\n');

    return `📋 **Orders for ${formatDate(date)}**\n\n${orderLines}\n\n📊 **Total: ${totalQuantity} portion(s)**`;
}

/**
 * Format orders for multiple dates (weekly view)
 */
export function formatWeeklyOrders(ordersByDate: Map<string, Order[]>): string {
    if (ordersByDate.size === 0) {
        return `📋 **This Week's Orders**\n\n_No orders this week_`;
    }

    let totalQuantity = 0;
    const sections: string[] = [];

    // Sort dates chronologically
    const sortedDates = Array.from(ordersByDate.keys()).sort();

    for (const date of sortedDates) {
        const orders = ordersByDate.get(date) || [];
        const dayTotal = orders.reduce((sum, o) => sum + o.quantity, 0);
        totalQuantity += dayTotal;

        if (orders.length > 0) {
            const orderList = orders.map(o => `  • ${o.customerName}: ${o.quantity}`).join('\n');
            sections.push(`**${formatShortDate(date)}** (${dayTotal})\n${orderList}`);
        }
    }

    if (sections.length === 0) {
        return `📋 **This Week's Orders**\n\n_No orders this week_`;
    }

    return `📋 **This Week's Orders**\n\n${sections.join('\n\n')}\n\n📊 **Week Total: ${totalQuantity} portion(s)**`;
}

/**
 * Format order deleted message
 */
export function formatOrderDeleted(name: string, date: string): string {
    return `🗑️ Deleted order for **${name}** on ${formatDate(date)}`;
}

/**
 * Format order updated message
 */
export function formatOrderUpdated(name: string, quantity: number, date: string): string {
    return `✏️ Updated: **${name}** - ${quantity} portion(s) for ${formatDate(date)}`;
}

/**
 * Format error message
 */
export function formatError(message: string): string {
    return `❌ ${message}`;
}

/**
 * Format help message
 */
export function formatHelp(): string {
    return `🍱 **Lunch Order Bot**

**Adding Orders:**
\`/order <name> <qty>\` - Order for today
\`/order <name> <qty> tomorrow\` - Order for tomorrow
\`/order <name> <qty> mon\` - Order for next Monday
\`/order <name> <qty> 25-01\` - Order for specific date
\`/order <name> <qty> mon-fri\` - Order Mon to Fri

**Viewing Orders:**
\`/today\` - Show today's orders
\`/tomorrow\` - Show tomorrow's orders
\`/check <date>\` - Show orders for date
\`/week\` - Show this week's orders

**Managing Orders:**
\`/delete <name> [date]\` - Delete order
\`/update <name> <qty> [date]\` - Update quantity

**Examples:**
\`/order Budi 2\`
\`/order Siti 1 tomorrow\`
\`/order Andi 1 mon-fri\`
\`/today\`
\`/delete Budi tomorrow\``;
}

/**
 * Format welcome message
 */
export function formatWelcome(): string {
    return `👋 **Welcome to Lunch Order Bot!**

I'll help you manage lunch orders for your team.

Quick start:
• \`/order Budi 2\` - Add order for today
• \`/today\` - View today's orders
• \`/help\` - See all commands

Let's get started! 🚀`;
}

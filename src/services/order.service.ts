import { db } from '../db/index.js';
import { orders, Order } from '../db/schema.js';
import { eq, and, between, sql } from 'drizzle-orm';

/**
 * Add or update an order for a customer on a specific date
 * Uses upsert logic - updates quantity if order already exists
 */
export async function addOrder(customerName: string, quantity: number, date: string): Promise<Order> {
    // Check if order already exists
    const existing = await db.select()
        .from(orders)
        .where(and(
            sql`lower(${orders.customerName}) = lower(${customerName})`,
            eq(orders.orderDate, date)
        ))
        .get();

    if (existing) {
        // Update existing order
        const updated = await db.update(orders)
            .set({
                quantity,
                updatedAt: sql`datetime('now')`
            })
            .where(eq(orders.id, existing.id))
            .returning()
            .get();

        return updated!;
    }

    // Insert new order
    const newOrder = await db.insert(orders)
        .values({
            customerName: customerName.trim(),
            quantity,
            orderDate: date,
        })
        .returning()
        .get();

    return newOrder!;
}

/**
 * Add orders for multiple dates (bulk insert for date ranges)
 */
export async function addBulkOrders(customerName: string, quantity: number, dates: string[]): Promise<Order[]> {
    const results: Order[] = [];

    for (const date of dates) {
        const order = await addOrder(customerName, quantity, date);
        results.push(order);
    }

    return results;
}

/**
 * Get all orders for a specific date
 */
export async function getOrdersByDate(date: string): Promise<Order[]> {
    return db.select()
        .from(orders)
        .where(eq(orders.orderDate, date))
        .orderBy(orders.customerName)
        .all();
}

/**
 * Get orders for a date range
 */
export async function getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    return db.select()
        .from(orders)
        .where(between(orders.orderDate, startDate, endDate))
        .orderBy(orders.orderDate, orders.customerName)
        .all();
}

/**
 * Delete an order by customer name and date
 */
export async function deleteOrder(customerName: string, date: string): Promise<boolean> {
    const result = await db.delete(orders)
        .where(and(
            sql`lower(${orders.customerName}) = lower(${customerName})`,
            eq(orders.orderDate, date)
        ))
        .returning()
        .get();

    return result !== undefined;
}

/**
 * Update order quantity
 */
export async function updateOrder(customerName: string, quantity: number, date: string): Promise<Order | null> {
    const result = await db.update(orders)
        .set({
            quantity,
            updatedAt: sql`datetime('now')`
        })
        .where(and(
            sql`lower(${orders.customerName}) = lower(${customerName})`,
            eq(orders.orderDate, date)
        ))
        .returning()
        .get();

    return result || null;
}

/**
 * Group orders by date (for weekly view)
 */
export function groupOrdersByDate(ordersList: Order[]): Map<string, Order[]> {
    const grouped = new Map<string, Order[]>();

    for (const order of ordersList) {
        const existing = grouped.get(order.orderDate) || [];
        existing.push(order);
        grouped.set(order.orderDate, existing);
    }

    return grouped;
}

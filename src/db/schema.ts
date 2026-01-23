import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const orders = sqliteTable('orders', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerName: text('customer_name').notNull(),
    quantity: integer('quantity').notNull().default(1),
    orderDate: text('order_date').notNull(), // ISO date string: "2026-01-23"
    createdAt: text('created_at').default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

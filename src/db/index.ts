import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { DATABASE_PATH } from '../config.js';
import * as schema from './schema.js';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

// Ensure data directory exists
const dbDir = dirname(DATABASE_PATH);
if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const sqlite = new Database(DATABASE_PATH);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Create database instance with Drizzle
export const db = drizzle(sqlite, { schema });

// Initialize tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    order_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
  
  CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_customer_date ON orders(customer_name COLLATE NOCASE, order_date);
`);

console.log('✅ Database initialized');

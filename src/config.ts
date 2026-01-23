import { config } from 'dotenv';
config();

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const ADMIN_USER_ID = process.env.ADMIN_USER_ID ? Number(process.env.ADMIN_USER_ID) : null;
export const DATABASE_PATH = process.env.DATABASE_PATH || './data/orders.db';
export const NODE_ENV = process.env.NODE_ENV || 'development';

if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN is required. Please set it in .env file');
    process.exit(1);
}

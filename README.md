# 🍱 Lunch Order Bot

A Telegram bot for managing lunch orders for your team.

## Features

- ✅ Add orders for today, tomorrow, or specific dates
- ✅ Support for date ranges (e.g., Monday to Friday)
- ✅ View orders by date or weekly summary
- ✅ Update or delete existing orders
- ✅ SQLite database for persistent storage

## Quick Start

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Copy the bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Configure the Bot

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your bot token
nano .env
```

Set your bot token in `.env`:
```
BOT_TOKEN=your_telegram_bot_token_here
```

Optional: Add your Telegram user ID to restrict bot access:
```
ADMIN_USER_ID=your_telegram_user_id
```

> 💡 To get your user ID, message [@userinfobot](https://t.me/userinfobot) on Telegram

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Bot

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

### 5. Start Using!

Open your bot in Telegram and send `/start`

## Commands

### Adding Orders
| Command | Description |
|---------|-------------|
| `/order Budi 2` | Add 2 portions for Budi today |
| `/order Siti 1 tomorrow` | Add 1 portion for Siti tomorrow |
| `/order Andi 1 mon` | Add 1 portion for Andi next Monday |
| `/order Dewi 1 25-01` | Add 1 portion for Dewi on Jan 25 |
| `/order Eka 1 mon-fri` | Add 1 portion for Eka Mon-Fri |

### Viewing Orders
| Command | Description |
|---------|-------------|
| `/today` | Show today's orders |
| `/tomorrow` | Show tomorrow's orders |
| `/check monday` | Show orders for next Monday |
| `/check 25-01` | Show orders for Jan 25 |
| `/week` | Show this week's orders |

### Managing Orders
| Command | Description |
|---------|-------------|
| `/update Budi 3` | Change Budi's order to 3 portions |
| `/update Siti 2 tomorrow` | Change Siti's tomorrow order |
| `/delete Budi` | Delete Budi's order for today |
| `/delete Siti tomorrow` | Delete Siti's tomorrow order |

### Help
| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/help` | Show all commands |

## Date Formats

The bot understands various date formats:

- `today` - Today's date
- `tomorrow` - Tomorrow's date
- `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun` - Next occurrence of that day
- `monday`, `tuesday`, etc. - Full day names work too
- `25-01` - Day-month format
- `25/01` - Day/month format
- `25 Jan` - Day and month name
- `mon-fri` - Date range (Monday to Friday)

## Project Structure

```
lunch-order-bot/
├── src/
│   ├── index.ts          # Entry point
│   ├── bot.ts            # Bot configuration
│   ├── config.ts         # Environment variables
│   ├── commands/         # Command handlers
│   ├── services/         # Business logic
│   ├── db/               # Database
│   └── utils/            # Utilities
├── data/                 # SQLite database
├── .env                  # Environment variables
└── package.json
```

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Telegram SDK**: Telegraf
- **Database**: SQLite (via Drizzle ORM)
- **Date Handling**: Day.js

## License

ISC

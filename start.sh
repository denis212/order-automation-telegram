#!/bin/bash

echo "🔄 Pulling latest database from GitHub..."
git pull

if [ $? -eq 0 ]; then
    echo "✅ Database synced successfully!"
    echo "🚀 Starting bot..."
    yarn dev
else
    echo "❌ Failed to pull from GitHub. Please resolve conflicts manually."
    exit 1
fi

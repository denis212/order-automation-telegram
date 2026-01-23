#!/bin/bash

echo "💾 Saving database changes..."

# Check if there are changes to commit
if git diff --quiet data/ && git diff --cached --quiet data/; then
    echo "ℹ️  No database changes to commit"
    exit 0
fi

# Add database files
git add data/

# Commit with timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m "update: sync database - $TIMESTAMP"

if [ $? -eq 0 ]; then
    echo "📤 Pushing to GitHub..."
    git push
    
    if [ $? -eq 0 ]; then
        echo "✅ Database synced successfully!"
    else
        echo "❌ Failed to push to GitHub. Please try again later."
        exit 1
    fi
else
    echo "❌ Failed to commit changes"
    exit 1
fi

#!/bin/bash

echo "🚀 Starting deployment setup..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma db push --accept-data-loss

# Seed the database
echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Deployment setup complete!"
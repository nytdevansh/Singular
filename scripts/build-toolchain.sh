#!/bin/bash
# scripts/build-toolchain.sh

set -e

echo "🔷 Building Singular JSX-in-.ts Toolchain"

# Clean all packages
echo "🧹 Cleaning previous builds..."
pnpm -r run clean

# Build in correct dependency order
echo "📦 Building @singular/babel-plugin-jsx..."
pnpm --filter @singular/babel-plugin-jsx build

echo "📦 Building singular-core..."  
pnpm --filter singular-core build

echo "📦 Building @singular/vite-preset-jsx..."
pnpm --filter @singular/vite-preset-jsx build

echo "✅ Toolchain build complete!"

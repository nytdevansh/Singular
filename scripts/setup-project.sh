# scripts/setup-project.sh
#!/bin/bash

set -e

echo "🔷 Setting up Singular Framework project..."

# Install root dependencies
echo "📥 Installing dependencies..."
pnpm install

# Build toolchain
echo "🔨 Building toolchain..."
./scripts/build-toolchain.sh

# Setup example apps
echo "🔗 Linking workspace dependencies..."
pnpm --filter counter-app-example install

echo "✅ Project setup complete!"
echo ""
echo "To start developing:"
echo "  pnpm dev:counter    # Start counter app"
echo "  pnpm build:counter  # Build counter app"
echo ""
echo "Key files created:"
echo "  packages/babel-plugin-jsx/src/index.ts      - JSX → h() transform"
echo "  packages/vite-preset-jsx/src/index.ts       - Vite integration"  
echo "  packages/core/src/jsx/runtime.ts            - JSX runtime (h, Fragment)"
echo "  packages/core/src/jsx/global.d.ts           - Global JSX types"
echo "  examples/counter-app/src/App.ts             - JSX in .ts file!"

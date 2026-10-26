# scripts/dev-counter.sh
#!/bin/bash

echo "🚀 Starting counter app with JSX-in-.ts support..."

# Ensure toolchain is built
./scripts/build-toolchain.sh

# Start development server
pnpm --filter counter-app-example dev

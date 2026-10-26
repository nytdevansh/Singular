# Dockerfile for testing the setup
# Dockerfile
FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/*/package.json ./packages/*/
COPY examples/*/package.json ./examples/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build toolchain
RUN chmod +x scripts/*.sh
RUN ./scripts/build-toolchain.sh

# Build example app  
RUN pnpm --filter counter-app-example build

EXPOSE 4173

CMD ["pnpm", "--filter", "counter-app-example", "preview", "--host", "0.0.0.0"]



# Backend image shared by the api / worker / bot services.
# These run TypeScript directly via tsx (no build step), so dev deps are kept.
FROM node:20-bookworm-slim

# Prisma's query engine needs openssl + ca-certificates.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# Install workspace deps — copy manifests first for better layer caching.
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/bot/package.json apps/bot/
COPY apps/web/package.json apps/web/
# tsx + typescript + prisma are devDependencies but required at runtime.
RUN npm ci --include=dev

# Copy the rest of the sources.
COPY . .

# Generate the Prisma client (no DB connection required).
RUN npm run db:generate

# Default to the API; docker-compose overrides `command` for worker/bot/migrate.
CMD ["npm", "run", "start", "-w", "@cops/api"]

# --- build the static site ---
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/bot/package.json apps/bot/
COPY apps/web/package.json apps/web/
RUN npm ci --include=dev

COPY . .
RUN npm run build -w @cops/web

# --- serve with nginx ---
FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80

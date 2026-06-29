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
# Rasterize the OG share image (PNG unfurls reliably on Discord/Twitter/Google).
RUN apt-get update \
  && apt-get install -y --no-install-recommends librsvg2-bin \
  && rm -rf /var/lib/apt/lists/* \
  && rsvg-convert apps/web/public/og.svg -o apps/web/public/og.png
RUN npm run build -w @cops/web

# --- serve with nginx ---
FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80

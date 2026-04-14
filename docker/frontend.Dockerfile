FROM node:20-slim AS builder
RUN npm i -g pnpm@9

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile

COPY packages/shared-types ./packages/shared-types
COPY apps/frontend ./apps/frontend
RUN pnpm --filter frontend build

FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY docker/nginx-frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

FROM node:20-slim AS builder
RUN npm i -g pnpm@9

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/backoffice/package.json ./apps/backoffice/
RUN pnpm install --frozen-lockfile

COPY packages/shared-types ./packages/shared-types
COPY apps/backoffice ./apps/backoffice
RUN pnpm --filter backoffice build

FROM nginx:alpine
COPY --from=builder /app/apps/backoffice/dist /usr/share/nginx/html
COPY docker/nginx-backoffice.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

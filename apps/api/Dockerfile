FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --filter @glam-rapido/api... --frozen-lockfile=false

FROM deps AS build
COPY apps/api apps/api
RUN pnpm --filter @glam-rapido/api db:generate
RUN pnpm --filter @glam-rapido/api build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/package.json apps/api/package.json
COPY --from=build /app/apps/api/prisma apps/api/prisma
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]

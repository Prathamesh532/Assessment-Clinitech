FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json server/package.json
RUN pnpm install --frozen-lockfile --filter @careview/server...
COPY server server
RUN pnpm --filter @careview/server build

FROM node:22-alpine
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/src ./server/src
COPY --from=build /app/server/scripts ./server/scripts
COPY --from=build /app/server/db ./server/db
CMD ["sh", "-c", "cd server && node scripts/migrate.js && node src/server.js"]

FROM node:20-alpine AS base



WORKDIR /app



# npm workspaces: lockfile is at the monorepo root

FROM base AS deps

COPY package.json package-lock.json ./

COPY backend/package.json ./backend/

COPY frontend/package.json ./frontend/

RUN npm ci -w frontend



FROM base AS build

COPY --from=deps /app/node_modules ./node_modules

COPY --from=deps /app/package.json ./package.json

COPY --from=deps /app/package-lock.json ./package-lock.json

COPY --from=deps /app/backend/package.json ./backend/package.json

COPY --from=deps /app/frontend/package.json ./frontend/package.json

COPY frontend ./frontend

WORKDIR /app/frontend

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build



FROM base AS production

WORKDIR /app

ENV NODE_ENV=production

ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs

RUN adduser --system --uid 1001 nextjs

COPY --from=build /app/frontend/public ./public

COPY --from=build --chown=nextjs:nodejs /app/frontend/.next/standalone/frontend ./

COPY --from=build --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]


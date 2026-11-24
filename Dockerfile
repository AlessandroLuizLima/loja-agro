# Imagem da loja. A mesma imagem serve para qualquer cliente:
# o que muda de uma loja para outra são as variáveis de ambiente e o volume /data (banco).

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_PATH=/data/loja.db
RUN addgroup -S loja && adduser -S loja -G loja && mkdir /data && chown loja:loja /data
COPY --from=build --chown=loja:loja /app/.next/standalone ./
COPY --from=build --chown=loja:loja /app/.next/static ./.next/static
COPY --from=build --chown=loja:loja /app/public ./public
USER loja
VOLUME /data
EXPOSE 3000
CMD ["node", "server.js"]

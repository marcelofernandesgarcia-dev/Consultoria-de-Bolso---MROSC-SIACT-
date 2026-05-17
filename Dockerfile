# Stage 1 — build do frontend Vite
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — imagem de produção
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

# Copia artefatos do build e o servidor TS
COPY --from=builder /app/dist ./dist
COPY server.ts tsconfig.json ./

# Cloud Run injeta PORT=8080; o servidor lê process.env.PORT
EXPOSE 8080

CMD ["npx", "tsx", "server.ts"]

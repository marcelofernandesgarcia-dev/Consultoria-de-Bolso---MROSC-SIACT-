# Stage 1 — build do frontend Vite
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Variáveis VITE_* precisam existir em build-time — o Vite as embute no bundle estático
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

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
COPY src/lib ./src/lib

# Cloud Run injeta PORT=8080; o servidor lê process.env.PORT
EXPOSE 8080

CMD ["npx", "tsx", "server.ts"]

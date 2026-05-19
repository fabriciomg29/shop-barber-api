FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copia schema e config antes do source para aproveitar cache de layer
COPY prisma ./prisma
COPY prisma.config.ts ./

# URL fictícia — prisma generate lê só o schema, não conecta ao banco
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

COPY . .
RUN npm run build

# Falha explícita se o build não produziu o arquivo esperado
RUN test -f /app/dist/main.js || (echo "ERRO: dist/main.js não encontrado após nest build" && ls -la /app/dist/ 2>/dev/null && exit 1)


FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
# --ignore-scripts evita que o postinstall do prisma tente gerar o client sem schema
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]

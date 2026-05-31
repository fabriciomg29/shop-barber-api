#!/bin/sh
# Entrypoint de desenvolvimento: regenera o Prisma Client, aplica migrations,
# popula o seed (idempotente — usa upsert) e inicia a API em watch mode.
# para tudo se qualquer comando falhar
set -e

echo "🔧 Gerando Prisma Client..."
npx prisma generate

echo "🔄 Aplicando migrations..."
npx prisma migrate deploy

echo "🌱 Aplicando seed..."
# Compila seed.ts -> seed.js (e mocks) e executa, sem depender de artefato commitado
npm run seed:build
node prisma/seed.js

echo "🚀 Iniciando API em modo watch..."
exec npm run start:dev

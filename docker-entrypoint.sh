#!/bin/sh
# para tudo se qualquer comando falhar
set -e

echo "🔄 Aplicando migrations..."
#Aplica as migrations
npx prisma migrate deploy
echo "🌱 Aplicando seed..."

#Popula o banco com dados iniciais
node prisma/seed.js
echo "🚀 Iniciando API..."

#Inicia a aplicacao
exec node dist/main.js

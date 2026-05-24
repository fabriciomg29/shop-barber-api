-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "dia_semana" AS ENUM ('dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab');

-- CreateEnum
CREATE TYPE "jornada_tipo" AS ENUM ('off', 'trabalha');

-- CreateEnum
CREATE TYPE "role_usuario" AS ENUM ('dono', 'barbeiro');

-- CreateEnum
CREATE TYPE "status_agendamento" AS ENUM ('confirmado', 'aguardando', 'em_cadeira', 'concluido', 'bloqueado', 'nao_compareceu', 'encaixe');

-- CreateEnum
CREATE TYPE "origem_agendamento" AS ENUM ('cliente_online', 'tablet', 'encaixe', 'recorrencia');

-- CreateEnum
CREATE TYPE "forma_pagamento" AS ENUM ('pix', 'credito', 'debito', 'dinheiro');

-- CreateEnum
CREATE TYPE "status_encaixe" AS ENUM ('aguardando', 'alocado', 'cancelado');

-- CreateEnum
CREATE TYPE "status_solicitacao_troca" AS ENUM ('pendente', 'aprovada', 'recusada');

-- CreateEnum
CREATE TYPE "tipo_produto" AS ENUM ('insumo', 'venda');

-- CreateEnum
CREATE TYPE "tipo_movimentacao_estoque" AS ENUM ('entrada', 'saida', 'ajuste');

-- CreateEnum
CREATE TYPE "origem_movimentacao" AS ENUM ('atendimento', 'compra', 'ajuste_manual', 'venda_avulsa');

-- CreateEnum
CREATE TYPE "status_pedido_fornecedor" AS ENUM ('gerado', 'enviado', 'recebido');

-- CreateEnum
CREATE TYPE "origem_check_in" AS ENUM ('app', 'tablet', 'manual');

-- CreateEnum
CREATE TYPE "status_notificacao" AS ENUM ('fila', 'enviado', 'falha', 'lido');

-- CreateEnum
CREATE TYPE "tipo_notificacao" AS ENUM ('confirmacao', 'lembrete', 'cancelamento', 'remarcacao', 'reativacao', 'pos_atendimento', 'aniversario');

-- CreateTable
CREATE TABLE "barbearia" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "cidade" TEXT NOT NULL,
    "telefone" TEXT,
    "instagram" TEXT,
    "cancelamento_min_horas" SMALLINT NOT NULL DEFAULT 2,
    "remarcacao_min_horas" SMALLINT NOT NULL DEFAULT 2,
    "lembrete_whatsapp_horas" SMALLINT NOT NULL DEFAULT 1,
    "fidelidade_selos_necessarios" SMALLINT NOT NULL DEFAULT 10,
    "fidelidade_recompensa" TEXT NOT NULL DEFAULT 'Corte grátis',
    "fidelidade_dias_inatividade" SMALLINT NOT NULL DEFAULT 60,
    "meta_diaria" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "meta_mensal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "horarios_funcionamento" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barbearia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "role" "role_usuario" NOT NULL DEFAULT 'barbeiro',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barbeiro" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "usuario_id" UUID,
    "nome" TEXT NOT NULL,
    "apelido" TEXT NOT NULL,
    "iniciais" VARCHAR(3) NOT NULL,
    "papel" TEXT,
    "foto_url" TEXT,
    "tom_de_pele" VARCHAR(7),
    "anos_de_oficio" SMALLINT NOT NULL DEFAULT 0,
    "comissao_percentual" DECIMAL(5,2) NOT NULL DEFAULT 50,
    "meta_mensal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "especialidades" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avaliacao_media" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_avaliacoes" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barbeiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jornada_barbeiro" (
    "barbeiro_id" UUID NOT NULL,
    "dia_semana" "dia_semana" NOT NULL,
    "tipo" "jornada_tipo" NOT NULL DEFAULT 'trabalha',
    "inicio" TIME,
    "fim" TIME,

    CONSTRAINT "jornada_barbeiro_pkey" PRIMARY KEY ("barbeiro_id","dia_semana")
);

-- CreateTable
CREATE TABLE "servico" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "duracao_min" SMALLINT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "icone" TEXT,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barbeiro_servico" (
    "barbeiro_id" UUID NOT NULL,
    "servico_id" UUID NOT NULL,

    CONSTRAINT "barbeiro_servico_pkey" PRIMARY KEY ("barbeiro_id","servico_id")
);

-- CreateTable
CREATE TABLE "fornecedor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "fornecedor_id" UUID,
    "nome" TEXT NOT NULL,
    "marca" TEXT,
    "tipo" "tipo_produto" NOT NULL DEFAULT 'insumo',
    "consumivel" BOOLEAN NOT NULL DEFAULT false,
    "estoque_atual" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "estoque_minimo" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "preco_custo" DECIMAL(10,2),
    "preco_venda" DECIMAL(10,2),
    "ultima_compra" DATE,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumo_servico_produto" (
    "servico_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL DEFAULT 1,

    CONSTRAINT "consumo_servico_produto_pkey" PRIMARY KEY ("servico_id","produto_id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "iniciais" VARCHAR(3),
    "telefone" TEXT,
    "email" TEXT,
    "data_nascimento" DATE,
    "observacoes" TEXT,
    "barbeiro_preferido_id" UUID,
    "selos_fidelidade" SMALLINT NOT NULL DEFAULT 0,
    "recompensa_pendente" BOOLEAN NOT NULL DEFAULT false,
    "visitas" INTEGER NOT NULL DEFAULT 0,
    "ultima_visita" DATE,
    "inativo_desde" DATE,
    "token" TEXT NOT NULL,
    "consentimento_lgpd" BOOLEAN NOT NULL DEFAULT false,
    "consentimento_em" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "barbeiro_id" UUID NOT NULL,
    "cliente_id" UUID,
    "servico_id" UUID,
    "data" DATE NOT NULL,
    "inicio" TIME NOT NULL,
    "fim" TIME NOT NULL,
    "status" "status_agendamento" NOT NULL DEFAULT 'confirmado',
    "preco_snapshot" DECIMAL(10,2),
    "observacao" TEXT,
    "origem" "origem_agendamento" NOT NULL DEFAULT 'cliente_online',
    "token_agendamento" TEXT,
    "whatsapp_enviado" BOOLEAN NOT NULL DEFAULT false,
    "lembrete_enviado_em" TIMESTAMPTZ,
    "cancelado_em" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encaixe" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "cliente_nome" TEXT NOT NULL,
    "telefone" TEXT,
    "servico_id" UUID NOT NULL,
    "barbeiro_preferido_id" UUID,
    "status" "status_encaixe" NOT NULL DEFAULT 'aguardando',
    "posicao" SMALLINT NOT NULL,
    "estimativa_min" SMALLINT,
    "chegou_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alocado_em" TIMESTAMPTZ,
    "agendamento_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encaixe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacao_troca" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agendamento_id" UUID NOT NULL,
    "de_barbeiro_id" UUID NOT NULL,
    "para_barbeiro_id" UUID NOT NULL,
    "motivo" TEXT,
    "status" "status_solicitacao_troca" NOT NULL DEFAULT 'pendente',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitacao_troca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caixa" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "data" DATE NOT NULL,
    "aberto_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechado_em" TIMESTAMPTZ,
    "aberto_por_id" UUID NOT NULL,
    "fechado_por_id" UUID,
    "troco_inicial" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_bruto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_gorjetas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_atendimentos" SMALLINT NOT NULL DEFAULT 0,
    "comissoes_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_pix" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_credito" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_debito" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_dinheiro" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "observacoes_fechamento" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "agendamento_id" UUID,
    "caixa_id" UUID,
    "barbeiro_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "valor_bruto" DECIMAL(10,2) NOT NULL,
    "gorjeta" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "forma_pagamento" "forma_pagamento" NOT NULL,
    "comissao_calculada" DECIMAL(10,2) NOT NULL,
    "comissao_paga" BOOLEAN NOT NULL DEFAULT false,
    "avaliacao_nota" SMALLINT,
    "avaliacao_comentario" TEXT,
    "avaliacao_em" TIMESTAMPTZ,
    "finalizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimento_servico" (
    "atendimento_id" UUID NOT NULL,
    "servico_id" UUID NOT NULL,
    "preco_snapshot" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "atendimento_servico_pkey" PRIMARY KEY ("atendimento_id","servico_id")
);

-- CreateTable
CREATE TABLE "atendimento_produto" (
    "atendimento_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "preco_snapshot" DECIMAL(10,2),

    CONSTRAINT "atendimento_produto_pkey" PRIMARY KEY ("atendimento_id","produto_id")
);

-- CreateTable
CREATE TABLE "comissao_pagamento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "barbeiro_id" UUID NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "forma_pagamento" "forma_pagamento" NOT NULL,
    "periodo_inicio" DATE NOT NULL,
    "periodo_fim" DATE NOT NULL,
    "registrado_por" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comissao_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacao_estoque" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "produto_id" UUID NOT NULL,
    "tipo" "tipo_movimentacao_estoque" NOT NULL,
    "origem" "origem_movimentacao" NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "estoque_antes" DECIMAL(10,3) NOT NULL,
    "estoque_depois" DECIMAL(10,3) NOT NULL,
    "atendimento_id" UUID,
    "pedido_id" UUID,
    "observacao" TEXT,
    "criado_por" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacao_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_fornecedor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "fornecedor_id" UUID NOT NULL,
    "status" "status_pedido_fornecedor" NOT NULL DEFAULT 'gerado',
    "criado_por" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_fornecedor_item" (
    "pedido_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "custo_unitario" DECIMAL(10,2),

    CONSTRAINT "pedido_fornecedor_item_pkey" PRIMARY KEY ("pedido_id","produto_id")
);

-- CreateTable
CREATE TABLE "ponto_dia" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbeiro_id" UUID NOT NULL,
    "data" DATE NOT NULL,
    "check_in" TIME,
    "check_out" TIME,
    "origem_check_in" "origem_check_in",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ponto_dia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunicado" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "autor_id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunicado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunicado_leitura" (
    "comunicado_id" UUID NOT NULL,
    "barbeiro_id" UUID NOT NULL,
    "lido_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunicado_leitura_pkey" PRIMARY KEY ("comunicado_id","barbeiro_id")
);

-- CreateTable
CREATE TABLE "notificacao_whatsapp" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barbearia_id" UUID NOT NULL,
    "agendamento_id" UUID,
    "cliente_id" UUID,
    "para_telefone" TEXT NOT NULL,
    "tipo" "tipo_notificacao" NOT NULL,
    "template" TEXT NOT NULL,
    "variaveis" JSONB NOT NULL DEFAULT '{}',
    "status" "status_notificacao" NOT NULL DEFAULT 'fila',
    "erro_mensagem" TEXT,
    "enviado_em" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacao_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "idx_usuario_barbearia" ON "usuario"("barbearia_id");

-- CreateIndex
CREATE INDEX "idx_barbeiro_barbearia" ON "barbeiro"("barbearia_id");

-- CreateIndex
CREATE INDEX "idx_barbeiro_usuario" ON "barbeiro"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_servico_barbearia" ON "servico"("barbearia_id");

-- CreateIndex
CREATE UNIQUE INDEX "servico_barbearia_id_slug_key" ON "servico"("barbearia_id", "slug");

-- CreateIndex
CREATE INDEX "idx_fornecedor_barbearia" ON "fornecedor"("barbearia_id");

-- CreateIndex
CREATE INDEX "idx_produto_barbearia" ON "produto"("barbearia_id");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_token_key" ON "cliente"("token");

-- CreateIndex
CREATE INDEX "idx_cliente_barbearia" ON "cliente"("barbearia_id");

-- CreateIndex
CREATE INDEX "idx_cliente_token" ON "cliente"("token");

-- CreateIndex
CREATE INDEX "idx_cliente_telefone" ON "cliente"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "agendamento_token_agendamento_key" ON "agendamento"("token_agendamento");

-- CreateIndex
CREATE INDEX "idx_agendamento_barbeiro_data" ON "agendamento"("barbeiro_id", "data");

-- CreateIndex
CREATE INDEX "idx_agendamento_barbearia_data" ON "agendamento"("barbearia_id", "data");

-- CreateIndex
CREATE INDEX "idx_agendamento_cliente" ON "agendamento"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_agendamento_status" ON "agendamento"("status");

-- CreateIndex
CREATE INDEX "idx_encaixe_barbearia_status" ON "encaixe"("barbearia_id", "status");

-- CreateIndex
CREATE INDEX "idx_caixa_barbearia_data" ON "caixa"("barbearia_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "caixa_barbearia_id_data_key" ON "caixa"("barbearia_id", "data");

-- CreateIndex
CREATE INDEX "idx_atendimento_barbeiro" ON "atendimento"("barbeiro_id");

-- CreateIndex
CREATE INDEX "idx_atendimento_cliente" ON "atendimento"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_atendimento_caixa" ON "atendimento"("caixa_id");

-- CreateIndex
CREATE INDEX "idx_atendimento_barbearia_data" ON "atendimento"("barbearia_id", "finalizado_em");

-- CreateIndex
CREATE INDEX "idx_comissao_pagamento_barbeiro" ON "comissao_pagamento"("barbeiro_id", "periodo_fim");

-- CreateIndex
CREATE INDEX "idx_movimentacao_produto" ON "movimentacao_estoque"("produto_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_pedido_fornecedor_barbearia" ON "pedido_fornecedor"("barbearia_id");

-- CreateIndex
CREATE INDEX "idx_ponto_barbeiro_data" ON "ponto_dia"("barbeiro_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "ponto_dia_barbeiro_id_data_key" ON "ponto_dia"("barbeiro_id", "data");

-- CreateIndex
CREATE INDEX "idx_comunicado_barbearia" ON "comunicado"("barbearia_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notificacao_barbearia" ON "notificacao_whatsapp"("barbearia_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notificacao_agendamento" ON "notificacao_whatsapp"("agendamento_id");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbeiro" ADD CONSTRAINT "barbeiro_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbeiro" ADD CONSTRAINT "barbeiro_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jornada_barbeiro" ADD CONSTRAINT "jornada_barbeiro_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "barbeiro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servico" ADD CONSTRAINT "servico_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbeiro_servico" ADD CONSTRAINT "barbeiro_servico_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "barbeiro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbeiro_servico" ADD CONSTRAINT "barbeiro_servico_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor" ADD CONSTRAINT "fornecedor_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_servico_produto" ADD CONSTRAINT "consumo_servico_produto_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_servico_produto" ADD CONSTRAINT "consumo_servico_produto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_barbeiro_preferido_id_fkey" FOREIGN KEY ("barbeiro_preferido_id") REFERENCES "barbeiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "barbeiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encaixe" ADD CONSTRAINT "encaixe_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encaixe" ADD CONSTRAINT "encaixe_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encaixe" ADD CONSTRAINT "encaixe_barbeiro_preferido_id_fkey" FOREIGN KEY ("barbeiro_preferido_id") REFERENCES "barbeiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encaixe" ADD CONSTRAINT "encaixe_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacao_troca" ADD CONSTRAINT "solicitacao_troca_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "agendamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacao_troca" ADD CONSTRAINT "solicitacao_troca_de_barbeiro_id_fkey" FOREIGN KEY ("de_barbeiro_id") REFERENCES "barbeiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacao_troca" ADD CONSTRAINT "solicitacao_troca_para_barbeiro_id_fkey" FOREIGN KEY ("para_barbeiro_id") REFERENCES "barbeiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixa" ADD CONSTRAINT "caixa_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixa" ADD CONSTRAINT "caixa_aberto_por_id_fkey" FOREIGN KEY ("aberto_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixa" ADD CONSTRAINT "caixa_fechado_por_id_fkey" FOREIGN KEY ("fechado_por_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento" ADD CONSTRAINT "atendimento_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento" ADD CONSTRAINT "atendimento_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento" ADD CONSTRAINT "atendimento_caixa_id_fkey" FOREIGN KEY ("caixa_id") REFERENCES "caixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento" ADD CONSTRAINT "atendimento_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "barbeiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento" ADD CONSTRAINT "atendimento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento_servico" ADD CONSTRAINT "atendimento_servico_atendimento_id_fkey" FOREIGN KEY ("atendimento_id") REFERENCES "atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento_servico" ADD CONSTRAINT "atendimento_servico_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento_produto" ADD CONSTRAINT "atendimento_produto_atendimento_id_fkey" FOREIGN KEY ("atendimento_id") REFERENCES "atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento_produto" ADD CONSTRAINT "atendimento_produto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissao_pagamento" ADD CONSTRAINT "comissao_pagamento_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissao_pagamento" ADD CONSTRAINT "comissao_pagamento_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "barbeiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissao_pagamento" ADD CONSTRAINT "comissao_pagamento_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao_estoque" ADD CONSTRAINT "movimentacao_estoque_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao_estoque" ADD CONSTRAINT "movimentacao_estoque_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao_estoque" ADD CONSTRAINT "movimentacao_estoque_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido_fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_fornecedor" ADD CONSTRAINT "pedido_fornecedor_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_fornecedor" ADD CONSTRAINT "pedido_fornecedor_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_fornecedor" ADD CONSTRAINT "pedido_fornecedor_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_fornecedor_item" ADD CONSTRAINT "pedido_fornecedor_item_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido_fornecedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_fornecedor_item" ADD CONSTRAINT "pedido_fornecedor_item_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ponto_dia" ADD CONSTRAINT "ponto_dia_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "barbeiro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicado" ADD CONSTRAINT "comunicado_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicado" ADD CONSTRAINT "comunicado_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicado_leitura" ADD CONSTRAINT "comunicado_leitura_comunicado_id_fkey" FOREIGN KEY ("comunicado_id") REFERENCES "comunicado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicado_leitura" ADD CONSTRAINT "comunicado_leitura_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "barbeiro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacao_whatsapp" ADD CONSTRAINT "notificacao_whatsapp_barbearia_id_fkey" FOREIGN KEY ("barbearia_id") REFERENCES "barbearia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacao_whatsapp" ADD CONSTRAINT "notificacao_whatsapp_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacao_whatsapp" ADD CONSTRAINT "notificacao_whatsapp_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Régia Barbershop — DDL Base
-- PostgreSQL 15+ (Supabase-compatible)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE dia_semana AS ENUM (
  'dom','seg','ter','qua','qui','sex','sab'
);

CREATE TYPE jornada_tipo AS ENUM ('off','trabalha');

CREATE TYPE role_usuario AS ENUM ('dono','barbeiro');

CREATE TYPE status_agendamento AS ENUM (
  'confirmado',
  'aguardando',
  'em_cadeira',
  'concluido',
  'bloqueado',
  'nao_compareceu',
  'encaixe'
);

CREATE TYPE origem_agendamento AS ENUM (
  'cliente_online',
  'tablet',
  'encaixe',
  'recorrencia'
);

CREATE TYPE forma_pagamento AS ENUM ('pix','credito','debito','dinheiro');

CREATE TYPE status_encaixe AS ENUM ('aguardando','alocado','cancelado');

CREATE TYPE status_solicitacao_troca AS ENUM ('pendente','aprovada','recusada');

CREATE TYPE tipo_produto AS ENUM ('insumo','venda');

CREATE TYPE tipo_movimentacao_estoque AS ENUM ('entrada','saida','ajuste');

CREATE TYPE origem_movimentacao AS ENUM (
  'atendimento','compra','ajuste_manual','venda_avulsa'
);

CREATE TYPE status_pedido_fornecedor AS ENUM ('gerado','enviado','recebido');

CREATE TYPE origem_check_in AS ENUM ('app','tablet','manual');

CREATE TYPE status_notificacao AS ENUM ('fila','enviado','falha','lido');

CREATE TYPE tipo_notificacao AS ENUM (
  'confirmacao',
  'lembrete',
  'cancelamento',
  'remarcacao',
  'reativacao',
  'pos_atendimento',
  'aniversario'
);

-- ============================================================
-- HELPER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- BARBEARIA
-- ============================================================

CREATE TABLE barbearia (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                          TEXT NOT NULL,
  endereco                      TEXT,
  cidade                        TEXT NOT NULL,
  telefone                      TEXT,
  instagram                     TEXT,
  cancelamento_min_horas        SMALLINT NOT NULL DEFAULT 2,
  remarcacao_min_horas          SMALLINT NOT NULL DEFAULT 2,
  lembrete_whatsapp_horas       SMALLINT NOT NULL DEFAULT 1,
  fidelidade_selos_necessarios  SMALLINT NOT NULL DEFAULT 10,
  fidelidade_recompensa         TEXT NOT NULL DEFAULT 'Corte grátis',
  fidelidade_dias_inatividade   SMALLINT NOT NULL DEFAULT 60,
  meta_diaria                   NUMERIC(10,2) NOT NULL DEFAULT 0,
  meta_mensal                   NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- {"seg":{"abre":"10:00","fecha":"21:00"}, "dom": null, ...}
  horarios_funcionamento        JSONB NOT NULL DEFAULT '{}',
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER barbearia_updated_at
  BEFORE UPDATE ON barbearia
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- USUARIO (complementa auth.users do Supabase)
-- ============================================================

CREATE TABLE usuario (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id  UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  nome          TEXT NOT NULL,
  role          role_usuario NOT NULL DEFAULT 'barbeiro',
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER usuario_updated_at
  BEFORE UPDATE ON usuario
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_usuario_barbearia ON usuario(barbearia_id);

-- ============================================================
-- BARBEIRO
-- ============================================================

CREATE TABLE barbeiro (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id          UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  usuario_id            UUID REFERENCES usuario(id) ON DELETE SET NULL,
  nome                  TEXT NOT NULL,
  apelido               TEXT NOT NULL,
  iniciais              VARCHAR(3) NOT NULL,
  papel                 TEXT,                       -- "Master Barber · Sócio"
  foto_url              TEXT,                       -- null → Dicebear placeholder
  tom_de_pele           VARCHAR(7),                 -- hex "#A07850"
  anos_de_oficio        SMALLINT NOT NULL DEFAULT 0,
  comissao_percentual   NUMERIC(5,2) NOT NULL DEFAULT 50
                          CHECK (comissao_percentual BETWEEN 0 AND 100),
  meta_mensal           NUMERIC(10,2) NOT NULL DEFAULT 0,
  especialidades        TEXT[] NOT NULL DEFAULT '{}',
  avaliacao_media       NUMERIC(3,2) NOT NULL DEFAULT 0
                          CHECK (avaliacao_media BETWEEN 0 AND 5),
  total_avaliacoes      INTEGER NOT NULL DEFAULT 0,
  ativo                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER barbeiro_updated_at
  BEFORE UPDATE ON barbeiro
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_barbeiro_barbearia ON barbeiro(barbearia_id);
CREATE INDEX idx_barbeiro_usuario ON barbeiro(usuario_id);

-- ============================================================
-- JORNADA DO BARBEIRO
-- Representa Record<DiaSemana, JornadaDia> do schema TS.
-- ============================================================

CREATE TABLE jornada_barbeiro (
  barbeiro_id   UUID NOT NULL REFERENCES barbeiro(id) ON DELETE CASCADE,
  dia_semana    dia_semana NOT NULL,
  tipo          jornada_tipo NOT NULL DEFAULT 'trabalha',
  inicio        TIME,
  fim           TIME,
  PRIMARY KEY (barbeiro_id, dia_semana),
  CONSTRAINT chk_jornada_horario CHECK (
    (tipo = 'off' AND inicio IS NULL AND fim IS NULL)
    OR (tipo = 'trabalha' AND inicio IS NOT NULL AND fim IS NOT NULL AND inicio < fim)
  )
);

-- ============================================================
-- SERVICO
-- ============================================================

CREATE TABLE servico (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id  UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,    -- 'corte', 'barba', 'corte_barba', etc.
  nome          TEXT NOT NULL,
  duracao_min   SMALLINT NOT NULL CHECK (duracao_min > 0),
  preco         NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  icone         TEXT,             -- lucide icon name
  popular       BOOLEAN NOT NULL DEFAULT FALSE,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (barbearia_id, slug)
);

CREATE TRIGGER servico_updated_at
  BEFORE UPDATE ON servico
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_servico_barbearia ON servico(barbearia_id);

-- ============================================================
-- BARBEIRO × SERVICO
-- ============================================================

CREATE TABLE barbeiro_servico (
  barbeiro_id   UUID NOT NULL REFERENCES barbeiro(id) ON DELETE CASCADE,
  servico_id    UUID NOT NULL REFERENCES servico(id) ON DELETE CASCADE,
  PRIMARY KEY (barbeiro_id, servico_id)
);

-- ============================================================
-- FORNECEDOR (criado antes de produto por dependência)
-- ============================================================

CREATE TABLE fornecedor (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id  UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  contato       TEXT,
  email         TEXT,
  telefone      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER fornecedor_updated_at
  BEFORE UPDATE ON fornecedor
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_fornecedor_barbearia ON fornecedor(barbearia_id);

-- ============================================================
-- PRODUTO (estoque)
-- ============================================================

CREATE TABLE produto (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id    UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  fornecedor_id   UUID REFERENCES fornecedor(id) ON DELETE SET NULL,
  nome            TEXT NOT NULL,
  marca           TEXT,
  tipo            tipo_produto NOT NULL DEFAULT 'insumo',
  consumivel      BOOLEAN NOT NULL DEFAULT FALSE,
  estoque_atual   NUMERIC(10,3) NOT NULL DEFAULT 0,
  estoque_minimo  NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  preco_custo     NUMERIC(10,2),
  preco_venda     NUMERIC(10,2),   -- NULL se consumível interno (não comercializado)
  ultima_compra   DATE,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER produto_updated_at
  BEFORE UPDATE ON produto
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_produto_barbearia ON produto(barbearia_id);
-- índice parcial para o banner de alerta de estoque baixo
CREATE INDEX idx_produto_estoque_baixo
  ON produto(barbearia_id)
  WHERE ativo AND estoque_atual <= estoque_minimo;

-- ============================================================
-- CONSUMO DE PRODUTO POR SERVICO
-- Define decrementos automáticos ao finalizar um atendimento.
-- ============================================================

CREATE TABLE consumo_servico_produto (
  servico_id  UUID NOT NULL REFERENCES servico(id) ON DELETE CASCADE,
  produto_id  UUID NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
  quantidade  NUMERIC(10,3) NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  PRIMARY KEY (servico_id, produto_id)
);

-- ============================================================
-- CLIENTE
-- ============================================================

CREATE TABLE cliente (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id          UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  -- LGPD: nome → 'Cliente removido', telefone → NULL na exclusão
  nome                  TEXT NOT NULL,
  iniciais              VARCHAR(3),
  telefone              TEXT,
  email                 TEXT,
  data_nascimento       DATE,
  observacoes           TEXT,           -- alergias, preferências internas
  barbeiro_preferido_id UUID REFERENCES barbeiro(id) ON DELETE SET NULL,
  selos_fidelidade      SMALLINT NOT NULL DEFAULT 0,
  recompensa_pendente   BOOLEAN NOT NULL DEFAULT FALSE,
  visitas               INTEGER NOT NULL DEFAULT 0,
  ultima_visita         DATE,
  inativo_desde         DATE,           -- alimentado por job periódico
  token                 TEXT NOT NULL UNIQUE,   -- /eu/[token], /agendar/[token]
  consentimento_lgpd    BOOLEAN NOT NULL DEFAULT FALSE,
  consentimento_em      TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER cliente_updated_at
  BEFORE UPDATE ON cliente
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_cliente_barbearia ON cliente(barbearia_id);
CREATE INDEX idx_cliente_token ON cliente(token);
CREATE INDEX idx_cliente_telefone ON cliente(telefone);
CREATE INDEX idx_cliente_ultima_visita ON cliente(barbearia_id, ultima_visita);
CREATE INDEX idx_cliente_inativos
  ON cliente(barbearia_id, inativo_desde)
  WHERE inativo_desde IS NOT NULL;

-- ============================================================
-- AGENDAMENTO
-- ============================================================

CREATE TABLE agendamento (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id          UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  barbeiro_id           UUID NOT NULL REFERENCES barbeiro(id),
  cliente_id            UUID REFERENCES cliente(id) ON DELETE SET NULL,
  servico_id            UUID REFERENCES servico(id),
  data                  DATE NOT NULL,
  inicio                TIME NOT NULL,
  fim                   TIME NOT NULL,
  status                status_agendamento NOT NULL DEFAULT 'confirmado',
  preco_snapshot        NUMERIC(10,2),           -- preço congelado na reserva
  observacao            TEXT,                    -- "Almoço", "Cliente VIP"
  origem                origem_agendamento NOT NULL DEFAULT 'cliente_online',
  token_agendamento     TEXT UNIQUE,             -- para cancelar/remarcar via link
  whatsapp_enviado      BOOLEAN NOT NULL DEFAULT FALSE,
  lembrete_enviado_em   TIMESTAMPTZ,
  cancelado_em          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_agendamento_horario CHECK (inicio < fim),
  -- status 'bloqueado' nunca tem cliente vinculado
  CONSTRAINT chk_bloqueado_sem_cliente CHECK (
    status != 'bloqueado' OR cliente_id IS NULL
  )
);

CREATE TRIGGER agendamento_updated_at
  BEFORE UPDATE ON agendamento
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_agendamento_barbeiro_data ON agendamento(barbeiro_id, data);
CREATE INDEX idx_agendamento_barbearia_data ON agendamento(barbearia_id, data);
CREATE INDEX idx_agendamento_cliente ON agendamento(cliente_id);
CREATE INDEX idx_agendamento_status ON agendamento(status);
CREATE INDEX idx_agendamento_token ON agendamento(token_agendamento);

-- ============================================================
-- ENCAIXE (fila de walk-ins)
-- ============================================================

CREATE TABLE encaixe (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id          UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  cliente_nome          TEXT NOT NULL,
  telefone              TEXT,
  servico_id            UUID NOT NULL REFERENCES servico(id),
  barbeiro_preferido_id UUID REFERENCES barbeiro(id) ON DELETE SET NULL,
  status                status_encaixe NOT NULL DEFAULT 'aguardando',
  posicao               SMALLINT NOT NULL,
  estimativa_min        SMALLINT,
  chegou_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
  alocado_em            TIMESTAMPTZ,
  agendamento_id        UUID REFERENCES agendamento(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_encaixe_barbearia_status ON encaixe(barbearia_id, status);

-- ============================================================
-- SOLICITACAO DE TROCA (entre barbeiros)
-- ============================================================

CREATE TABLE solicitacao_troca (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id    UUID NOT NULL REFERENCES agendamento(id) ON DELETE CASCADE,
  de_barbeiro_id    UUID NOT NULL REFERENCES barbeiro(id),
  para_barbeiro_id  UUID NOT NULL REFERENCES barbeiro(id),
  motivo            TEXT,
  status            status_solicitacao_troca NOT NULL DEFAULT 'pendente',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_troca_barbeiros_distintos CHECK (de_barbeiro_id != para_barbeiro_id)
);

CREATE TRIGGER solicitacao_troca_updated_at
  BEFORE UPDATE ON solicitacao_troca
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- CAIXA (sessão de caixa do dia)
-- ============================================================

CREATE TABLE caixa (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id            UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  data                    DATE NOT NULL,
  aberto_em               TIMESTAMPTZ NOT NULL DEFAULT now(),
  fechado_em              TIMESTAMPTZ,
  aberto_por_id           UUID NOT NULL REFERENCES usuario(id),
  fechado_por_id          UUID REFERENCES usuario(id),
  troco_inicial           NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_bruto             NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_gorjetas          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_atendimentos      SMALLINT NOT NULL DEFAULT 0,
  comissoes_total         NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_pix               NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_credito           NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_debito            NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_dinheiro          NUMERIC(10,2) NOT NULL DEFAULT 0,
  observacoes_fechamento  TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (barbearia_id, data)
);

CREATE INDEX idx_caixa_barbearia_data ON caixa(barbearia_id, data);

-- ============================================================
-- ATENDIMENTO (venda finalizada)
-- ============================================================

CREATE TABLE atendimento (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id        UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  agendamento_id      UUID REFERENCES agendamento(id) ON DELETE SET NULL,
  caixa_id            UUID REFERENCES caixa(id),
  barbeiro_id         UUID NOT NULL REFERENCES barbeiro(id),
  cliente_id          UUID NOT NULL REFERENCES cliente(id),
  valor_bruto         NUMERIC(10,2) NOT NULL CHECK (valor_bruto >= 0),
  gorjeta             NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (gorjeta >= 0),
  forma_pagamento     forma_pagamento NOT NULL,
  comissao_calculada  NUMERIC(10,2) NOT NULL CHECK (comissao_calculada >= 0),
  comissao_paga       BOOLEAN NOT NULL DEFAULT FALSE,
  avaliacao_nota      SMALLINT CHECK (avaliacao_nota BETWEEN 1 AND 5),
  avaliacao_comentario TEXT,
  avaliacao_em        TIMESTAMPTZ,
  finalizado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_atendimento_barbeiro ON atendimento(barbeiro_id);
CREATE INDEX idx_atendimento_cliente ON atendimento(cliente_id);
CREATE INDEX idx_atendimento_caixa ON atendimento(caixa_id);
CREATE INDEX idx_atendimento_barbearia_data ON atendimento(barbearia_id, finalizado_em);
-- índice parcial: listar comissões pendentes por barbeiro
CREATE INDEX idx_atendimento_comissao_pendente
  ON atendimento(barbeiro_id, finalizado_em)
  WHERE NOT comissao_paga;

-- Serviços realizados (suporte a combos)
CREATE TABLE atendimento_servico (
  atendimento_id  UUID NOT NULL REFERENCES atendimento(id) ON DELETE CASCADE,
  servico_id      UUID NOT NULL REFERENCES servico(id),
  preco_snapshot  NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (atendimento_id, servico_id)
);

-- Produtos consumidos / vendidos no atendimento
CREATE TABLE atendimento_produto (
  atendimento_id  UUID NOT NULL REFERENCES atendimento(id) ON DELETE CASCADE,
  produto_id      UUID NOT NULL REFERENCES produto(id),
  quantidade      NUMERIC(10,3) NOT NULL CHECK (quantidade > 0),
  preco_snapshot  NUMERIC(10,2),
  PRIMARY KEY (atendimento_id, produto_id)
);

-- ============================================================
-- COMISSAO PAGAMENTO (acertos com barbeiros)
-- ============================================================

CREATE TABLE comissao_pagamento (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id    UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  barbeiro_id     UUID NOT NULL REFERENCES barbeiro(id),
  valor           NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  forma_pagamento forma_pagamento NOT NULL,
  periodo_inicio  DATE NOT NULL,
  periodo_fim     DATE NOT NULL,
  registrado_por  UUID NOT NULL REFERENCES usuario(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_periodo CHECK (periodo_inicio <= periodo_fim)
);

CREATE INDEX idx_comissao_pagamento_barbeiro
  ON comissao_pagamento(barbeiro_id, periodo_fim);

-- ============================================================
-- MOVIMENTACAO DE ESTOQUE
-- ============================================================

CREATE TABLE movimentacao_estoque (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id      UUID NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
  tipo            tipo_movimentacao_estoque NOT NULL,
  origem          origem_movimentacao NOT NULL,
  quantidade      NUMERIC(10,3) NOT NULL CHECK (quantidade > 0),
  estoque_antes   NUMERIC(10,3) NOT NULL,
  estoque_depois  NUMERIC(10,3) NOT NULL,
  atendimento_id  UUID REFERENCES atendimento(id) ON DELETE SET NULL,
  pedido_id       UUID,   -- FK adicionada depois de pedido_fornecedor
  observacao      TEXT,
  criado_por      UUID REFERENCES usuario(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_movimentacao_produto ON movimentacao_estoque(produto_id, created_at);

-- ============================================================
-- PEDIDO FORNECEDOR
-- ============================================================

CREATE TABLE pedido_fornecedor (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id  UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES fornecedor(id),
  status        status_pedido_fornecedor NOT NULL DEFAULT 'gerado',
  criado_por    UUID NOT NULL REFERENCES usuario(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER pedido_fornecedor_updated_at
  BEFORE UPDATE ON pedido_fornecedor
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_pedido_fornecedor_barbearia ON pedido_fornecedor(barbearia_id);

CREATE TABLE pedido_fornecedor_item (
  pedido_id       UUID NOT NULL REFERENCES pedido_fornecedor(id) ON DELETE CASCADE,
  produto_id      UUID NOT NULL REFERENCES produto(id),
  quantidade      NUMERIC(10,3) NOT NULL CHECK (quantidade > 0),
  custo_unitario  NUMERIC(10,2),
  PRIMARY KEY (pedido_id, produto_id)
);

-- FK tardia: evitava dependência circular com movimentacao_estoque
ALTER TABLE movimentacao_estoque
  ADD CONSTRAINT fk_movimentacao_pedido
  FOREIGN KEY (pedido_id) REFERENCES pedido_fornecedor(id) ON DELETE SET NULL;

-- ============================================================
-- PONTO DO BARBEIRO (presença diária)
-- ============================================================

CREATE TABLE ponto_dia (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id     UUID NOT NULL REFERENCES barbeiro(id) ON DELETE CASCADE,
  data            DATE NOT NULL,
  check_in        TIME,
  check_out       TIME,
  origem_check_in origem_check_in,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (barbeiro_id, data),
  CONSTRAINT chk_ponto_horario CHECK (
    check_in IS NULL OR check_out IS NULL OR check_in < check_out
  )
);

CREATE TRIGGER ponto_dia_updated_at
  BEFORE UPDATE ON ponto_dia
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_ponto_barbeiro_data ON ponto_dia(barbeiro_id, data);

-- ============================================================
-- COMUNICADO INTERNO
-- ============================================================

CREATE TABLE comunicado (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id  UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  autor_id      UUID NOT NULL REFERENCES usuario(id),
  titulo        TEXT NOT NULL,
  corpo         TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comunicado_barbearia
  ON comunicado(barbearia_id, created_at DESC);

CREATE TABLE comunicado_leitura (
  comunicado_id   UUID NOT NULL REFERENCES comunicado(id) ON DELETE CASCADE,
  barbeiro_id     UUID NOT NULL REFERENCES barbeiro(id) ON DELETE CASCADE,
  lido_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (comunicado_id, barbeiro_id)
);

-- ============================================================
-- NOTIFICACAO WHATSAPP (log de envios)
-- ============================================================

CREATE TABLE notificacao_whatsapp (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id    UUID NOT NULL REFERENCES barbearia(id) ON DELETE CASCADE,
  agendamento_id  UUID REFERENCES agendamento(id) ON DELETE SET NULL,
  cliente_id      UUID REFERENCES cliente(id) ON DELETE SET NULL,
  para_telefone   TEXT NOT NULL,
  tipo            tipo_notificacao NOT NULL,
  template        TEXT NOT NULL,
  variaveis       JSONB NOT NULL DEFAULT '{}',
  status          status_notificacao NOT NULL DEFAULT 'fila',
  erro_mensagem   TEXT,
  enviado_em      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notificacao_barbearia
  ON notificacao_whatsapp(barbearia_id, created_at DESC);
CREATE INDEX idx_notificacao_agendamento
  ON notificacao_whatsapp(agendamento_id);
-- índice parcial: worker de envio processa apenas pendentes
CREATE INDEX idx_notificacao_fila
  ON notificacao_whatsapp(created_at)
  WHERE status = 'fila';

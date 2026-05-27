import {
  PrismaClient,
  DiaSemana,
  JornadaTipo,
  OrigemAgendamento,
  OrigemCheckIn,
  TipoProduto,
  TipoMovimentacaoEstoque,
  OrigemMovimentacao,
  FormaPagamento,
  RoleUsuario,
  StatusAgendamento,
  StatusEncaixe,
} from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
//import type { JornadaDia } from '../lib/types/barbeiro'
import {
  barbearia as mockBarbearia,
  barbeiros as mockBarbeiros,
  servicos as mockServicos,
  clientes as mockClientes,
  tokenCliente,
  agendamentos as mockAgendamentos,
  encaixes as mockEncaixes,
  produtos as mockProdutos,
  movimentacoesProduto,
  historicoPorCliente,
  pontoDia as mockPontoDia,
  comunicados as mockComunicados,
} from '../mocks/seeds/data'
import { JornadaDia } from '../libs/types'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

// ─── IDs estáveis ────────────────────────────────────────────────────────────

const ID = {
  barbearia: 'a0000001-0000-4000-8000-000000000001',
  usuario: {
    caio: 'a0000002-0000-4000-8000-000000000001',
  },
  barbeiro: {
    caio: 'a0000003-0000-4000-8000-000000000001',
    murilo: 'a0000003-0000-4000-8000-000000000002',
    diego: 'a0000003-0000-4000-8000-000000000003',
    ravi: 'a0000003-0000-4000-8000-000000000004',
  },
  servico: {
    corte: 'a0000004-0000-4000-8000-000000000001',
    barba: 'a0000004-0000-4000-8000-000000000002',
    corte_barba: 'a0000004-0000-4000-8000-000000000003',
    degrade: 'a0000004-0000-4000-8000-000000000004',
    pigmentacao: 'a0000004-0000-4000-8000-000000000005',
    sobrancelha: 'a0000004-0000-4000-8000-000000000006',
    acabamento: 'a0000004-0000-4000-8000-000000000007',
  },
  fornecedor: {
    'Forneco Distribuidora': 'a0000005-0000-4000-8000-000000000001',
    'Vico Direto': 'a0000005-0000-4000-8000-000000000002',
    'Importadora Cabral': 'a0000005-0000-4000-8000-000000000003',
    'Atrio Têxtil': 'a0000005-0000-4000-8000-000000000004',
  } as Record<string, string>,
  cliente: {
    c1: 'a0000006-0000-4000-8000-000000000001',
    c2: 'a0000006-0000-4000-8000-000000000002',
    c3: 'a0000006-0000-4000-8000-000000000003',
    c4: 'a0000006-0000-4000-8000-000000000004',
    c5: 'a0000006-0000-4000-8000-000000000005',
    c6: 'a0000006-0000-4000-8000-000000000006',
    c7: 'a0000006-0000-4000-8000-000000000007',
    c8: 'a0000006-0000-4000-8000-000000000008',
    c9: 'a0000006-0000-4000-8000-000000000009',
    c10: 'a0000006-0000-4000-8000-000000000010',
    c11: 'a0000006-0000-4000-8000-000000000011',
    c12: 'a0000006-0000-4000-8000-000000000012',
  } as Record<string, string>,
  produto: {
    p1: 'a0000007-0000-4000-8000-000000000001',
    p2: 'a0000007-0000-4000-8000-000000000002',
    p3: 'a0000007-0000-4000-8000-000000000003',
    p4: 'a0000007-0000-4000-8000-000000000004',
    p5: 'a0000007-0000-4000-8000-000000000005',
    p6: 'a0000007-0000-4000-8000-000000000006',
    p7: 'a0000007-0000-4000-8000-000000000007',
    p8: 'a0000007-0000-4000-8000-000000000008',
  } as Record<string, string>,
  caixa: 'a0000008-0000-4000-8000-000000000001',
  agendamento: {} as Record<string, string>,
  comunicado: {
    'com-1': 'a000000c-0000-4000-8000-000000000001',
    'com-2': 'a000000c-0000-4000-8000-000000000002',
    'com-3': 'a000000c-0000-4000-8000-000000000003',
  } as Record<string, string>,
}

// Gera UUID para cada agendamento com base no índice
mockAgendamentos.forEach((a, i) => {
  ID.agendamento[a.id] = `a0000009-0000-4000-8000-${String(i + 1).padStart(12, '0')}`
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toTime(hhmm: string): Date {
  return new Date(`1970-01-01T${hhmm}:00Z`)
}

function toDate(yyyy_mm_dd: string): Date {
  return new Date(`${yyyy_mm_dd}T00:00:00Z`)
}

const DIA_MAP: Record<string, DiaSemana> = {
  dom: DiaSemana.dom,
  seg: DiaSemana.seg,
  ter: DiaSemana.ter,
  qua: DiaSemana.qua,
  qui: DiaSemana.qui,
  sex: DiaSemana.sex,
  sab: DiaSemana.sab,
}

// Token invertido: clienteId → token
const tokenPorCliente = Object.fromEntries(
  Object.entries(tokenCliente).map(([token, clienteId]) => [clienteId, token]),
)

// Barbeiro UUID por nome (para atendimentos históricos)
const barbeiroPorNome: Record<string, string> = {
  'Caio Bertelli': ID.barbeiro.caio,
  'Murilo Santos': ID.barbeiro.murilo,
  'Diego Moura': ID.barbeiro.diego,
  'Ravi Castro': ID.barbeiro.ravi,
}

// Comissão por barbeiroId
const comissaoPorBarbeiro: Record<string, number> = {
  [ID.barbeiro.caio]: 60,
  [ID.barbeiro.murilo]: 55,
  [ID.barbeiro.diego]: 50,
  [ID.barbeiro.ravi]: 45,
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Barbearia
  await db.barbearia.upsert({
    where: { id: ID.barbearia },
    update: {},
    create: {
      id: ID.barbearia,
      nome: mockBarbearia.nome,
      endereco: mockBarbearia.endereco,
      cidade: mockBarbearia.cidade,
      telefone: mockBarbearia.telefone,
      instagram: mockBarbearia.instagram,
      cancelamentoMinHoras: mockBarbearia.regrasAgendamento.cancelamentoMinHoras,
      remarcacaoMinHoras: mockBarbearia.regrasAgendamento.remarcacaoMinHoras,
      lembreteWhatsappHoras: mockBarbearia.regrasAgendamento.lembreteWhatsappHoras,
      fidelidadeSelosNecessarios: mockBarbearia.configFidelidade.selosNecessarios,
      fidelidadeRecompensa: mockBarbearia.configFidelidade.recompensa,
      fidelidadeDiasInatividade: mockBarbearia.configFidelidade.diasParaInatividade,
      metaDiaria: mockBarbearia.meta.diaria,
      metaMensal: mockBarbearia.meta.mensal,
      horariosFuncionamento: mockBarbearia.horariosFuncionamento as object,
    },
  })
  console.log('  ✓ Barbearia')

  // 2. Usuario (dono)
  const senhaHash = await bcrypt.hash('123456', 10)
  await db.usuario.upsert({
    where: { id: ID.usuario.caio },
    update: { senhaHash },
    create: {
      id: ID.usuario.caio,
      barbeariaId: ID.barbearia,
      email: 'caio@ibirama.com',
      senhaHash,
      nome: 'Caio Bertelli',
      role: RoleUsuario.dono,
    },
  })
  console.log('  ✓ Usuario')

  // 3. Barbeiros
  for (const b of mockBarbeiros) {
    const bid = ID.barbeiro[b.id as keyof typeof ID.barbeiro]
    await db.barbeiro.upsert({
      where: { id: bid },
      update: {},
      create: {
        id: bid,
        barbeariaId: ID.barbearia,
        usuarioId: b.id === 'caio' ? ID.usuario.caio : null,
        nome: b.nome,
        apelido: b.apelido,
        iniciais: b.iniciais,
        papel: b.papel,
        fotoUrl: b.foto ?? null,
        tomDePele: b.tomDePele,
        anosDeOficio: b.anosDeOficio,
        comissaoPercentual: b.comissaoPercentual,
        avaliacaoMedia: b.avaliacaoMedia,
        totalAvaliacoes: b.totalAvaliacoes,
        especialidades: b.especialidades,
        ativo: b.ativo,
      },
    })
  }
  console.log('  ✓ Barbeiros (4)')

  // 4. Serviços
  for (const s of mockServicos) {
    const sid = ID.servico[s.id as keyof typeof ID.servico]
    await db.servico.upsert({
      where: { id: sid },
      update: {},
      create: {
        id: sid,
        barbeariaId: ID.barbearia,
        slug: s.id,
        nome: s.nome,
        duracaoMin: s.duracaoMin,
        preco: s.preco,
        icone: s.icone,
        popular: s.popular ?? false,
        ativo: s.ativo,
      },
    })
  }
  console.log('  ✓ Serviços (7)')

  // 5. BarbeiroServico
  await db.barbeiroServico.deleteMany({ where: { barbeiro: { barbeariaId: ID.barbearia } } })
  for (const b of mockBarbeiros) {
    const bid = ID.barbeiro[b.id as keyof typeof ID.barbeiro]
    for (const sSlug of b.servicosExecuta) {
      const sid = ID.servico[sSlug]
      if (!sid) continue
      await db.barbeiroServico.create({ data: { barbeiroId: bid, servicoId: sid } })
    }
  }
  console.log('  ✓ BarbeiroServico (20)')

  // 6. JornadaBarbeiro
  await db.jornadaBarbeiro.deleteMany({ where: { barbeiro: { barbeariaId: ID.barbearia } } })
  for (const b of mockBarbeiros) {
    const bid = ID.barbeiro[b.id as keyof typeof ID.barbeiro]
    for (const [dia, jornada] of Object.entries(b.jornada) as [string, JornadaDia][]) {
      await db.jornadaBarbeiro.create({
        data: {
          barbeiroId: bid,
          diaSemana: DIA_MAP[dia],
          tipo: jornada.tipo === 'trabalha' ? JornadaTipo.trabalha : JornadaTipo.off,
          inicio: jornada.tipo === 'trabalha' ? toTime(jornada.inicio) : null,
          fim: jornada.tipo === 'trabalha' ? toTime(jornada.fim) : null,
        },
      })
    }
  }
  console.log('  ✓ JornadaBarbeiro (28)')

  // 7. Fornecedores
  const fornecedoresUnicos = Array.from(new Set(mockProdutos.map((p) => p.fornecedor)))
  for (const nome of fornecedoresUnicos) {
    const fid = ID.fornecedor[nome]
    if (!fid) continue
    await db.fornecedor.upsert({
      where: { id: fid },
      update: {},
      create: { id: fid, barbeariaId: ID.barbearia, nome },
    })
  }
  console.log('  ✓ Fornecedores (4)')

  // 8. Produtos
  for (const p of mockProdutos) {
    const pid = ID.produto[p.id as keyof typeof ID.produto]
    const fid = ID.fornecedor[p.fornecedor]
    await db.produto.upsert({
      where: { id: pid },
      update: {},
      create: {
        id: pid,
        barbeariaId: ID.barbearia,
        fornecedorId: fid ?? null,
        nome: p.nome,
        marca: p.marca,
        tipo: p.precoVenda != null ? TipoProduto.venda : TipoProduto.insumo,
        consumivel: p.consumivel,
        estoqueAtual: p.estoque,
        estoqueMinimo: p.estoqueMinimo,
        precoCusto: p.precoCusto,
        precoVenda: p.precoVenda ?? null,
        ultimaCompra: p.ultimaCompra ? toDate(p.ultimaCompra) : null,
        ativo: p.ativo,
      },
    })
  }
  console.log('  ✓ Produtos (8)')

  // 9. Clientes
  for (const c of mockClientes) {
    const cid = ID.cliente[c.id]
    const prefId = c.barbeiroPreferidoId
      ? ID.barbeiro[c.barbeiroPreferidoId as keyof typeof ID.barbeiro]
      : null
    await db.cliente.upsert({
      where: { id: cid },
      update: {},
      create: {
        id: cid,
        barbeariaId: ID.barbearia,
        nome: c.nome,
        iniciais: c.iniciais,
        telefone: c.telefone,
        dataNascimento: c.dataNascimento ? new Date(`1900-${c.dataNascimento}`) : null,
        barbeiroPreferidoId: prefId ?? null,
        selosFidelidade: c.selosFidelidade,
        visitas: c.visitas,
        ultimaVisita: c.ultimaVisita ? toDate(c.ultimaVisita) : null,
        inativoDesde: c.inativoDesde ? toDate(c.inativoDesde) : null,
        token: tokenPorCliente[c.id] ?? `tk-${c.id}`,
        createdAt: new Date(c.criadoEm),
      },
    })
  }
  console.log('  ✓ Clientes (12)')

  // 10. Caixa
  await db.caixa.upsert({
    where: { id: ID.caixa },
    update: {},
    create: {
      id: ID.caixa,
      barbeariaId: ID.barbearia,
      data: toDate('2026-05-14'),
      abertoPorId: ID.usuario.caio,
      trocoInicial: 200,
      totalBruto: 1340,
      totalAtendimentos: 9,
      totalPix: 540,
      totalCredito: 480,
      totalDebito: 180,
      totalDinheiro: 140,
    },
  })
  console.log('  ✓ Caixa')

  // 11. Agendamentos
  const ORIGEM_MAP: Record<string, OrigemAgendamento> = {
    cliente_online: OrigemAgendamento.cliente_online,
    tablet: OrigemAgendamento.tablet,
    encaixe: OrigemAgendamento.encaixe,
    recorrencia: OrigemAgendamento.recorrencia,
  }
  const STATUS_MAP: Record<string, StatusAgendamento> = {
    confirmado: StatusAgendamento.confirmado,
    aguardando: StatusAgendamento.aguardando,
    em_cadeira: StatusAgendamento.em_cadeira,
    concluido: StatusAgendamento.concluido,
    bloqueado: StatusAgendamento.bloqueado,
    nao_compareceu: StatusAgendamento.nao_compareceu,
    encaixe: StatusAgendamento.encaixe,
  }

  for (const a of mockAgendamentos) {
    const aid = ID.agendamento[a.id]
    const bid = ID.barbeiro[a.barbeiroId as keyof typeof ID.barbeiro]
    const cid = a.clienteId ? ID.cliente[a.clienteId] : null
    const sid = a.servicoId ? ID.servico[a.servicoId as keyof typeof ID.servico] : null
    await db.agendamento.upsert({
      where: { id: aid },
      update: {},
      create: {
        id: aid,
        barbeariaId: ID.barbearia,
        barbeiroId: bid,
        clienteId: cid ?? null,
        servicoId: sid ?? null,
        data: toDate(a.data),
        inicio: toTime(a.inicio),
        fim: toTime(a.fim),
        status: STATUS_MAP[a.status],
        precoSnapshot: a.precoSnapshot ?? null,
        observacao: a.observacao ?? null,
        origem: ORIGEM_MAP[a.origemAgendamento],
        whatsappEnviado: a.whatsappEnviado,
        createdAt: new Date(a.criadoEm),
      },
    })
  }
  console.log('  ✓ Agendamentos (27)')

  // 12. Encaixes
  for (const e of mockEncaixes) {
    const sid = ID.servico[e.servicoId as keyof typeof ID.servico]
    await db.encaixe.upsert({
      where: { id: `a000000e-0000-4000-8000-00000000000${e.id.replace('w', '')}` },
      update: {},
      create: {
        id: `a000000e-0000-4000-8000-00000000000${e.id.replace('w', '')}`,
        barbeariaId: ID.barbearia,
        clienteNome: e.clienteNome,
        telefone: e.telefone,
        servicoId: sid,
        status: StatusEncaixe.aguardando,
        posicao: e.posicao,
        estimativaMin: e.estimativaMin,
        chegouEm: new Date(e.chegouEm),
      },
    })
  }
  console.log('  ✓ Encaixes (2)')

  // 13. PontoDia
  const ORIGEM_CI_MAP: Record<string, OrigemCheckIn> = {
    app: OrigemCheckIn.app,
    tablet: OrigemCheckIn.tablet,
    manual: OrigemCheckIn.manual,
  }
  for (const [bId, ponto] of Object.entries(mockPontoDia)) {
    if (!ponto) continue
    const bid = ID.barbeiro[bId as keyof typeof ID.barbeiro]
    await db.pontoDia.upsert({
      where: { barbeiroId_data: { barbeiroId: bid, data: toDate('2026-05-14') } },
      update: {},
      create: {
        barbeiroId: bid,
        data: toDate('2026-05-14'),
        checkIn: ponto.checkIn ? toTime(ponto.checkIn) : null,
        checkOut: ponto.checkOut ? toTime(ponto.checkOut) : null,
        origemCheckIn: ORIGEM_CI_MAP[ponto.origemCheckIn],
      },
    })
  }
  console.log('  ✓ PontoDia (3)')

  // 14. MovimentacoesEstoque
  const ORIGEM_MOV_MAP: Record<string, OrigemMovimentacao> = {
    compra: OrigemMovimentacao.compra,
    venda_avulsa: OrigemMovimentacao.venda_avulsa,
    atendimento: OrigemMovimentacao.atendimento,
    ajuste_manual: OrigemMovimentacao.ajuste_manual,
  }
  function obsToOrigem(obs: string): OrigemMovimentacao {
    if (obs.startsWith('Compra')) return OrigemMovimentacao.compra
    if (obs.includes('Venda avulsa')) return OrigemMovimentacao.venda_avulsa
    if (obs.includes('Consumo')) return OrigemMovimentacao.atendimento
    return OrigemMovimentacao.ajuste_manual
  }

  let movIdx = 0
  for (const [prodMockId, movs] of Object.entries(movimentacoesProduto)) {
    const pid = ID.produto[prodMockId as keyof typeof ID.produto]
    let estoqueAcum = 0
    for (const mov of movs) {
      const estoqueAntes = estoqueAcum
      const delta = mov.tipo === 'entrada' ? mov.qtd : -mov.qtd
      estoqueAcum += delta
      const movId = `a000000f-0000-4000-8000-${String(++movIdx).padStart(12, '0')}`
      await db.movimentacaoEstoque.upsert({
        where: { id: movId },
        update: {},
        create: {
          id: movId,
          produtoId: pid,
          tipo:
            mov.tipo === 'entrada'
              ? TipoMovimentacaoEstoque.entrada
              : mov.tipo === 'saida'
                ? TipoMovimentacaoEstoque.saida
                : TipoMovimentacaoEstoque.ajuste,
          origem: obsToOrigem(mov.obs),
          quantidade: mov.qtd,
          estoqueAntes,
          estoqueDepois: estoqueAcum,
          observacao: mov.obs,
          createdAt: new Date(`${mov.data}T12:00:00Z`),
        },
      })
    }
  }
  console.log('  ✓ MovimentacoesEstoque')

  // 15. Atendimentos (a partir de historicoPorCliente)
  let atdIdx = 0
  for (const [clienteMockId, historico] of Object.entries(historicoPorCliente)) {
    const cid = ID.cliente[clienteMockId]
    for (const h of historico) {
      const bid = barbeiroPorNome[h.barbeiro]
      if (!bid) continue
      const atdId = `a000000a-0000-4000-8000-${String(++atdIdx).padStart(12, '0')}`
      const comissao = (h.valor * (comissaoPorBarbeiro[bid] ?? 50)) / 100
      await db.atendimento.upsert({
        where: { id: atdId },
        update: {},
        create: {
          id: atdId,
          barbeariaId: ID.barbearia,
          barbeiroId: bid,
          clienteId: cid,
          valorBruto: h.valor,
          formaPagamento: FormaPagamento.pix,
          comissaoCalculada: comissao,
          avaliacaoNota: h.avaliacao?.nota ?? null,
          avaliacaoComentario: h.avaliacao?.comentario ?? null,
          avaliacaoEm: h.avaliacao ? new Date(`${h.data}T18:00:00Z`) : null,
          finalizadoEm: new Date(`${h.data}T18:00:00Z`),
          createdAt: new Date(`${h.data}T18:00:00Z`),
        },
      })
    }
  }
  console.log(`  ✓ Atendimentos (${atdIdx})`)

  // 16. Comunicados
  for (const com of mockComunicados) {
    const comId = ID.comunicado[com.id]
    await db.comunicado.upsert({
      where: { id: comId },
      update: {},
      create: {
        id: comId,
        barbeariaId: ID.barbearia,
        autorId: ID.usuario.caio,
        titulo: com.titulo,
        corpo: com.corpo,
        createdAt: new Date(com.criadoEm),
      },
    })
  }
  console.log('  ✓ Comunicados (3)')

  // 17. ComunicadoLeitura
  await db.comunicadoLeitura.deleteMany({ where: { comunicado: { barbeariaId: ID.barbearia } } })
  for (const com of mockComunicados) {
    for (const bMockId of com.lidoPor) {
      const bid = ID.barbeiro[bMockId as keyof typeof ID.barbeiro]
      if (!bid) continue
      await db.comunicadoLeitura.create({
        data: { comunicadoId: ID.comunicado[com.id], barbeiroId: bid },
      })
    }
  }
  console.log('  ✓ ComunicadoLeitura')

  console.log('\n✅ Seed concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

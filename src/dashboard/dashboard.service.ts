import { Injectable } from '@nestjs/common'
import { Prisma, StatusAgendamento } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

/**
 * Agrega, em uma única resposta, tudo o que o dashboard do frontend consome.
 * O front montava esses blocos a partir de mocks (dashboardHoje, receita14d,
 * heatmapSemanaPassada, topServicosSemana, getPodiumMetrics, getLiveBarbers);
 * aqui eles são calculados dinamicamente a partir do banco.
 *
 * Datas/horas no banco usam UTC (Date = meia-noite UTC, Time = 1970-01-01THH:MM:00Z),
 * então toda a aritmética de dia/hora é feita em UTC para casar com o que foi gravado.
 */

const DIAS: { key: string; label: string }[] = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
]
// dom..sab → índice de DIAS (dom não aparece no heatmap)
const WEEKDAY_TO_DIA = [-1, 0, 1, 2, 3, 4, 5]
// Horário comercial exibido no heatmap (10h às 20h)
const HEATMAP_HORAS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

// Status que efetivamente ocupam a cadeira (para cálculo de ocupação)
const STATUS_OCUPA: StatusAgendamento[] = [
  StatusAgendamento.confirmado,
  StatusAgendamento.aguardando,
  StatusAgendamento.em_cadeira,
  StatusAgendamento.concluido,
  StatusAgendamento.bloqueado,
  StatusAgendamento.encaixe,
]

type Decimalish = Prisma.Decimal | number | string | null | undefined

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getResumo(barbeariaId: string, dataParam?: string) {
    const ref = this.refDate(dataParam)
    const hojeDate = this.startOfDayUTC(ref)
    const ontemDate = this.addDays(hojeDate, -1)

    const [hoje, receita14d, heatmapSemanaPassada, topServicosSemana, podium, liveBarbers] =
      await Promise.all([
        this.getHoje(barbeariaId, hojeDate, ontemDate),
        this.getReceita14d(barbeariaId, hojeDate),
        this.getHeatmapSemanaPassada(barbeariaId, hojeDate),
        this.getTopServicos(barbeariaId, hojeDate),
        this.getPodium(barbeariaId, hojeDate),
        this.getLiveBarbers(barbeariaId, hojeDate),
      ])

    return {
      dataReferencia: this.dayKey(hojeDate),
      hoje,
      receita14d,
      heatmapSemanaPassada,
      topServicosSemana,
      podium,
      liveBarbers,
    }
  }

  // ---- Bloco "hoje": faturamento, KPIs e formas de pagamento ----
  private async getHoje(barbeariaId: string, hoje: Date, ontem: Date) {
    const [barbearia, caixaHoje, caixaOntem, agsHoje, jornadasHoje] = await Promise.all([
      this.prisma.barbearia.findUnique({
        where: { id: barbeariaId },
        select: { metaDiaria: true },
      }),
      this.prisma.caixa.findUnique({ where: { barbeariaId_data: { barbeariaId, data: hoje } } }),
      this.prisma.caixa.findUnique({ where: { barbeariaId_data: { barbeariaId, data: ontem } } }),
      this.prisma.agendamento.findMany({
        where: { barbeariaId, data: hoje },
        select: { status: true, inicio: true, fim: true },
      }),
      this.prisma.jornadaBarbeiro.findMany({
        where: {
          tipo: 'trabalha',
          diaSemana: this.diaSemanaEnum(hoje),
          barbeiro: { barbeariaId, ativo: true },
        },
        select: { inicio: true, fim: true },
      }),
    ])

    // Receita e formas: a fonte de verdade é o caixa do dia (totais consolidados);
    // sem caixa aberto, soma os atendimentos finalizados no dia.
    let receita: number
    let formas: { pix: number; credito: number; debito: number; dinheiro: number }
    let totalAtendimentos: number

    if (caixaHoje) {
      receita = this.num(caixaHoje.totalBruto)
      formas = {
        pix: this.num(caixaHoje.totalPix),
        credito: this.num(caixaHoje.totalCredito),
        debito: this.num(caixaHoje.totalDebito),
        dinheiro: this.num(caixaHoje.totalDinheiro),
      }
      totalAtendimentos = caixaHoje.totalAtendimentos
    } else {
      const agg = await this.prisma.atendimento.groupBy({
        by: ['formaPagamento'],
        where: { barbeariaId, finalizadoEm: this.dayRange(hoje) },
        _sum: { valorBruto: true },
        _count: { _all: true },
      })
      formas = { pix: 0, credito: 0, debito: 0, dinheiro: 0 }
      receita = 0
      totalAtendimentos = 0
      for (const row of agg) {
        const valor = this.num(row._sum.valorBruto)
        formas[row.formaPagamento] = valor
        receita += valor
        totalAtendimentos += row._count._all
      }
    }

    const receitaOntem = caixaOntem
      ? this.num(caixaOntem.totalBruto)
      : this.num(
          (
            await this.prisma.atendimento.aggregate({
              where: { barbeariaId, finalizadoEm: this.dayRange(ontem) },
              _sum: { valorBruto: true },
            })
          )._sum.valorBruto,
        )

    // Contagens operacionais a partir da agenda do dia
    const atendimentos = {
      concluidos: agsHoje.filter((a) => a.status === StatusAgendamento.concluido).length,
      emCadeira: agsHoje.filter((a) => a.status === StatusAgendamento.em_cadeira).length,
      futuros: agsHoje.filter(
        (a) =>
          a.status === StatusAgendamento.confirmado ||
          a.status === StatusAgendamento.aguardando ||
          a.status === StatusAgendamento.encaixe,
      ).length,
      bloqueados: agsHoje.filter((a) => a.status === StatusAgendamento.bloqueado).length,
    }

    // Ocupação = minutos ocupados / minutos disponíveis na jornada de hoje
    const minutosDisponiveis = jornadasHoje.reduce(
      (acc, j) => acc + this.minutosEntre(j.inicio, j.fim),
      0,
    )
    const minutosOcupados = agsHoje
      .filter((a) => STATUS_OCUPA.includes(a.status))
      .reduce((acc, a) => acc + this.minutosEntre(a.inicio, a.fim), 0)
    const ocupacao = minutosDisponiveis > 0 ? Math.min(1, minutosOcupados / minutosDisponiveis) : 0

    const ticketMedio = totalAtendimentos > 0 ? Math.round(receita / totalAtendimentos) : 0

    return {
      receita,
      receitaMeta: this.num(barbearia?.metaDiaria),
      receitaOntem,
      atendimentos,
      ocupacao: Number(ocupacao.toFixed(2)),
      ticketMedio,
      caixaAberto: !!caixaHoje && !caixaHoje.fechadoEm,
      formas,
    }
  }

  // ---- Faturamento dos últimos 14 dias ----
  private async getReceita14d(barbeariaId: string, hoje: Date) {
    const inicio = this.addDays(hoje, -13)
    const [caixas, atendimentos] = await Promise.all([
      this.prisma.caixa.findMany({
        where: { barbeariaId, data: { gte: inicio, lte: hoje } },
        select: { data: true, totalBruto: true, totalAtendimentos: true },
      }),
      this.prisma.atendimento.findMany({
        where: { barbeariaId, finalizadoEm: { gte: inicio, lt: this.addDays(hoje, 1) } },
        select: { finalizadoEm: true, valorBruto: true },
      }),
    ])

    const caixaPorDia = new Map(caixas.map((c) => [this.dayKey(c.data), c]))
    const atdPorDia = new Map<string, { v: number; n: number }>()
    for (const a of atendimentos) {
      const k = this.dayKey(a.finalizadoEm)
      const cur = atdPorDia.get(k) ?? { v: 0, n: 0 }
      cur.v += this.num(a.valorBruto)
      cur.n += 1
      atdPorDia.set(k, cur)
    }

    const dias: { d: string; v: number; n: number }[] = []
    for (let i = 0; i < 14; i++) {
      const dia = this.addDays(inicio, i)
      const key = this.dayKey(dia)
      const caixa = caixaPorDia.get(key)
      const atd = atdPorDia.get(key)
      dias.push({
        d: this.labelDiaMes(dia),
        v: caixa ? this.num(caixa.totalBruto) : (atd?.v ?? 0),
        n: caixa ? caixa.totalAtendimentos : (atd?.n ?? 0),
      })
    }
    return dias
  }

  // ---- Mapa de ocupação da semana anterior (dia da semana x hora) ----
  private async getHeatmapSemanaPassada(barbeariaId: string, hoje: Date) {
    const fim = this.addDays(hoje, -1)
    const inicio = this.addDays(hoje, -7)
    const ags = await this.prisma.agendamento.findMany({
      where: { barbeariaId, data: { gte: inicio, lte: fim }, status: { in: STATUS_OCUPA } },
      select: { data: true, inicio: true },
    })

    // grade[dia][hora] = contagem
    const grade = DIAS.map(() => HEATMAP_HORAS.map(() => 0))
    for (const a of ags) {
      const diaIdx = WEEKDAY_TO_DIA[a.data.getUTCDay()]
      if (diaIdx < 0) continue
      const horaIdx = HEATMAP_HORAS.indexOf(a.inicio.getUTCHours())
      if (horaIdx < 0) continue
      grade[diaIdx][horaIdx] += 1
    }

    const max = Math.max(1, ...grade.flat())
    return DIAS.map((d, i) => ({
      day: d.label,
      cells: grade[i].map((c) => Number((c / max).toFixed(2))),
    }))
  }

  // ---- Top serviços dos últimos 7 dias ----
  private async getTopServicos(barbeariaId: string, hoje: Date) {
    const inicio = this.addDays(hoje, -6)
    const ags = await this.prisma.agendamento.findMany({
      where: {
        barbeariaId,
        data: { gte: inicio, lte: hoje },
        status: StatusAgendamento.concluido,
        servicoId: { not: null },
      },
      select: { precoSnapshot: true, servico: { select: { slug: true, nome: true } } },
    })

    const acc = new Map<string, { id: string; nome: string; count: number; receita: number }>()
    for (const a of ags) {
      if (!a.servico) continue
      const cur = acc.get(a.servico.slug) ?? {
        id: a.servico.slug,
        nome: a.servico.nome,
        count: 0,
        receita: 0,
      }
      cur.count += 1
      cur.receita += this.num(a.precoSnapshot)
      acc.set(a.servico.slug, cur)
    }

    return [...acc.values()].sort((a, b) => b.receita - a.receita).slice(0, 6)
  }

  // ---- Ranking do mês (pódio): receita, meta, atendimentos e avaliação ----
  private async getPodium(barbeariaId: string, hoje: Date) {
    const mesInicio = this.startOfMonthUTC(hoje)
    const mesFim = this.startOfMonthUTC(this.addDays(this.endOfMonthUTC(hoje), 1))

    const [barbeiros, somas, avaliacoes] = await Promise.all([
      this.prisma.barbeiro.findMany({
        where: { barbeariaId, ativo: true },
        select: this.barbeiroSelect(),
      }),
      this.prisma.atendimento.groupBy({
        by: ['barbeiroId'],
        where: { barbeariaId, finalizadoEm: { gte: mesInicio, lt: mesFim } },
        _sum: { valorBruto: true },
        _count: { _all: true },
      }),
      this.prisma.atendimento.groupBy({
        by: ['barbeiroId'],
        where: {
          barbeariaId,
          finalizadoEm: { gte: mesInicio, lt: mesFim },
          avaliacaoNota: { not: null },
        },
        _avg: { avaliacaoNota: true },
      }),
    ])

    const somaPorBarbeiro = new Map(somas.map((s) => [s.barbeiroId, s]))
    const avgPorBarbeiro = new Map(avaliacoes.map((a) => [a.barbeiroId, a._avg.avaliacaoNota]))

    return barbeiros
      .map((b) => {
        const soma = somaPorBarbeiro.get(b.id)
        const avgMes = avgPorBarbeiro.get(b.id)
        return {
          barbeiro: this.mapBarbeiro(b),
          receita: this.num(soma?._sum.valorBruto),
          meta: this.num(b.metaMensal),
          atendimentos: soma?._count._all ?? 0,
          avaliacao: avgMes != null ? Number(avgMes.toFixed(2)) : this.num(b.avaliacaoMedia),
        }
      })
      .sort((a, b) => b.receita - a.receita)
  }

  // ---- "Agora na barbearia": barbeiro atual e próximo cliente ----
  private async getLiveBarbers(barbeariaId: string, hoje: Date) {
    const [barbeiros, ags] = await Promise.all([
      this.prisma.barbeiro.findMany({
        where: { barbeariaId, ativo: true },
        select: this.barbeiroSelect(),
      }),
      this.prisma.agendamento.findMany({
        where: { barbeariaId, data: hoje },
        select: {
          barbeiroId: true,
          status: true,
          inicio: true,
          fim: true,
          cliente: { select: { id: true, nome: true } },
        },
        orderBy: { inicio: 'asc' },
      }),
    ])

    return barbeiros.map((b) => {
      const doBarbeiro = ags.filter((a) => a.barbeiroId === b.id)
      const atual = doBarbeiro.find((a) => a.status === StatusAgendamento.em_cadeira) ?? null
      const proximo =
        doBarbeiro.find(
          (a) =>
            a.status === StatusAgendamento.confirmado || a.status === StatusAgendamento.aguardando,
        ) ?? null

      return {
        barbeiro: this.mapBarbeiro(b),
        emCadeira: !!atual,
        atual: atual
          ? { inicio: this.horaLabel(atual.inicio), fim: this.horaLabel(atual.fim) }
          : null,
        proximo: proximo
          ? { inicio: this.horaLabel(proximo.inicio), fim: this.horaLabel(proximo.fim) }
          : null,
        clienteAtual: atual?.cliente ?? null,
        clienteProximo: proximo?.cliente ?? null,
      }
    })
  }

  // ---------- helpers ----------

  private barbeiroSelect() {
    return {
      id: true,
      nome: true,
      apelido: true,
      iniciais: true,
      papel: true,
      fotoUrl: true,
      tomDePele: true,
      anosDeOficio: true,
      avaliacaoMedia: true,
      totalAvaliacoes: true,
      especialidades: true,
      comissaoPercentual: true,
      metaMensal: true,
      ativo: true,
    } satisfies Prisma.BarbeiroSelect
  }

  private mapBarbeiro(b: {
    id: string
    nome: string
    apelido: string
    iniciais: string
    papel: string | null
    fotoUrl: string | null
    tomDePele: string | null
    anosDeOficio: number
    avaliacaoMedia: Prisma.Decimal
    totalAvaliacoes: number
    especialidades: string[]
    comissaoPercentual: Prisma.Decimal
  }) {
    return {
      id: b.id,
      nome: b.nome,
      apelido: b.apelido,
      iniciais: b.iniciais,
      papel: b.papel,
      foto: b.fotoUrl,
      tomDePele: b.tomDePele,
      anosDeOficio: b.anosDeOficio,
      avaliacaoMedia: this.num(b.avaliacaoMedia),
      totalAvaliacoes: b.totalAvaliacoes,
      especialidades: b.especialidades,
      comissaoPercentual: this.num(b.comissaoPercentual),
    }
  }

  private num(v: Decimalish): number {
    return v == null ? 0 : Number(v)
  }

  private refDate(dataParam?: string): Date {
    if (dataParam) return new Date(`${dataParam.slice(0, 10)}T00:00:00.000Z`)
    return new Date()
  }

  private startOfDayUTC(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  }

  private addDays(d: Date, days: number): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days))
  }

  private startOfMonthUTC(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
  }

  private endOfMonthUTC(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
  }

  /** Intervalo [00:00, 24:00) do dia, para colunas timestamptz. */
  private dayRange(d: Date) {
    return { gte: this.startOfDayUTC(d), lt: this.addDays(d, 1) }
  }

  private dayKey(d: Date): string {
    return d.toISOString().slice(0, 10)
  }

  private labelDiaMes(d: Date): string {
    const dd = String(d.getUTCDate()).padStart(2, '0')
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}`
  }

  private horaLabel(time: Date): string {
    const hh = String(time.getUTCHours()).padStart(2, '0')
    const mm = String(time.getUTCMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }

  private minutosEntre(inicio: Date | null, fim: Date | null): number {
    if (!inicio || !fim) return 0
    return Math.max(0, (fim.getTime() - inicio.getTime()) / 60000)
  }

  private diaSemanaEnum(d: Date) {
    const map = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const
    return map[d.getUTCDay()]
  }
}

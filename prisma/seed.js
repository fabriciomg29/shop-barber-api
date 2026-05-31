"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcrypt"));
const data_1 = require("../mocks/seeds/data");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new client_1.PrismaClient({ adapter });
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
    },
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
    },
    produto: {
        p1: 'a0000007-0000-4000-8000-000000000001',
        p2: 'a0000007-0000-4000-8000-000000000002',
        p3: 'a0000007-0000-4000-8000-000000000003',
        p4: 'a0000007-0000-4000-8000-000000000004',
        p5: 'a0000007-0000-4000-8000-000000000005',
        p6: 'a0000007-0000-4000-8000-000000000006',
        p7: 'a0000007-0000-4000-8000-000000000007',
        p8: 'a0000007-0000-4000-8000-000000000008',
    },
    caixa: 'a0000008-0000-4000-8000-000000000001',
    agendamento: {},
    comunicado: {
        'com-1': 'a000000c-0000-4000-8000-000000000001',
        'com-2': 'a000000c-0000-4000-8000-000000000002',
        'com-3': 'a000000c-0000-4000-8000-000000000003',
    },
};
data_1.agendamentos.forEach((a, i) => {
    ID.agendamento[a.id] = `a0000009-0000-4000-8000-${String(i + 1).padStart(12, '0')}`;
});
function toTime(hhmm) {
    return new Date(`1970-01-01T${hhmm}:00Z`);
}
function toDate(yyyy_mm_dd) {
    return new Date(`${yyyy_mm_dd}T00:00:00Z`);
}
const DIA_MAP = {
    dom: client_1.DiaSemana.dom,
    seg: client_1.DiaSemana.seg,
    ter: client_1.DiaSemana.ter,
    qua: client_1.DiaSemana.qua,
    qui: client_1.DiaSemana.qui,
    sex: client_1.DiaSemana.sex,
    sab: client_1.DiaSemana.sab,
};
const tokenPorCliente = Object.fromEntries(Object.entries(data_1.tokenCliente).map(([token, clienteId]) => [clienteId, token]));
const barbeiroPorNome = {
    'Caio Bertelli': ID.barbeiro.caio,
    'Murilo Santos': ID.barbeiro.murilo,
    'Diego Moura': ID.barbeiro.diego,
    'Ravi Castro': ID.barbeiro.ravi,
};
const comissaoPorBarbeiro = {
    [ID.barbeiro.caio]: 60,
    [ID.barbeiro.murilo]: 55,
    [ID.barbeiro.diego]: 50,
    [ID.barbeiro.ravi]: 45,
};
async function main() {
    console.log('🌱 Iniciando seed...');
    await db.barbearia.upsert({
        where: { id: ID.barbearia },
        update: {},
        create: {
            id: ID.barbearia,
            nome: data_1.barbearia.nome,
            endereco: data_1.barbearia.endereco,
            cidade: data_1.barbearia.cidade,
            telefone: data_1.barbearia.telefone,
            instagram: data_1.barbearia.instagram,
            cancelamentoMinHoras: data_1.barbearia.regrasAgendamento.cancelamentoMinHoras,
            remarcacaoMinHoras: data_1.barbearia.regrasAgendamento.remarcacaoMinHoras,
            lembreteWhatsappHoras: data_1.barbearia.regrasAgendamento.lembreteWhatsappHoras,
            fidelidadeSelosNecessarios: data_1.barbearia.configFidelidade.selosNecessarios,
            fidelidadeRecompensa: data_1.barbearia.configFidelidade.recompensa,
            fidelidadeDiasInatividade: data_1.barbearia.configFidelidade.diasParaInatividade,
            metaDiaria: data_1.barbearia.meta.diaria,
            metaMensal: data_1.barbearia.meta.mensal,
            horariosFuncionamento: data_1.barbearia.horariosFuncionamento,
        },
    });
    console.log('  ✓ Barbearia');
    const senhaHash = await bcrypt.hash('123456', 10);
    await db.usuario.upsert({
        where: { id: ID.usuario.caio },
        update: { senhaHash },
        create: {
            id: ID.usuario.caio,
            barbeariaId: ID.barbearia,
            email: 'caio@ibirama.com',
            senhaHash,
            nome: 'Caio Bertelli',
            role: client_1.RoleUsuario.dono,
        },
    });
    console.log('  ✓ Usuario');
    for (const b of data_1.barbeiros) {
        const bid = ID.barbeiro[b.id];
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
        });
    }
    console.log('  ✓ Barbeiros (4)');
    for (const s of data_1.servicos) {
        const sid = ID.servico[s.id];
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
        });
    }
    console.log('  ✓ Serviços (7)');
    await db.barbeiroServico.deleteMany({ where: { barbeiro: { barbeariaId: ID.barbearia } } });
    for (const b of data_1.barbeiros) {
        const bid = ID.barbeiro[b.id];
        for (const sSlug of b.servicosExecuta) {
            const sid = ID.servico[sSlug];
            if (!sid)
                continue;
            await db.barbeiroServico.create({ data: { barbeiroId: bid, servicoId: sid } });
        }
    }
    console.log('  ✓ BarbeiroServico (20)');
    await db.jornadaBarbeiro.deleteMany({ where: { barbeiro: { barbeariaId: ID.barbearia } } });
    for (const b of data_1.barbeiros) {
        const bid = ID.barbeiro[b.id];
        for (const [dia, jornada] of Object.entries(b.jornada)) {
            await db.jornadaBarbeiro.create({
                data: {
                    barbeiroId: bid,
                    diaSemana: DIA_MAP[dia],
                    tipo: jornada.tipo === 'trabalha' ? client_1.JornadaTipo.trabalha : client_1.JornadaTipo.off,
                    inicio: jornada.tipo === 'trabalha' ? toTime(jornada.inicio) : null,
                    fim: jornada.tipo === 'trabalha' ? toTime(jornada.fim) : null,
                },
            });
        }
    }
    console.log('  ✓ JornadaBarbeiro (28)');
    const fornecedoresUnicos = Array.from(new Set(data_1.produtos.map((p) => p.fornecedor)));
    for (const nome of fornecedoresUnicos) {
        const fid = ID.fornecedor[nome];
        if (!fid)
            continue;
        await db.fornecedor.upsert({
            where: { id: fid },
            update: {},
            create: { id: fid, barbeariaId: ID.barbearia, nome },
        });
    }
    console.log('  ✓ Fornecedores (4)');
    for (const p of data_1.produtos) {
        const pid = ID.produto[p.id];
        const fid = ID.fornecedor[p.fornecedor];
        await db.produto.upsert({
            where: { id: pid },
            update: {},
            create: {
                id: pid,
                barbeariaId: ID.barbearia,
                fornecedorId: fid ?? null,
                nome: p.nome,
                marca: p.marca,
                tipo: p.precoVenda != null ? client_1.TipoProduto.venda : client_1.TipoProduto.insumo,
                consumivel: p.consumivel,
                estoqueAtual: p.estoque,
                estoqueMinimo: p.estoqueMinimo,
                precoCusto: p.precoCusto,
                precoVenda: p.precoVenda ?? null,
                ultimaCompra: p.ultimaCompra ? toDate(p.ultimaCompra) : null,
                ativo: p.ativo,
            },
        });
    }
    console.log('  ✓ Produtos (8)');
    for (const c of data_1.clientes) {
        const cid = ID.cliente[c.id];
        const prefId = c.barbeiroPreferidoId
            ? ID.barbeiro[c.barbeiroPreferidoId]
            : null;
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
        });
    }
    console.log('  ✓ Clientes (12)');
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
    });
    console.log('  ✓ Caixa');
    const ORIGEM_MAP = {
        cliente_online: client_1.OrigemAgendamento.cliente_online,
        tablet: client_1.OrigemAgendamento.tablet,
        encaixe: client_1.OrigemAgendamento.encaixe,
        recorrencia: client_1.OrigemAgendamento.recorrencia,
    };
    const STATUS_MAP = {
        confirmado: client_1.StatusAgendamento.confirmado,
        aguardando: client_1.StatusAgendamento.aguardando,
        em_cadeira: client_1.StatusAgendamento.em_cadeira,
        concluido: client_1.StatusAgendamento.concluido,
        bloqueado: client_1.StatusAgendamento.bloqueado,
        nao_compareceu: client_1.StatusAgendamento.nao_compareceu,
        encaixe: client_1.StatusAgendamento.encaixe,
    };
    for (const a of data_1.agendamentos) {
        const aid = ID.agendamento[a.id];
        const bid = ID.barbeiro[a.barbeiroId];
        const cid = a.clienteId ? ID.cliente[a.clienteId] : null;
        const sid = a.servicoId ? ID.servico[a.servicoId] : null;
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
        });
    }
    console.log('  ✓ Agendamentos (27)');
    for (const e of data_1.encaixes) {
        const sid = ID.servico[e.servicoId];
        await db.encaixe.upsert({
            where: { id: `a000000e-0000-4000-8000-00000000000${e.id.replace('w', '')}` },
            update: {},
            create: {
                id: `a000000e-0000-4000-8000-00000000000${e.id.replace('w', '')}`,
                barbeariaId: ID.barbearia,
                clienteNome: e.clienteNome,
                telefone: e.telefone,
                servicoId: sid,
                status: client_1.StatusEncaixe.aguardando,
                posicao: e.posicao,
                estimativaMin: e.estimativaMin,
                chegouEm: new Date(e.chegouEm),
            },
        });
    }
    console.log('  ✓ Encaixes (2)');
    const ORIGEM_CI_MAP = {
        app: client_1.OrigemCheckIn.app,
        tablet: client_1.OrigemCheckIn.tablet,
        manual: client_1.OrigemCheckIn.manual,
    };
    for (const [bId, ponto] of Object.entries(data_1.pontoDia)) {
        if (!ponto)
            continue;
        const bid = ID.barbeiro[bId];
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
        });
    }
    console.log('  ✓ PontoDia (3)');
    const ORIGEM_MOV_MAP = {
        compra: client_1.OrigemMovimentacao.compra,
        venda_avulsa: client_1.OrigemMovimentacao.venda_avulsa,
        atendimento: client_1.OrigemMovimentacao.atendimento,
        ajuste_manual: client_1.OrigemMovimentacao.ajuste_manual,
    };
    function obsToOrigem(obs) {
        if (obs.startsWith('Compra'))
            return client_1.OrigemMovimentacao.compra;
        if (obs.includes('Venda avulsa'))
            return client_1.OrigemMovimentacao.venda_avulsa;
        if (obs.includes('Consumo'))
            return client_1.OrigemMovimentacao.atendimento;
        return client_1.OrigemMovimentacao.ajuste_manual;
    }
    let movIdx = 0;
    for (const [prodMockId, movs] of Object.entries(data_1.movimentacoesProduto)) {
        const pid = ID.produto[prodMockId];
        let estoqueAcum = 0;
        for (const mov of movs) {
            const estoqueAntes = estoqueAcum;
            const delta = mov.tipo === 'entrada' ? mov.qtd : -mov.qtd;
            estoqueAcum += delta;
            const movId = `a000000f-0000-4000-8000-${String(++movIdx).padStart(12, '0')}`;
            await db.movimentacaoEstoque.upsert({
                where: { id: movId },
                update: {},
                create: {
                    id: movId,
                    produtoId: pid,
                    tipo: mov.tipo === 'entrada'
                        ? client_1.TipoMovimentacaoEstoque.entrada
                        : mov.tipo === 'saida'
                            ? client_1.TipoMovimentacaoEstoque.saida
                            : client_1.TipoMovimentacaoEstoque.ajuste,
                    origem: obsToOrigem(mov.obs),
                    quantidade: mov.qtd,
                    estoqueAntes,
                    estoqueDepois: estoqueAcum,
                    observacao: mov.obs,
                    createdAt: new Date(`${mov.data}T12:00:00Z`),
                },
            });
        }
    }
    console.log('  ✓ MovimentacoesEstoque');
    let atdIdx = 0;
    for (const [clienteMockId, historico] of Object.entries(data_1.historicoPorCliente)) {
        const cid = ID.cliente[clienteMockId];
        for (const h of historico) {
            const bid = barbeiroPorNome[h.barbeiro];
            if (!bid)
                continue;
            const atdId = `a000000a-0000-4000-8000-${String(++atdIdx).padStart(12, '0')}`;
            const comissao = (h.valor * (comissaoPorBarbeiro[bid] ?? 50)) / 100;
            await db.atendimento.upsert({
                where: { id: atdId },
                update: {},
                create: {
                    id: atdId,
                    barbeariaId: ID.barbearia,
                    barbeiroId: bid,
                    clienteId: cid,
                    valorBruto: h.valor,
                    formaPagamento: client_1.FormaPagamento.pix,
                    comissaoCalculada: comissao,
                    avaliacaoNota: h.avaliacao?.nota ?? null,
                    avaliacaoComentario: h.avaliacao?.comentario ?? null,
                    avaliacaoEm: h.avaliacao ? new Date(`${h.data}T18:00:00Z`) : null,
                    finalizadoEm: new Date(`${h.data}T18:00:00Z`),
                    createdAt: new Date(`${h.data}T18:00:00Z`),
                },
            });
        }
    }
    console.log(`  ✓ Atendimentos (${atdIdx})`);
    for (const com of data_1.comunicados) {
        const comId = ID.comunicado[com.id];
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
        });
    }
    console.log('  ✓ Comunicados (3)');
    await db.comunicadoLeitura.deleteMany({ where: { comunicado: { barbeariaId: ID.barbearia } } });
    for (const com of data_1.comunicados) {
        for (const bMockId of com.lidoPor) {
            const bid = ID.barbeiro[bMockId];
            if (!bid)
                continue;
            await db.comunicadoLeitura.create({
                data: { comunicadoId: ID.comunicado[com.id], barbeiroId: bid },
            });
        }
    }
    console.log('  ✓ ComunicadoLeitura');
    console.log('\n✅ Seed concluído!');
}
main()
    .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
})
    .finally(() => db.$disconnect());

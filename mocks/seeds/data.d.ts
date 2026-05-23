import type { Barbeiro, Servico, Cliente, Agendamento, Encaixe, Produto, Barbearia } from '../../libs/types';
export declare const barbearia: Barbearia;
export declare const barbeiros: Barbeiro[];
export declare const servicos: Servico[];
export declare const clientes: Cliente[];
export declare const tokenCliente: Record<string, string>;
export declare const historicoPorCliente: Record<string, {
    data: string;
    servico: string;
    barbeiro: string;
    valor: number;
    avaliacao?: {
        nota: number;
        comentario?: string;
    };
}[]>;
export declare const agendamentos: Agendamento[];
export declare const encaixes: Encaixe[];
export declare const produtos: Produto[];
export declare const movimentacoesProduto: Record<string, {
    data: string;
    tipo: 'entrada' | 'saida' | 'ajuste';
    qtd: number;
    obs: string;
}[]>;
export declare const dashboardHoje: {
    receita: number;
    receitaMeta: number;
    receitaOntem: number;
    receitaUltimaQuinta: number;
    atendimentos: {
        concluidos: number;
        emCadeira: number;
        futuros: number;
        bloqueados: number;
    };
    ocupacao: number;
    ticketMedio: number;
    gorjetas: number;
    novosClientes: number;
    caixaAberto: boolean;
    caixaAbertoEm: string;
    formas: {
        pix: number;
        credito: number;
        debito: number;
        dinheiro: number;
    };
};
export declare const receita14d: {
    d: string;
    v: number;
    n: number;
}[];
export declare const metricasBarbeiros: {
    caio: {
        receita: number;
        atendimentos: number;
        comissao: number;
        avaliacao: number;
        meta: number;
        gorjetas: number;
    };
    murilo: {
        receita: number;
        atendimentos: number;
        comissao: number;
        avaliacao: number;
        meta: number;
        gorjetas: number;
    };
    diego: {
        receita: number;
        atendimentos: number;
        comissao: number;
        avaliacao: number;
        meta: number;
        gorjetas: number;
    };
    ravi: {
        receita: number;
        atendimentos: number;
        comissao: number;
        avaliacao: number;
        meta: number;
        gorjetas: number;
    };
};
export declare const heatmapSemanaPassada: {
    day: string;
    cells: number[];
}[];
export declare const pontoDia: Record<string, {
    checkIn?: string;
    checkOut?: string;
    origemCheckIn: 'app' | 'tablet' | 'manual';
} | null>;
export declare const comunicados: {
    id: string;
    autorId: string;
    autorNome: string;
    titulo: string;
    corpo: string;
    criadoEm: string;
    lidoPor: string[];
}[];
export declare const comissoesMesAtual: {
    caio: {
        faturamentoBruto: number;
        comissaoBruta: number;
        jaPago: number;
        saldoPendente: number;
        gorjetas: number;
        atendimentos: number;
    };
    murilo: {
        faturamentoBruto: number;
        comissaoBruta: number;
        jaPago: number;
        saldoPendente: number;
        gorjetas: number;
        atendimentos: number;
    };
    diego: {
        faturamentoBruto: number;
        comissaoBruta: number;
        jaPago: number;
        saldoPendente: number;
        gorjetas: number;
        atendimentos: number;
    };
    ravi: {
        faturamentoBruto: number;
        comissaoBruta: number;
        jaPago: number;
        saldoPendente: number;
        gorjetas: number;
        atendimentos: number;
    };
};
export declare const pagamentosHistoricoComissao: Record<string, {
    data: string;
    forma: string;
    valor: number;
}[]>;
export declare const topServicosSemana: {
    id: string;
    nome: string;
    count: number;
    receita: number;
}[];

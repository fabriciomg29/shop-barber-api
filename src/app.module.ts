import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { BarbeariaModule } from './barbearia/barbearia.module'
import { UsuarioModule } from './usuario/usuario.module'
import { BarbeiroModule } from './barbeiro/barbeiro.module'
import { ServicoModule } from './servico/servico.module'
import { ClienteModule } from './cliente/cliente.module'
import { AgendamentoModule } from './agendamento/agendamento.module'
import { AtendimentoModule } from './atendimento/atendimento.module'
import { EstoqueModule } from './estoque/estoque.module'
import { FinanceiroModule } from './financeiro/financeiro.module'
import { ComunicadoModule } from './comunicado/comunicado.module'
import { NotificacaoModule } from './notificacao/notificacao.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BarbeariaModule,
    UsuarioModule,
    BarbeiroModule,
    ServicoModule,
    ClienteModule,
    AgendamentoModule,
    AtendimentoModule,
    EstoqueModule,
    FinanceiroModule,
    ComunicadoModule,
    NotificacaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

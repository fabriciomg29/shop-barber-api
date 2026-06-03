import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'
import { RolesGuard } from './auth/guards/roles.guard'
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
import { DashboardModule } from './dashboard/dashboard.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
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
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

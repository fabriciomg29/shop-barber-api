import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME', 'postgres'),
        ssl: config.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: false,
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
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
